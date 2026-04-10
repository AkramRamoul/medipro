const fs = require('fs');

function processDataset(inputPath, outputPath) {
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    const grouped = {};

    for (const item of data) {
        if (!item['DENOMINATION COMMUNE INTERNATIONALE'] || !item['NOM DE MARQUE']) {
            continue;
        }

        let genericName = item['DENOMINATION COMMUNE INTERNATIONALE'].toLowerCase().trim();
        let brandName = item['NOM DE MARQUE'].trim();

        let dosage = (item['DOSAGE'] || '').trim();
        // Insert space between number and letter if missing, convert to lowercase
        dosage = dosage.toLowerCase().replace(/([0-9])([a-z])/gi, '$1 $2').replace(/\s+/g, ' ').trim();

        let form = (item['FORME'] || '').toLowerCase().trim();
        // form simplification heuristics
        form = form
            .replace(/\ben\s*sachet\s*dose\b/g, '')
            .replace(/\ben\s*sachet-dose\b/g, '')
            .replace(/\ben\s*sachets\b/g, '')
            .replace(/\ben\s*sachet\b/g, '')
            .replace(/\bsachet\s*dose\b/g, '')
            .replace(/\ben\s*flacon\b/g, '')
            .replace(/\ben\s*tube\b/g, '')
            .replace(/\ben\s*seringue\b/g, '')
            .replace(/\ben\s*seringue\s*pr[e\u00e9]-?remplie\b/g, '')
            .replace(/\ben\s*ampoule(s)?\b/g, '')
            .replace(/\ben\s*boite\b/g, '')
            .replace(/\ben\s*bo\u00eete\b/g, '')
            .replace(/\bcomprime(s)?\b/g, 'comprim\u00e9$1')
            .replace(/\bgelule(s)?\b/g, 'g\u00e9lule$1')
            .replace(/\bpellicule(s)?\b/g, 'pellicul\u00e9$1')
            .replace(/\bsecable(s)?\b/g, 's\u00e9cable$1')
            // Remove double spaces introduced by deletions
            .replace(/\s+/g, ' ')
            .trim();

        if (!grouped[genericName]) {
            grouped[genericName] = { genericName, variants: [] };
        }

        const variant = { brandName, dosage, form };
        
        // Check for duplicate variant
        const isDuplicate = grouped[genericName].variants.some(
            v => v.brandName === variant.brandName && v.dosage === variant.dosage && v.form === variant.form
        );

        if (!isDuplicate) {
            grouped[genericName].variants.push(variant);
        }
    }

    const output = Object.values(grouped);
    
    // Sort array by generic name
    output.sort((a, b) => a.genericName.localeCompare(b.genericName));

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
}

processDataset('d:\\Doc\\public\\meds.json', 'd:\\Doc\\public\\meds.json');
console.log('Done!');
