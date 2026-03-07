
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const path = require('path');

// Target the production database
const dbPath = 'C:/Users/pc/AppData/Roaming/doc-right/database.db';
const client = createClient({ url: `file:${dbPath}` });

async function createAdmin() {
    const email = 'admin@clinic.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await client.execute({
            sql: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            args: [email, hashedPassword, 'admin']
        });
        console.log(`✅ Admin user created in PROD: ${email} / ${password}`);
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            console.log('ℹ️ Admin user already exists in PROD');
            // Update the password just in case it was different
            await client.execute({
                sql: "UPDATE users SET password = ? WHERE email = ?",
                args: [hashedPassword, email]
            });
            console.log(`✅ Admin password updated in PROD`);
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await client.close();
    }
}

createAdmin();
