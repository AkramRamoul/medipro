import { db, sqlite } from '../db';
import { prescriptionModel, image } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import Database from 'better-sqlite3';

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
        return { success: true };
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

        await sqlite.backup(filepath);
        return filepath;
    }

    async restore(backupFilePath: string) {
        // To restore safely while keeping the connection open:
        // 1. Open the backup file as a new database
        // 2. Use backup() from the backup instance to the current instance
        const tempDb = new Database(backupFilePath);
        try {
            // Restore into the current active database file
            const targetPath = path.resolve(process.cwd(), env.DATABASE_PATH);
            await tempDb.backup(targetPath);

            return { success: true };
        } catch (error: any) {
            console.error('Restore error detail:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            throw error;
        } finally {
            tempDb.close();
            // Clean up the uploaded temporary file AFTER closing the connection
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
