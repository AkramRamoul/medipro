import { db } from '../backend/src/db';
import { documentTemplates } from '../backend/src/db/schema';

async function verify() {
    const templates = await db.select().from(documentTemplates);
    console.log('--- Current Templates ---');
    templates.forEach(t => {
        console.log(`- ${t.name} (${t.type})`);
    });
    process.exit(0);
}

verify();
