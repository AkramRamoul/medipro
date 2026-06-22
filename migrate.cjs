const { createClient } = require("@libsql/client");
const path = require("path");

const dbUrl = "file:" + path.resolve("database.db");

const client = createClient({ url: dbUrl });

async function migrate() {
    try {
        await client.execute("ALTER TABLE prescriptions ADD COLUMN consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL;");
        console.log("Added consultation_id to prescriptions");
    } catch (err) {
        if (err.message.includes("duplicate column")) {
            console.log("consultation_id already exists in prescriptions");
        } else {
            console.error(err);
        }
    }

    try {
        await client.execute("ALTER TABLE document ADD COLUMN consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL;");
        console.log("Added consultation_id to document");
    } catch (err) {
        if (err.message.includes("duplicate column")) {
            console.log("consultation_id already exists in document");
        } else {
            console.error(err);
        }
    }
}

migrate().then(() => console.log("Done")).catch(console.error);
