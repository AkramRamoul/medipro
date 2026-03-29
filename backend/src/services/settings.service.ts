import { db, sqlite, reinitializeDb } from '../db';
import { prescriptionModel, image } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { createClient } from '@libsql/client';

export class SettingsService {
    async getPrescriptionModel() {
        const [model] = await db.select().from(prescriptionModel).limit(1);
        if (!model) return null;

        // Parse services back to array for frontend
        return {
            ...model,
            services: this.parseServices(model.servicesFr, model.servicesAr)
        };
    }

    private parseServices(frJson: string | null, arJson: string | null) {
        try {
            const fr = JSON.parse(frJson || '[]');
            const ar = JSON.parse(arJson || '[]');
            return fr.map((f: string, i: number) => ({ fr: f, ar: ar[i] || '' }));
        } catch (e) {
            return [];
        }
    }

    async savePrescriptionModel(data: any) {
        const servicesFr = JSON.stringify(data.services.map((s: any) => s.fr));
        const servicesAr = JSON.stringify(data.services.map((s: any) => s.ar));

        const modelData = {
            ...data,
            servicesFr,
            servicesAr,
        };
        delete modelData.services;

        const existing = await db.select().from(prescriptionModel).limit(1);
        if (existing.length === 0) {
            await db.insert(prescriptionModel).values(modelData);
        } else {
            await db.update(prescriptionModel).set(modelData).where(eq(prescriptionModel.id, existing[0].id));
        }

        const updatedModel = await this.getPrescriptionModel();
        return { success: true, model: updatedModel };
    }

    async getLogo() {
        const [logo] = await db.select().from(image).limit(1);
        if (!logo || !fs.existsSync(logo.image_path)) return null;

        const buffer = fs.readFileSync(logo.image_path);
        const ext = path.extname(logo.image_path).slice(1);
        return `data:image/${ext};base64,${buffer.toString('base64')}`;
    }

    async uploadLogo(base64Data: string) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Clean up old logo
        const existing = await db.select().from(image);
        for (const row of existing) {
            if (fs.existsSync(row.image_path)) {
                fs.unlinkSync(row.image_path);
            }
        }
        await db.delete(image);

        // Save new logo
        const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid image format');

        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${Date.now()}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, buffer);
        await db.insert(image).values({ image_path: filepath });

        return { success: true, path: filepath };
    }

    async backup() {
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const filename = `backup_${Date.now()}.db`;
        const filepath = path.join(backupDir, filename);

        // For SQLite files, we can use simple file system copy if the db is not heavily written to
        // or use VACUUM INTO for a consistent backup if supported by the driver/env.
        // @libsql/client doesn't expose a dedicated backup API like better-sqlite3 yet.
        const sourcePath = path.resolve(process.cwd(), env.DATABASE_PATH);

        try {
            // Consistent way to backup SQLite: VACUUM INTO 'filepath'
            await sqlite.execute(`VACUUM INTO '${filepath.replace(/\\/g, '/')}'`);
        } catch (error) {
            // Fallback to FS copy if VACUUM INTO fails (e.g. permission or older sqlite)
            fs.copyFileSync(sourcePath, filepath);
        }

        try {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const lastBackupPath = path.join(uploadsDir, 'last_backup.json');
            fs.writeFileSync(lastBackupPath, JSON.stringify({ date: new Date().toISOString() }));
        } catch (e) {
            console.error('Failed to save last backup date', e);
        }

        return filepath;
    }

    async getLastBackup() {
        try {
            const lastBackupPath = path.join(process.cwd(), 'uploads', 'last_backup.json');
            if (fs.existsSync(lastBackupPath)) {
                const data = JSON.parse(fs.readFileSync(lastBackupPath, 'utf8'));
                return data.date;
            }
        } catch (e) {
            console.error('Failed to read last backup date', e);
        }
        return null;
    }

    async restore(backupFilePath: string) {
        const targetPath = path.resolve(process.cwd(), env.DATABASE_PATH);

        try {
            // 1. Close active connection and swap to the restored file (reinitializeDb handles close internally)
            // 2. Overwrite the live DB file with the backup
            fs.copyFileSync(backupFilePath, targetPath);

            // 3. Re-open the connection against the newly restored file — in-process, no restart needed
            await reinitializeDb();

            return { success: true, message: 'Database restored successfully.' };
        } catch (error: any) {
            console.error('Restore error detail:', error);
            throw error;
        } finally {
            // Clean up the uploaded temporary file asynchronously to avoid EBUSY on Windows
            const pathToDelete = backupFilePath;
            setTimeout(() => {
                if (fs.existsSync(pathToDelete)) {
                    try { fs.unlinkSync(pathToDelete); } catch (_) { /* ignore */ }
                }
            }, 300);
        }
    }

    async analyzeBackup(backupFilePath: string) {
        const url = `file:${path.resolve(backupFilePath)}`;
        const tempClient = createClient({ url });

        try {
            const patientsRes = await tempClient.execute('SELECT COUNT(*) as count FROM patients');
            const consultationsRes = await tempClient.execute('SELECT COUNT(*) as count FROM consultations');
            const prescriptionsRes = await tempClient.execute('SELECT COUNT(*) as count FROM prescriptions');

            return {
                patients: Number(patientsRes.rows[0].count),
                consultations: Number(consultationsRes.rows[0].count),
                prescriptions: Number(prescriptionsRes.rows[0].count)
            };
        } catch (error) {
            console.error('Failed to analyze backup:', error);
            throw new Error('Invalid backup file');
        } finally {
            tempClient.close();
            // On Windows, SQLite file handles are released asynchronously.
            // Delete the temp file after a short delay to avoid EBUSY.
            const pathToDelete = backupFilePath;
            setTimeout(() => {
                if (fs.existsSync(pathToDelete)) {
                    try { fs.unlinkSync(pathToDelete); } catch (_) { /* ignore */ }
                }
            }, 300);
        }
    }
}

export const settingsService = new SettingsService();
