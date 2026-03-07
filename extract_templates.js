
const fs = require('fs');
const path = require('path');

const sqlFile = 'd:/Doc/recovered.sql';
if (!fs.existsSync(sqlFile)) {
    console.error('File not found:', sqlFile);
    process.exit(1);
}

const content = fs.readFileSync(sqlFile, 'utf8');

const tables = [
    'document_templates',
    'prescription_templates',
    'prescription_template_medications',
    'prescription_model'
];

tables.forEach(table => {
    console.log(`\n=== TABLE: ${table} ===`);
    // Find lines starting with INSERT INTO "table" or INSERT INTO 'table' or INSERT INTO table
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.includes(`INSERT INTO '${table}'`) ||
            line.includes(`INSERT INTO "${table}"`) ||
            line.includes(`INSERT INTO ${table} `)) {
            console.log(line);
        }
    });
});
