import { createClient } from '@libsql/client';

async function testQuery() {
    const client = createClient({ url: 'file:D:/Doc/database.db' });
    try {
        const result = await client.execute('SELECT * FROM users');
        console.log("Success! Users:", result.rows);
    } catch (e) {
        console.error("Error executing query:", e);
    }
}

testQuery();
