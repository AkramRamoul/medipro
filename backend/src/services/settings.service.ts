import { db, sqlite } from '../db';
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
        if (!logo || !fs.existsSync(logo.imagePath)) return null;

        const buffer = fs.readFileSync(logo.imagePath);
        const ext = path.extname(logo.imagePath).slice(1);
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
            if (fs.existsSync(row.imagePath)) {
                fs.unlinkSync(row.imagePath);
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
        await db.insert(image).values({ imagePath: filepath });

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

        return filepath;
    }

    async restore(backupFilePath: string) {
        // To restore safely:
        // 1. Close current connection if possible (though @libsql client is pooled)
        // 2. Overwrite the database file

        const targetPath = path.resolve(process.cwd(), env.DATABASE_PATH);

        try {
            // We need to be careful about file locks.
            // A safer way with @libsql might be to close the client, copy, then re-open.
            // But since this is a local server, we'll try direct overwrite first.

            await sqlite.close();
            fs.copyFileSync(backupFilePath, targetPath);

            // Re-initialize sqlite client in db/index.ts is not easy without a refresh, 
            // but the next request will likely use a new connection or we might need a restart.
            // For now, we'll suggest a restart or hope the pool handles it.

            return { success: true, message: 'Database restored. Please restart the application for changes to take effect if they are not visible.' };
        } catch (error: any) {
            console.error('Restore error detail:', error);
            throw error;
        } finally {
            // Clean up the uploaded temporary file
            if (fs.existsSync(backupFilePath)) {
                try {
                    fs.unlinkSync(backupFilePath);
                } catch (unlinkError) {
                    console.error('Failed to delete temporary backup file:', unlinkError);
                }
            }
        }
    }
}

export const settingsService = new SettingsService();
