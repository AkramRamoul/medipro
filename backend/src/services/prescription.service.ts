import { db } from '../db';
import { prescriptions, prescriptionMedications, psychotropicCounters, patients, prescriptionTemplates, prescriptionTemplateMedications } from '../db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export class PrescriptionService {
    async getAll() {
        const result = await db
            .select({
                id: prescriptions.id,
                date: prescriptions.prescriptionDate,
                createdAt: prescriptions.createdAt,
                isPsychotropic: prescriptions.is_psychotropic,
                psychotropicNumber: prescriptions.psychotropic_number,
                patientId: prescriptions.patientId,
                patient: {
                    id: patients.id,
                    first_name: patients.first_name,
                    last_name: patients.last_name,
                    age: patients.age,
                },
                medications: prescriptionMedications,
            })
            .from(prescriptions)
            .leftJoin(patients, eq(prescriptions.patientId, patients.id))
            .leftJoin(
                prescriptionMedications,
                eq(prescriptions.id, prescriptionMedications.prescriptionId),
            )
            .orderBy(desc(prescriptions.prescriptionDate));

        const prescriptionsMap = new Map();

        result.forEach((row) => {
            if (!prescriptionsMap.has(row.id)) {
                prescriptionsMap.set(row.id, {
                    id: row.id,
                    date: row.date,
                    createdAt: row.createdAt,
                    isPsychotropic: row.isPsychotropic,
                    psychotropicNumber: row.psychotropicNumber,
                    patientId: row.patientId,
                    patient: row.patient,
                    medications: [],
                });
            }
            if (row.medications) {
                prescriptionsMap.get(row.id).medications.push(row.medications);
            }
        });

        return Array.from(prescriptionsMap.values());
    }

    async getByPatientId(patientId: number) {
        const result = await db
            .select({
                id: prescriptions.id,
                date: prescriptions.prescriptionDate,
                createdAt: prescriptions.createdAt,
                isPsychotropic: prescriptions.is_psychotropic,
                psychotropicNumber: prescriptions.psychotropic_number,
                patientAddress: prescriptions.patient_address,
                medications: prescriptionMedications,
            })
            .from(prescriptions)
            .leftJoin(
                prescriptionMedications,
                eq(prescriptions.id, prescriptionMedications.prescriptionId),
            )
            .where(eq(prescriptions.patientId, patientId))
            .orderBy(desc(prescriptions.prescriptionDate));

        const prescriptionsMap = new Map();

        result.forEach((row) => {
            if (!prescriptionsMap.has(row.id)) {
                prescriptionsMap.set(row.id, {
                    id: row.id,
                    date: row.date,
                    createdAt: row.createdAt,
                    isPsychotropic: row.isPsychotropic,
                    psychotropicNumber: row.psychotropicNumber,
                    patientAddress: row.patientAddress,
                    medications: [],
                });
            }
            if (row.medications) {
                prescriptionsMap.get(row.id).medications.push(row.medications);
            }
        });

        return Array.from(prescriptionsMap.values());
    }

    async getById(id: number) {
        const result = await db
            .select({
                id: prescriptions.id,
                date: prescriptions.prescriptionDate,
                createdAt: prescriptions.createdAt,
                isPsychotropic: prescriptions.is_psychotropic,
                psychotropicNumber: prescriptions.psychotropic_number,
                patientId: prescriptions.patientId,
                patientAddress: prescriptions.patient_address,
                medications: prescriptionMedications,
            })
            .from(prescriptions)
            .leftJoin(
                prescriptionMedications,
                eq(prescriptions.id, prescriptionMedications.prescriptionId),
            )
            .where(eq(prescriptions.id, id));

        if (result.length === 0) return null;

        const prescription = {
            ...result[0],
            medications: result
                .map((row) => row.medications)
                .filter((m) => m !== null),
        };

        return prescription;
    }

    async create(data: any) {
        const {
            patientId,
            medications,
            isPsychotropic,
            patientAddress: frontendAddress,
            prescriptionDate,
        } = data;

        if (!patientId || !Array.isArray(medications) || medications.length === 0) {
            throw new Error("Invalid prescription data");
        }

        let psychotropicNumber: number | null = null;
        let patientAddress: string | null = frontendAddress || null;

        if (isPsychotropic) {
            const [counter] = await db
                .insert(psychotropicCounters)
                .values({})
                .returning({ id: psychotropicCounters.id });

            psychotropicNumber = counter.id;

            if (!patientAddress) {
                const [patient] = await db
                    .select({ address: patients.address })
                    .from(patients)
                    .where(eq(patients.id, patientId));

                if (!patient) {
                    throw new Error("Patient not found.");
                }

                patientAddress = patient.address;
            }
        }

        const [newPrescription] = await db
            .insert(prescriptions)
            .values({
                patientId,
                prescriptionDate: prescriptionDate || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                is_psychotropic: isPsychotropic,
                psychotropic_number: psychotropicNumber,
                patient_address: patientAddress,
            })
            .returning({ id: prescriptions.id });

        if (!newPrescription) {
            throw new Error("Failed to create prescription record.");
        }

        const medicationRecords = medications.map((med: any) => ({
            prescriptionId: newPrescription.id,
            medicineName: med.medicineName,
            dosage: med.dosage,
            duration: med.duration,
            quantity: med.quantity,
            form: med.form,
            note: med.note,
        }));

        await db.insert(prescriptionMedications).values(medicationRecords);

        return {
            success: true,
            id: newPrescription.id,
            psychotropic_number: psychotropicNumber,
        };
    }

    async delete(id: number) {
        await db.delete(prescriptions).where(eq(prescriptions.id, id));
        return { success: true };
    }

    async getTemplates() {
        const templates = await db.select().from(prescriptionTemplates);
        const fullTemplates = await Promise.all(
            templates.map(async (template) => {
                const meds = await db
                    .select()
                    .from(prescriptionTemplateMedications)
                    .where(eq(prescriptionTemplateMedications.templateId, template.id));
                return { ...template, medications: meds };
            }),
        );
        return fullTemplates;
    }

    async createTemplate(data: any) {
        const { name, medications } = data;
        const [newTemplate] = await db
            .insert(prescriptionTemplates)
            .values({ name })
            .returning({ id: prescriptionTemplates.id });

        if (medications && medications.length > 0) {
            const medsToInsert = medications.map((med: any) => ({
                ...med,
                templateId: newTemplate.id,
            }));
            await db.insert(prescriptionTemplateMedications).values(medsToInsert);
        }
        return { success: true, id: newTemplate.id };
    }

    async deleteTemplate(id: number) {
        await db
            .delete(prescriptionTemplates)
            .where(eq(prescriptionTemplates.id, id));
        return { success: true };
    }

    async getNextPsychotropicNumber() {
        const result = await db
            .select({ id: psychotropicCounters.id })
            .from(psychotropicCounters)
            .orderBy(desc(psychotropicCounters.id))
            .limit(1);

        const latestNumber = result[0]?.id || 0;
        return latestNumber + 1;
    }

    private getAssetPath(filename: string) {
        if (process.env.IS_PACKAGED_ELECTRON === 'true' && process.env.RESOURCES_PATH) {
            return path.join(process.env.RESOURCES_PATH, filename);
        }
        return path.join(process.cwd(), '..', 'public', filename);
    }

    async getMedications() {
        const medsPath = this.getAssetPath('meds.json');
        try {
            if (!fs.existsSync(medsPath)) return [];
            const data = fs.readFileSync(medsPath, 'utf-8');
            const rawMedications = JSON.parse(data);
            return rawMedications.map((med: any) => ({
                name: (med["NOM DE MARQUE"] || "").trim(),
                form: (med["FORME"] || "").trim(),
                dosage: (med["DOSAGE"] || "").trim(),
                note: (med["NOTE"] || "").trim(),
                quantity: (med["QUANTITE"] || "").trim(),
                duration: (med["DUREE"] || "").trim(),
            }));
        } catch (error) {
            console.error("Failed to read meds.json:", error);
            return [];
        }
    }
}

export const prescriptionService = new PrescriptionService();
