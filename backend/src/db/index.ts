import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '../config/env';
import path from 'path';

// Use path resolution to ensure the DB file is found correctly relative to the backend root
const sqlite = new Database(path.resolve(process.cwd(), env.DATABASE_PATH));

export const db = drizzle(sqlite);

// Export the sqlite instance for manual operations or closing
export { sqlite };
