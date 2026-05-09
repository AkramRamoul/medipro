import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../config/env';
import path from 'path';

// ---------------------------------------------------------------------------
// Mutable internals — swapped by reinitializeDb() on database restore
// ---------------------------------------------------------------------------
const dbUrl = () => `file:${path.resolve(process.cwd(), env.DATABASE_PATH)}`;

let _client = createClient({ url: dbUrl() });
let _db     = drizzle(_client);

// Note: Database migration is now handled via Drizzle Kit at the root level.
// Backend initialization only handles seeding if necessary.

const seedInitialData = async () => {
    try {
        const { users, documentTemplates, prescriptionTemplates, prescriptionTemplateMedications } = await import('./schema');
        const { eq, sql } = await import('drizzle-orm');
        const bcrypt = await import('bcryptjs');
        const bootstrap = await import('../../bootstrap.json');

        // Check if admin already exists
        const existingUsers = await _db.select().from(users).limit(1);
        if (existingUsers.length === 0) {
            console.log('🌱 No users found. Bootstrapping admin account...');
            const hashedPassword = await bcrypt.default.hash(bootstrap.default.password, 10);
            await _db.insert(users).values({
                email: bootstrap.default.email,
                password: hashedPassword,
                role: 'admin',
                requires_password_change: true,
            });
            console.log(`✅ Admin account created: ${bootstrap.default.email} with forced password reset.`);
        }

        // Check and seed Document Templates
        const existingDocTemplates = await _db.select().from(documentTemplates).limit(1);
        if (existingDocTemplates.length === 0) {
            console.log('🌱 Seeding default document templates...');
            const docTemplates = [
                {
                    name: 'Certificat Médical d\'Aptitude',
                    type: 'medical_certificate' as any,
                    isDefault: true,
                    content: `
        <div style="font-family: Arial, sans-serif;">
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie avoir examiné ce jour le nommé (e) : <strong>[Nom du Patient]</strong></p>
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
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie avoir examiné ce jour : <strong>[Nom du Patient]</strong></p>
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
          <p>Je soussigné, Docteur <strong>[Nom du Docteur]</strong>, certifie que l'état de santé du patient : <strong>[Nom du Patient]</strong></p>
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
                await _db.insert(documentTemplates).values({
                    ...tpl,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            console.log('✅ Document templates seeded.');
        }

        // Check and seed Prescription Templates
        const existingPTemplates = await _db.select().from(prescriptionTemplates).limit(1);
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
                const [inserted] = await _db.insert(prescriptionTemplates).values({
                    name: pt.name
                }).returning({ id: prescriptionTemplates.id });

                for (const med of pt.meds) {
                    await _db.insert(prescriptionTemplateMedications).values({
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

// ---------------------------------------------------------------------------
// Stable Proxy exports — same object reference forever, always forwards to
// the current _db / _client. All service imports stay valid after a restore.
// ---------------------------------------------------------------------------
export const db: ReturnType<typeof drizzle> = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_t, prop) {
        const val = (_db as any)[prop];
        return typeof val === 'function' ? val.bind(_db) : val;
    },
    set(_t, prop, val) { (_db as any)[prop] = val; return true; },
});

export const sqlite: ReturnType<typeof createClient> = new Proxy({} as ReturnType<typeof createClient>, {
    get(_t, prop) {
        const val = (_client as any)[prop];
        return typeof val === 'function' ? val.bind(_client) : val;
    },
    set(_t, prop, val) { (_client as any)[prop] = val; return true; },
});

// Initialize DB seeding on startup
seedInitialData();

/**
 * Re-opens the database connection against the current file on disk.
 * Call this immediately after overwriting the DB file during a restore.
 * Does NOT restart the process — safe in ts-node-dev and production.
 */
export async function reinitializeDb() {
    console.log('🔄 Reinitializing database connection after restore...');
    try { _client.close(); } catch (_) { /* ignore close errors */ }
    _client = createClient({ url: dbUrl() });
    _db     = drizzle(_client);
    // Re-seed in case the restored backup pre-dates some seed data
    await seedInitialData();
    console.log('✅ Database connection restored successfully.');
}
// Trigger restart 3
