import { db } from '../db';
import { patients, consultations, prescriptions, prescriptionMedications, Document as DocumentTable, labResults } from '../db/schema';
import { eq, sql, desc, or, like } from 'drizzle-orm';
import ExcelJS from 'exceljs';
export class PatientService {
    async getAll() {
        const result = await db
            .select({
                id: patients.id,
                firstname: patients.first_name,
                lastname: patients.last_name,
                age: patients.age,
                gender: patients.gender,
                contact: patients.contact,
                address: patients.address,
                weight: patients.weight,
                bloodType: patients.bloodType,
                medicalHistory: patients.medicalHistory,
                allergies: patients.allergies,
                notes: patients.notes,
                createdAt: patients.createdAt,
                status: patients.status,
                tags: patients.tags,
                lastVisit: sql`MAX(${consultations.date})`.as("lastVisit"),
            })
            .from(patients)
            .leftJoin(consultations, eq(patients.id, consultations.patientId))
            .where(sql`${patients.status} != 'deleted'`)
            .groupBy(patients.id);

        return result.map((patient: any) => ({
            ...patient,
            createdAt: patient.createdAt ? new Date(patient.createdAt).toISOString() : null,
            lastVisit:
                patient.lastVisit && typeof patient.lastVisit === "string"
                    ? new Date(patient.lastVisit).toISOString()
                    : null,
        }));
    }

    async getById(id: number) {
        const [patient] = await db
            .select()
            .from(patients)
            .where(eq(patients.id, id));

        if (!patient) {
            throw new Error("Patient not found");
        }

        return {
            ...patient,
            createdAt: patient.createdAt ? new Date(patient.createdAt).toISOString().split("T")[0] : null,
        };
    }

    async create(data: any) {
        const [insertedPatient] = await db
            .insert(patients)
            .values({
                ...data,
                createdAt: new Date().toISOString(),
            })
            .returning({ id: patients.id });

        return insertedPatient.id;
    }

    async update(id: number, data: any) {
        await db
            .update(patients)
            .set(data)
            .where(eq(patients.id, id));
        return { success: true };
    }

    async delete(id: number) {
        await db
            .update(patients)
            .set({ status: "deleted" })
            .where(eq(patients.id, id));
        return { success: true };
    }

