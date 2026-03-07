
const { createClient } = require('@libsql/client');
const path = require('path');

const url = 'file:d:/Doc/database.db';
const client = createClient({ url });

async function run() {
    try {
        const result = await client.execute("SELECT email, role FROM users WHERE role = 'admin'");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        // client.close();
    }
}

run();
