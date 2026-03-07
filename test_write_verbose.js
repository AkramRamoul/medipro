
const fs = require('fs');
const path = require('path');

const targets = [
    'C:\\Users\\pc\\AppData\\Roaming\\doc-right\\common_consultations.json',
    'C:\\Users\\pc\\AppData\\Roaming\\doc-right\\common_bilans.json'
];

targets.forEach(target => {
    console.log(`\nTesting ${target}...`);
    try {
        if (!fs.existsSync(target)) {
            console.log('File does not exist.');
            return;
        }
        const data = fs.readFileSync(target, 'utf8');
        console.log(`Read ${data.length} bytes.`);

        fs.writeFileSync(target, data, 'utf8');
        console.log('Write success.');
    } catch (err) {
        console.error('FAILED:', err.code, err.message);
    }
});
