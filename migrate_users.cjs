const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.db');
console.log('Connecting to DB:', dbPath);
const db = new Database(dbPath);

try {
  // Check if column exists
  const tableInfo = db.pragma('table_info(users)');
  const hasColumn = tableInfo.some(col => col.name === 'requires_password_change');
  
  if (!hasColumn) {
    console.log('Adding requires_password_change column to users table...');
    db.prepare('ALTER TABLE users ADD COLUMN requires_password_change INTEGER DEFAULT 0').run();
    console.log('Column added successfully.');
  } else {
    console.log('Column already exists.');
  }
} catch (error) {
  console.error('Error modifying database:', error);
} finally {
  db.close();
}
