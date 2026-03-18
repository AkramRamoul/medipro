import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../config/env';
import path from 'path';

// Use path resolution to ensure the DB file is found correctly relative to the backend root
const url = `file:${path.resolve(process.cwd(), env.DATABASE_PATH)}`;
const client = createClient({ url });

// Note: Database migration is now handled via Drizzle Kit at the root level.
// Backend initialization only handles seeding if necessary.

const seedInitialData = async () => {
    try {
        const { users, documentTemplates, prescriptionTemplates, prescriptionTemplateMedications } = await import('./schema');
        const { eq, sql } = await import('drizzle-orm');
        const bcrypt = await import('bcryptjs');
        const bootstrap = await import('../../bootstrap.json');

        // Check if admin already exists
        const existingUsers = await db.select().from(users).limit(1);
        if (existingUsers.length === 0) {
            console.log('🌱 No users found. Bootstrapping admin account...');
            const hashedPassword = await bcrypt.default.hash(bootstrap.default.password, 10);
            await db.insert(users).values({
                email: bootstrap.default.email,
                password: hashedPassword,
                role: 'admin',
            });
            console.log(`✅ Admin account created: ${bootstrap.default.email}`);
        }

        // Check and seed Document Templates
        const existingDocTemplates = await db.select().from(documentTemplates).limit(1);
        if (existingDocTemplates.length === 0) {
            console.log('🌱 Seeding default document templates...');
            const docTemplates = [
                {
                    name: 'Certificat Médical d\'Aptitude',
                    type: 'medical_certificate' as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
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
                    type: 'work_stop' as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
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
                    type: "referral" as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
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
                    type: "chronic_disease" as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
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
                    type: "exam_request" as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
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
                await db.insert(documentTemplates).values({
                    ...tpl,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            console.log('✅ Document templates seeded.');
        }

        // Check and seed Prescription Templates
        const existingPTemplates = await db.select().from(prescriptionTemplates).limit(1);
        if (existingPTemplates.length === 0) {
            console.log('🌱 Seeding default prescription templates...');
            const pTemplates = [
                {
                    name: 'Traitement Symptomatique Grippe',
                    meds: [
                        { medicineName: 'Paracétamol', dosage: '1g', duration: '', quantity: '1 bte', form: 'Comprimé' },
                        { medicineName: 'Vitamine C', dosage: '1g', duration: '', quantity: '1 bte', form: 'Comprimé.' }
                    ]
                }
            ];

            for (const pt of pTemplates) {
                const [inserted] = await db.insert(prescriptionTemplates).values({
                    name: pt.name
                }).returning({ id: prescriptionTemplates.id });

                for (const med of pt.meds) {
                    await db.insert(prescriptionTemplateMedications).values({
                        ...med,
                        templateId: inserted.id
                    });
                }
            }
            console.log('✅ Prescription templates seeded.');
        }

    } catch (error) {
        console.error('❌ Failed to seed initial data:', error);
    }
};

// Initialize DB seeding and export
seedInitialData();

export const db = drizzle(client);

// Export the client instance for manual operations or closing
export { client as sqlite };

