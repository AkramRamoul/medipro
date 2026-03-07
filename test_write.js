
const fs = require('fs');
const path = require('path');

const target = 'C:\\Users\\pc\\AppData\\Roaming\\doc-right\\common_consultations.json';
console.log(`Checking ${target}...`);

try {
    const data = fs.readFileSync(target, 'utf8');
    console.log('Read success.');

    fs.writeFileSync(target, data, 'utf8');
    console.log('Write success.');
} catch (err) {
    console.error('Error:', err);
}
