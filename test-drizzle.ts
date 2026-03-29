import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from './src/electron/schema';
import { eq } from 'drizzle-orm';

async function test() {
    try {
        const client = createClient({ url: 'file:D:/Doc/database.db' });
        const db = drizzle(client);

        const allAdmins = await db.select().from(users).where(eq(users.email, 'admin@clinic.com'));
        console.log("Success! Admins:", allAdmins);
    } catch (e) {
        console.error("Drizzle failed:");
        console.error(e);
    }
}
test();
