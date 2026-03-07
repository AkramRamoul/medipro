
const { createClient } = require('@libsql/client');
const path = require('path');

const dbPath = 'C:/Users/pc/AppData/Roaming/doc-right/database.db';
const client = createClient({ url: `file:${dbPath}` });

async function seedProdTemplates() {
    console.log('🌱 Seeding PROD templates...');

    const docTemplates = [
        {
            name: 'Certificat Médical d\'Aptitude',
            type: 'medical_certificate',
            is_default: 1,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center; text-decoration: underline;">CERTIFICAT MEDICAL</h2>
          <br/>
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie avoir examiné ce jour le nommé (e) :</p>
          <p style="margin-left: 20px;"><strong>[Nom du Patient]</strong></p>
          <p>L'examen clinique ce jour ne révèle aucun signe clinique apparent de contre-indication à la pratique d'une activité physique et sportive.</p>
          <br/>
          <p style="text-align: right;">Fait à [Ville], le [Date]</p>
        </div>
      `
        },
        {
            name: 'Arrêt de Travail',
            type: 'work_stop',
            is_default: 1,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center; text-decoration: underline;">AVIS D'ARRET DE TRAVAIL</h2>
          <br/>
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie avoir examiné ce jour :</p>
          <p style="margin-left: 20px;"><strong>[Nom du Patient]</strong></p>
          <p>Son état de santé justifie un arrêt de travail de : <strong>......... jours</strong></p>
          <p>À compter du : <strong>[Date]</strong></p>
          <br/>
          <p style="text-align: right;">Fait à [Ville], le [Date]</p>
        </div>
      `
        },
        {
            name: 'Lettre de Liaison',
            type: 'custom',
            is_default: 1,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center;">LETTRE DE LIAISON</h2>
          <br/>
          <p>Cher confrère,</p>
          <p>Je vous adresse mon patient <strong>[Nom du Patient]</strong> pour :</p>
          <p>....................................................................................</p>
          <br/>
          <p>Merci pour votre collaboration.</p>
          <p style="text-align: right;">Bien confraternellement,</p>
          <p style="text-align: right;">Dr. <strong>[Nom du Docteur]</strong></p>
        </div>
      `
        }
    ];

    for (const tpl of docTemplates) {
        try {
            await client.execute({
                sql: "INSERT INTO document_templates (name, type, content, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                args: [tpl.name, tpl.type, tpl.content, tpl.is_default, new Date().toISOString(), new Date().toISOString()]
            });
            console.log(`✅ Doc template: ${tpl.name}`);
        } catch (e) {
            console.log(`❌ Skipped ${tpl.name}: ${e.message}`);
        }
    }

    const pTemplates = [
        {
            name: 'Bilan de Routine',
            meds: [
                { name: 'FNS', dosage: 'A jeun', form: 'Analyse' },
                { name: 'Glycémie à jeun', dosage: 'A jeun', form: 'Analyse' },
                { name: 'Urée / Créatinine', dosage: 'A jeun', form: 'Analyse' },
                { name: 'Bilan Lipidique', dosage: 'A jeun', form: 'Analyse' }
            ]
        },
        {
            name: 'Traitement Symptomatique Grippe',
            meds: [
                { name: 'Paracétamol 1g', dosage: '1cp x 3 / j', duration: '5 jours', quantity: '1 bte', form: 'Comprimé' },
                { name: 'Vitamine C 1000mg', dosage: '1cp / j', duration: '10 jours', quantity: '1 bte', form: 'Comprimé Eff.' }
            ]
        }
    ];

    for (const pt of pTemplates) {
        try {
            const rs = await client.execute({
                sql: "INSERT INTO prescription_templates (name) VALUES (?)",
                args: [pt.name]
            });
            const templateId = rs.lastInsertRowid;

            for (const med of pt.meds) {
                await client.execute({
                    sql: "INSERT INTO prescription_template_medications (template_id, medicine_name, dosage, duration, quantity, form) VALUES (?, ?, ?, ?, ?, ?)",
                    args: [templateId, med.name, med.dosage, med.duration || null, med.quantity || null, med.form || null]
                });
            }
            console.log(`✅ Prescription template: ${pt.name}`);
        } catch (e) {
            console.log(`❌ Skipped ${pt.name}: ${e.message}`);
        }
    }

    console.log('✨ Done!');
    await client.close();
}

seedProdTemplates();