    async getTimeline(patientId: number) {
        const [patient] = await db
            .select({ createdAt: patients.createdAt })
            .from(patients)
            .where(eq(patients.id, patientId));

        if (!patient) throw new Error("Patient not found");

        const patientConsultations = await db
            .select({
                date: consultations.date,
                reason: consultations.reason,
                diagnosis: consultations.diagnosis,
                notes: consultations.notes,
            })
            .from(consultations)
            .where(eq(consultations.patientId, patientId));

        const patientPrescriptions = await db
            .select({
                id: prescriptions.id,
                date: prescriptions.prescriptionDate,
                medications: prescriptionMedications,
            })
            .from(prescriptions)
            .leftJoin(
                prescriptionMedications,
                eq(prescriptions.id, prescriptionMedications.prescriptionId),
            )
            .where(eq(prescriptions.patientId, patientId));

        const patientDocuments = await db
            .select({
                id: DocumentTable.id,
                type: DocumentTable.type,
                name: DocumentTable.name,
                content: DocumentTable.content,
                createdAt: DocumentTable.createdAt,
            })
            .from(DocumentTable)
            .where(eq(DocumentTable.patientId, patientId));

        const patientLabResults = await db
            .select({
                panelId: labResults.panelId,
                panelName: labResults.panelName,
                testName: labResults.testName,
                value: labResults.value,
                unit: labResults.unit,
                referenceMin: labResults.referenceMin,
                referenceMax: labResults.referenceMax,
                status: labResults.status,
                measuredAt: labResults.measuredAt,
            })
            .from(labResults)
            .where(eq(labResults.patientId, patientId))
            .orderBy(desc(labResults.measuredAt));

        const prescriptionsMap = new Map();
        patientPrescriptions.forEach((row) => {
            if (!prescriptionsMap.has(row.id)) {
                prescriptionsMap.set(row.id, {
                    date: row.date,
                    medications: [],
                });
            }
            if (row.medications) {
                prescriptionsMap.get(row.id).medications.push(row.medications);
            }
        });
        const groupedPrescriptions = Array.from(prescriptionsMap.values());

        const events: any[] = [];

        if (patient.createdAt) {
            events.push({
                date: patient.createdAt,
                type: "Administrative",
                subType: "Patient créé",
                summary: "Profil patient créé",
                details: null,
            });
        }

        patientConsultations.forEach((c) => {
            let details = `Diagnostic: ${c.diagnosis}`;
            if (c.notes) {
                details += `\nNote: ${c.notes.slice(0, 50)}${c.notes.length > 50 ? "..." : ""}`;
            }
            events.push({
                date: c.date || "",
                type: "Consultation",
                summary: `Motif de consultation: ${c.reason}`,
                details: details,
            });
        });

        groupedPrescriptions.forEach((p: any) => {
            const medsList = p.medications
                .map(
                    (m: any) =>
                        `${m.medicineName} ${m.dosage}${m.duration ? ` – ${m.duration}` : ""}`,
                )
                .join("\n");
            events.push({
                date: p.date,
                type: "Ordonnance",
                summary: "Ordonnance",
                details: medsList || "Aucun médicament prescrit",
            });
        });

        patientDocuments
            .filter((doc) => doc.type === "certificate" || doc.type === "blood" || doc.type === "template")
            .forEach((doc) => {
                let summary = "Document";
                let details = null;

                if (doc.type === "blood") {
                    summary = "Analyse de sang";
                    if (doc.content?.results && Array.isArray(doc.content.results)) {
                        details = doc.content.results.join(", ");
                    }
                } else if (doc.type === "certificate") {
                    summary = "Certificat médical";
                    if (doc.content?.diagnosis) {
                        details = `Diagnostic: ${doc.content.diagnosis}`;
                        if (doc.content.restStartDate && doc.content.restEndDate) {
                            const startDate = new Date(
                                doc.content.restStartDate,
                            ).toLocaleDateString("fr-FR");
                            const endDate = new Date(
                                doc.content.restEndDate,
                            ).toLocaleDateString("fr-FR");
                            details += `\nRepos: ${startDate} - ${endDate}`;
                        }
                    }
                } else if (doc.type === "template") {
                    // Documents created from templates (Custom letters)
                    // The document name/title is actually saved in `name`, but the timeline query
                    // doesn't fetch `name` from `DocumentTable` currently. I need to update the query as well.
                    // For now, I'll use doc.name if we query it, or a generic title.
                    // Oh wait, looking at the query, `name` is not selected. I should modify the SQL select first.
                    summary = (doc as any).name || "Lettre / Document";
                    
                    // The content is HTML, extracting text might be complex, or we can just leave details empty
                    // or try to strip HTML tags if possible.
                    if (doc.content && typeof doc.content === 'string') {
                         // Simple HTML stripper for details preview
                         const stripped = doc.content.replace(/<[^>]*>?/gm, '');
                         details = stripped.slice(0, 50) + (stripped.length > 50 ? "..." : "");
                    }
                }

                events.push({
                    date: doc.createdAt || "",
                    type: "Document",
                    summary: summary,
                    details: details,
                });
            });

        const groupedLabPanels = new Map();
        patientLabResults.forEach((row) => {
            if (!groupedLabPanels.has(row.panelId)) {
                groupedLabPanels.set(row.panelId, {
                    panelName: row.panelName,
                    measuredAt: row.measuredAt,
                    entries: [],
                });
            }
            groupedLabPanels.get(row.panelId).entries.push(row);
        });

        Array.from(groupedLabPanels.values()).forEach((panel: any) => {
            const abnormalEntries = panel.entries.filter(
                (entry: any) => entry.status === "high" || entry.status === "low",
            );
            const summary = `${panel.panelName} (${panel.entries.length} paramètre${panel.entries.length > 1 ? "s" : ""})`;
            const details = panel.entries
                .map((entry: any) => {
                    const range =
                        entry.referenceMin !== null && entry.referenceMax !== null
                            ? ` [${entry.referenceMin} - ${entry.referenceMax}]`
                            : "";
                    const statusTag =
                        entry.status === "high"
                            ? " (élevé)"
                            : entry.status === "low"
                                ? " (bas)"
                                : "";
                    return `${entry.testName}: ${entry.value}${entry.unit ? ` ${entry.unit}` : ""}${range}${statusTag}`;
                })
                .join("\n");

            events.push({
                date: panel.measuredAt || "",
                type: "Biologie",
                summary,
                details: abnormalEntries.length > 0
                    ? `Anomalies: ${abnormalEntries.length}\n${details}`
                    : details,
            });
        });

        events.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        return events;
    }

