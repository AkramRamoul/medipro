import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '../config/env';
import path from 'path';

// Use path resolution to ensure the DB file is found correctly relative to the backend root
const sqlite = new Database(path.resolve(process.cwd(), env.DATABASE_PATH));
sqlite.pragma('journal_mode = WAL');

// Ensure the licenses table exists (temporary fix for missing table)
sqlite.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        payload TEXT NOT NULL
    )
`);

export const db = drizzle(sqlite);

// Export the sqlite instance for manual operations or closing
export { sqlite };
