import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function verifyAdmin() {
    const email = 'admin@docright.com';
    const password = 'adminpassword';

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            console.log('Admin user not found in DB.');
            return;
        }

        const match = await bcrypt.compare(password, user.password);
        console.log(`Verification for ${email}: ${match ? 'SUCCESS' : 'FAILURE'}`);
        if (!match) {
            console.log('Stored hash:', user.password);
        }
    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        client.close();
    }
}

verifyAdmin();
