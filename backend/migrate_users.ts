import { sqlite } from './src/db/index';

try {
  console.log('Adding requires_password_change column to users table...');
  sqlite.exec('ALTER TABLE users ADD COLUMN requires_password_change INTEGER DEFAULT 0');
  console.log('Column added successfully.');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('Column already exists.');
  } else {
    console.error('Error modifying database:', error);
  }
} finally {
  sqlite.close();
}
