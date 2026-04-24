const { createClient } = require('@libsql/client');
const path = require('path');

const client = createClient({
  url: 'file:' + path.join(__dirname, '..', 'database.db'),
});

async function migrate() {
  try {
    console.log('Adding requires_password_change column to users table...');
    await client.execute('ALTER TABLE users ADD COLUMN requires_password_change INTEGER DEFAULT 0');
    console.log('Column added successfully.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Column already exists.');
    } else {
      console.error('Error modifying database:', error);
    }
  } finally {
    client.close();
  }
}

migrate();
