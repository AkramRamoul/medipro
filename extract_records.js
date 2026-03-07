
const fs = require('fs');
const path = require('path');

const sqlFile = path.resolve('d:/Doc/recovered.sql');
const content = fs.readFileSync(sqlFile, 'utf8');

const tables = [
    'document_templates',
    'prescription_templates',
    'prescription_template_medications',
    'prescription_model'
];

tables.forEach(table => {
    console.log(`--- ${table} ---`);
    const regex = new RegExp(`INSERT INTO ['"]?${table}['"]?[^;]+;`, 'g');
    const matches = content.match(regex);
    if (matches) {
        matches.forEach(m => console.log(m));
    } else {
        console.log('No matches found.');
    }
});
