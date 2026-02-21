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
