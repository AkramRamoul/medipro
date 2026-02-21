import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function createAdmin() {
    const email = 'admin@docright.com';
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.insert(users).values({
            email,
            password: hashedPassword,
            role: 'admin',
        });
        console.log(`Admin user created: ${email} / ${password}`);
    } catch (error: any) {
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            console.log('Admin user already exists.');
        } else {
            console.error('Failed to create admin user:', error);
        }
    } finally {
        await client.close();
    }
}

createAdmin();

createAdmin();