    async getLabResults(patientId: number) {
        const results = await db
            .select()
            .from(labResults)
            .where(eq(labResults.patientId, patientId))
            .orderBy(desc(labResults.measuredAt));

        // Group by panelId
        const groupedPanels = new Map();
        results.forEach((row) => {
            if (!groupedPanels.has(row.panelId)) {
                groupedPanels.set(row.panelId, {
                    panelId: row.panelId,
                    panelName: row.panelName,
                    measuredAt: row.measuredAt,
                    notes: row.notes,
                    patientId: row.patientId,
                    entries: [],
                });
            }
            groupedPanels.get(row.panelId).entries.push(row);
        });

        return Array.from(groupedPanels.values());
    }

    async addLabPanel(data: any) {
        const { patientId, panelName, measuredAt, notes, entries } = data;
        const panelId = `panel-${Date.now()}`;

        const records = entries.map((entry: any) => {
            // Calculate status based on value and reference ranges
            let status: "low" | "normal" | "high" = "normal";
            const val = Number(entry.value);
            const min = entry.referenceMin !== null ? Number(entry.referenceMin) : null;
            const max = entry.referenceMax !== null ? Number(entry.referenceMax) : null;

            if (min !== null && val < min) status = "low";
            else if (max !== null && val > max) status = "high";

            return {
                panelId,
                patientId,
                panelName,
                measuredAt,
                notes,
                testName: entry.testName,
                value: entry.value,
                unit: entry.unit,
                referenceMin: entry.referenceMin,
                referenceMax: entry.referenceMax,
                status,
            };
        });

        await db.insert(labResults).values(records);
        return { success: true };
    }

    async deleteLabPanel(panelId: string) {
        await db.delete(labResults).where(eq(labResults.panelId, panelId));
        return { success: true };
    }

    async exportLabResultsExcel(patientId: number) {
        const results = await this.getLabResults(patientId);
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Doc App';
        workbook.created = new Date();
        
        const sheet = workbook.addWorksheet('Bilan Biologique');

        sheet.columns = [
            { header: 'Panel', key: 'panel', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Paramètre', key: 'test', width: 20 },
            { header: 'Valeur', key: 'value', width: 15 },
            { header: 'Unité', key: 'unit', width: 10 },
            { header: 'Min Réf', key: 'min', width: 10 },
            { header: 'Max Réf', key: 'max', width: 10 },
            { header: 'Statut', key: 'status', width: 15 },
        ];

        // Style the header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        results.forEach((panel: any) => {
            const dateStr = panel.measuredAt ? new Date(panel.measuredAt).toLocaleDateString("fr-FR") : '';
            
            panel.entries.forEach((entry: any) => {
                let statusLabel = 'Normal';
                if (entry.status === 'high') statusLabel = 'Élevé';
                if (entry.status === 'low') statusLabel = 'Bas';

                const row = sheet.addRow({
                    panel: panel.panelName,
                    date: dateStr,
                    test: entry.testName,
                    value: entry.value,
                    unit: entry.unit || '',
                    min: entry.referenceMin ?? '',
                    max: entry.referenceMax ?? '',
                    status: statusLabel
                });

                // Highlight abnormal results
                if (entry.status === 'high' || entry.status === 'low') {
                    row.getCell('status').font = { color: { argb: 'FFFF0000' }, bold: true };
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        
        return { 
            buffer: buffer, 
            filename: `bilan_biologique_patient_${patientId}.xlsx` 
        };
    }

    async search(query: string) {
        if (!query || query.length < 2) return [];

        const patientResults = await db
            .select({
                id: patients.id,
                firstName: patients.first_name,
                lastName: patients.last_name,
            })
            .from(patients)
            .where(
                or(
                    like(patients.first_name, `%${query}%`),
                    like(patients.last_name, `%${query}%`),
                    like(patients.contact, `%${query}%`),
                ),
            )
            .limit(5);

        return patientResults.map((p) => ({
            type: "patient",
            id: p.id,
            title: `${p.firstName} ${p.lastName}`,
            subtitle: "Patient",
        }));
    }
}

export const patientService = new PatientService();
