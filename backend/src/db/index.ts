import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../config/env';
import path from 'path';

// Use path resolution to ensure the DB file is found correctly relative to the backend root
const url = `file:${path.resolve(process.cwd(), env.DATABASE_PATH)}`;
const client = createClient({ url });

// Ensure the licenses and users tables exist (temporary fix for missing table)
// Note: @libsql/client uses execute() for multiple statements or single ones
const initDb = async () => {
    try {
        await client.batch([
            `CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                payload TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                contact TEXT,
                address TEXT,
                weight INTEGER,
                blood_type TEXT,
                medical_history TEXT,
                allergies TEXT,
                tags TEXT,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                reason TEXT NOT NULL,
                diagnosis TEXT NOT NULL,
                notes TEXT,
                symptoms TEXT,
                blood_pressure TEXT,
                glucose TEXT,
                weight TEXT,
                amount_paid INTEGER,
                custom_fields TEXT DEFAULT '{}',
                appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'in_progress'
            );`,
            `CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                prescription_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_psychotropic INTEGER DEFAULT 0,
                psychotropic_number INTEGER,
                patient_address TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS prescription_medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
                medicine_name TEXT NOT NULL,
                dosage TEXT NOT NULL,
                duration TEXT,
                quantity TEXT,
                form TEXT,
                note TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS document (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                name TEXT,
                type TEXT NOT NULL,
                content TEXT DEFAULT '[]',
                document_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS lab_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                panel_id TEXT NOT NULL,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                panel_name TEXT NOT NULL,
                test_name TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT,
                reference_min REAL,
                reference_max REAL,
                status TEXT NOT NULL DEFAULT 'normal',
                notes TEXT,
                measured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                time TEXT,
                title TEXT NOT NULL,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled'
            );`,
            `CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount INTEGER NOT NULL,
                category TEXT NOT NULL,
                date TEXT DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS custom_fields (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                label TEXT NOT NULL,
                is_active INTEGER DEFAULT 1
            );`,
            `CREATE TABLE IF NOT EXISTS auth (
                id INTEGER PRIMARY KEY,
                password_hash TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS name (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS psychotropic_counters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS prescription_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS prescription_template_medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL REFERENCES prescription_templates(id) ON DELETE CASCADE,
                medicine_name TEXT NOT NULL,
                dosage TEXT NOT NULL,
                duration TEXT,
                quantity TEXT,
                form TEXT,
                note TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS document_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                is_default INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS prescription_model (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_fr TEXT,
                name_ar TEXT,
                specialty_fr TEXT,
                specialty_ar TEXT,
                inscription_number TEXT,
                services_fr TEXT,
                services_ar TEXT,
                address TEXT,
                phone_number_1 TEXT,
                phone_number_2 TEXT,
                city TEXT,
                accent_color TEXT DEFAULT '#000000',
                font_family TEXT DEFAULT 'serif',
                doctor_name_font_size INTEGER DEFAULT 14,
                specialty_font_size INTEGER DEFAULT 10,
                title_font_size INTEGER DEFAULT 18,
                body_font_size INTEGER DEFAULT 12,
                logo_size INTEGER DEFAULT 60,
                watermark_opacity INTEGER DEFAULT 10,
                divider_style TEXT DEFAULT 'solid',
                title_text TEXT DEFAULT 'ORDONNANCE',
                show_inscription_number INTEGER DEFAULT 1
            );`,
            `CREATE TABLE IF NOT EXISTS image (
                image_path TEXT NOT NULL
            );`
        ], "write");
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
    }
};

initDb();

export const db = drizzle(client);

// Export the client instance for manual operations or closing
export { client as sqlite };
