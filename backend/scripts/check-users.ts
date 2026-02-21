import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from '../src/db/schema';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function checkUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log('Users in DB:', allUsers.map(u => ({ email: u.email, role: u.role })));
    } catch (error) {
        console.error('Failed to fetch users:', error);
    } finally {
        client.close();
    }
}

checkUsers();
