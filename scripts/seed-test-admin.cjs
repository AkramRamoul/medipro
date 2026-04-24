/**
 * seed-test-admin.cjs
 * Creates a test admin user with requires_password_change = true.
 * Use this to test the forced password reset flow after db:clear.
 *
 * Usage: node scripts/seed-test-admin.cjs
 *
 * Login: admin@clinic.com / Test1234
 * → Should be redirected to /force-reset on first login.
 */

const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const path = require('path');

// Dev DB path — same location used by db:clear (resolved from workspace root)
const dbPath = path.join(__dirname, '..', 'database.db');
const client = createClient({ url: `file:${dbPath}` });

async function seed() {
  const email = 'admin@clinic.com';
  const password = 'Test1234';
  const hash = await bcrypt.hash(password, 10);

  try {
    await client.execute({
      sql: `INSERT INTO users (email, password, role, requires_password_change)
            VALUES (?, ?, 'admin', 1)`,
      args: [email, hash],
    });
    console.log('✅ Test admin created!');
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   requires_password_change = TRUE');
    console.log('');
    console.log('👉 Now open the app, press Alt+Shift+A on the login screen to reveal the admin card, then log in.');
    console.log('   You should be redirected to /force-reset immediately.');
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      console.log('ℹ️  Admin already exists. Updating requires_password_change to TRUE...');
      await client.execute({
        sql: `UPDATE users SET requires_password_change = 1 WHERE email = ?`,
        args: [email],
      });
      console.log('✅ Done. Log in again to trigger the force-reset screen.');
    } else {
      console.error('❌ Error:', err.message);
    }
  } finally {
    await client.close();
  }
}

seed();
