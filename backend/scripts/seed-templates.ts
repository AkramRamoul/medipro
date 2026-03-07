
import { db } from '../src/db';
import { documentTemplates, prescriptionTemplates, prescriptionTemplateMedications } from '../src/db/schema';

async function seedTemplates() {
    console.log('🌱 Starting template seeding...');

    // 1. Document Templates
    const docTemplates = [
        {
            name: 'Certificat Médical d\'Aptitude',
            type: 'medical_certificate' as const,
            isDefault: true,
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
            type: 'work_stop' as const,
            isDefault: true,
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
            name: "Lettre d'Orientation / Référence",
            type: "referral" as const,
            isDefault: true,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center;">LETTRE D'ORIENTATION / RÉFÉRENCE</h2>
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
        },
        {
            name: "Maladie Chronique",
            type: "chronic_disease" as const,
            isDefault: true,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center;">CERTIFICAT DE MALADIE CHRONIQUE</h2>
          <br/>
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie que l'état de santé du patient :</p>
          <p style="margin-left: 20px;"><strong>[Nom du Patient]</strong></p>
          <p>né(e) le <strong>[Date de Naissance]</strong>, nécessite un suivi régulier pour une affection de longue durée :</p>
          <p>....................................................................................</p>
          <br/>
          <p style="text-align: right;">Fait à [Ville], le [Date]</p>
        </div>
      `
        },
        {
            name: "Demande d’Examens",
            type: "exam_request" as const,
            isDefault: true,
            content: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center;">DEMANDE D'EXAMENS COMPLÉMENTAIRES</h2>
          <br/>
          <p>Patient : <strong>[Nom du Patient]</strong></p>
          <br/>
          <p>Prière de pratiquer les examens suivants :</p>
          <p>....................................................................................</p>
          <br/>
          <p>Renseigements cliniques :</p>
          <p>....................................................................................</p>
          <br/>
          <p style="text-align: right;">Fait à [Ville], le [Date]</p>
        </div>
      `
        }
    ];

    for (const tpl of docTemplates) {
        try {
            await db.insert(documentTemplates).values({
                ...tpl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`✅ Document template created: ${tpl.name}`);
        } catch (err) {
            console.error(`❌ Error creating document template ${tpl.name}:`, err);
        }
    }

    // 2. Prescription Templates
    const pTemplates = [
        {
            name: 'Traitement Symptomatique Grippe',
            meds: [
                { medicineName: 'Paracétamol 1g', dosage: '1cp x 3 / j', duration: '5 jours', quantity: '1 bte', form: 'Comprimé' },
                { medicineName: 'Vitamine C 1000mg', dosage: '1cp / j', duration: '10 jours', quantity: '1 bte', form: 'Comprimé Eff.' }
            ]
        }
    ];

    for (const pt of pTemplates) {
        try {
            const [inserted] = await db.insert(prescriptionTemplates).values({
                name: pt.name
            }).returning({ id: prescriptionTemplates.id });

            for (const med of pt.meds) {
                await db.insert(prescriptionTemplateMedications).values({
                    ...med,
                    templateId: inserted.id
                });
            }
            console.log(`✅ Prescription template created: ${pt.name}`);
        } catch (err) {
            console.error(`❌ Error creating prescription template ${pt.name}:`, err);
        }
    }

    console.log('✨ Seeding complete!');
    process.exit(0);
}

seedTemplates();
