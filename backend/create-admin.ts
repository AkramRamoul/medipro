import { db } from './src/db';
import { users } from './src/db/schema';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const email = 'admin@clinic.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.insert(users).values({
            email,
            password: hashedPassword,
            role: 'admin',
        });
        console.log('✅ Admin user created successfully');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log('ℹ️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin user:', error);
        }
    }
}

createAdmin();
