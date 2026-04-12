import { createClient } from "@libsql/client";
import * as path from "path";

const dbPath = path.resolve(process.cwd(), "..", "database.db");
const client = createClient({ url: "file:" + dbPath });

async function run() {
    try {
        await client.execute(`ALTER TABLE prescription_model ADD COLUMN use_custom_layout INTEGER DEFAULT 0;`);
        console.log("Added use_custom_layout");
    } catch (e: any) { console.log(e.message); }

    try {
        await client.execute(`ALTER TABLE prescription_model ADD COLUMN custom_positions TEXT;`);
        console.log("Added custom_positions");
    } catch (e: any) { console.log(e.message); }

    try {
        await client.execute(`ALTER TABLE prescription_model ADD COLUMN hidden_elements TEXT;`);
        console.log("Added hidden_elements");
    } catch (e: any) { console.log(e.message); }

    process.exit(0);
}

run();
