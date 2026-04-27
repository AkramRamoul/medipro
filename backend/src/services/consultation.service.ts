import { db } from '../db';
import { consultations, patients, expenses, prescriptions, appointments, customFields, examForms } from '../db/schema';
import { eq, sql, desc, and, isNotNull } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { Role, hasPermission } from '../middleware/role.middleware';

export class ConsultationService {
    private maskConsultation(c: any, role: Role) {
        if (hasPermission(role, 'VIEW_MEDICAL_RECORDS')) {
            return c;
        }

        // Mask sensitive medical fields
        return {
            ...c,
            reason: c.reason ? '[SENSITIVE]' : c.reason,
            diagnosis: c.diagnosis ? '[SENSITIVE]' : c.diagnosis,
            notes: c.notes ? '[SENSITIVE]' : c.notes,
            symptoms: c.symptoms ? '[SENSITIVE]' : c.symptoms,
            customFields: {}, // Hide clinical custom fields
            formId: null,
            formData: {},
        };
    }

    async getAll(role?: Role) {
        const result = await db
            .select({
                id: consultations.id,
                date: consultations.date,
                reason: consultations.reason,
                diagnosis: consultations.diagnosis,
                notes: consultations.notes,
                bloodPressure: consultations.bloodPressure,
                glucose: consultations.glucose,
                weight: consultations.weight,
                customFields: consultations.customFields,
                formId: consultations.formId,
                formData: consultations.formData,
                patient: {
                    id: patients.id,
                    first_name: patients.first_name,
                    last_name: patients.last_name,
                    age: patients.age,
                },
            })
            .from(consultations)
            .leftJoin(patients, eq(consultations.patientId, patients.id))
            .orderBy(desc(consultations.date));

        if (!role) return result;
        return result.map(c => this.maskConsultation(c, role));
    }

    async getById(id: number, role?: Role) {
        const [result] = await db
            .select()
            .from(consultations)
            .where(eq(consultations.id, id));

        if (!result || !role) return result;
        return this.maskConsultation(result, role);
    }

    async getByPatientId(patientId: number, role?: Role) {
        const result = await db
            .select()
            .from(consultations)
            .where(eq(consultations.patientId, patientId))
            .orderBy(desc(consultations.date));

        if (!role) return result;
        return result.map(c => this.maskConsultation(c, role));
    }

    async create(data: any) {
        const { vitals, appointmentId, ...rest } = data;

        const [result] = await db.insert(consultations).values({
            ...rest,
            appointmentId: appointmentId ? Number(appointmentId) : null,
            bloodPressure:
                vitals?.bpSystolic && vitals?.bpDiastolic
                    ? `${vitals.bpSystolic}/${vitals.bpDiastolic}`
                    : data.bloodPressure || null,
            glucose: vitals?.glucose ? Number(vitals.glucose) : data.glucose || null,
            weight: vitals?.weight?.toString() || data.weight || null,
            amountPaid: data.amountPaid ? Math.round(Number(data.amountPaid)) : null,
            customFields: data.customFields || {},
            date: data.date || new Date().toISOString(),
            status: data.status || "completed", // Default to completed when saved from form
        }).returning({ id: consultations.id });

        if (appointmentId) {
            await db.update(appointments).set({ status: 'checked_in' }).where(eq(appointments.id, Number(appointmentId)));
        }

        return { success: true, id: result.id };
    }

    async startConsultation(patientId: number, appointmentId: number, reason: string) {
        const [result] = await db.insert(consultations).values({
            patientId,
            appointmentId,
            reason,
            diagnosis: '',
            status: 'in_progress',
            date: new Date().toISOString(),
        }).returning({ id: consultations.id });

        await db.update(appointments).set({ status: 'checked_in' }).where(eq(appointments.id, appointmentId));

        return { success: true, id: result.id };
    }

    async update(id: number, data: any) {
        const { id: _, vitals, ...rest } = data;
        
        const updateData: any = { ...rest };
        
        if (vitals) {
            if (vitals.bpSystolic && vitals.bpDiastolic) {
                updateData.bloodPressure = `${vitals.bpSystolic}/${vitals.bpDiastolic}`;
            }
            if (vitals.glucose !== undefined) {
                updateData.glucose = vitals.glucose ? Number(vitals.glucose) : null;
            }
            if (vitals.weight !== undefined) {
                updateData.weight = vitals.weight?.toString() || null;
            }
            if (vitals.temperature !== undefined) {
                updateData.temperature = vitals.temperature?.toString() || null;
            }
        }

        if (updateData.amountPaid !== undefined && updateData.amountPaid !== null) {
            updateData.amountPaid = Math.round(Number(updateData.amountPaid));
        }

        await db.update(consultations).set(updateData).where(eq(consultations.id, id));
        return { success: true };
    }

    async delete(id: number) {
        await db.delete(consultations).where(eq(consultations.id, id));
        return { success: true };
    }

    async getVitals(patientId: number) {
        const result = await db
            .select({
                date: consultations.date,
                bloodPressure: consultations.bloodPressure,
                glucose: consultations.glucose,
                weight: consultations.weight,
            })
            .from(consultations)
            .where(eq(consultations.patientId, patientId))
            .orderBy(consultations.date);

        return result;
    }

    async getDashboardStats() {
        const [
            [consultationsThisMonth],
            [consultationsLastMonth],
            [consultationsToday],
            [prescriptionsThisMonth],
            [earningsToday],
            [earningsThisMonth],
            [earningsLastMonth],
            [expensesToday],
            [expensesThisMonth],
            [expensesLastMonth],
            [totalPatients],
            [appointmentsToday],
            recentConsultations,
            [patientsThisMonth],
            [patientsLastMonth],
            commonDiagnoses,
            busiestDays,
            allPatientsConsultations,
            genderDistribution,
            ageDistribution,
            [earningsYear],
            [expensesYear],
        ] = await Promise.all([
            db
                .select({ count: sql<number>`count(*)` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ count: sql<number>`count(*)` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
                ),
            db
                .select({ count: sql<number>`count(*)` })
                .from(consultations)
                .where(sql`date(${consultations.date}) = date('now')`),
            db
                .select({ count: sql<number>`count(*)` })
                .from(prescriptions)
                .where(
                    sql`strftime('%Y-%m', ${prescriptions.prescriptionDate}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ sum: sql<number>`COALESCE(sum(${consultations.amountPaid}), 0)` })
                .from(consultations)
                .where(sql`date(${consultations.date}) = date('now')`),
            db
                .select({ sum: sql<number>`COALESCE(sum(${consultations.amountPaid}), 0)` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ sum: sql<number>`COALESCE(sum(${consultations.amountPaid}), 0)` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
                ),
            db
                .select({ sum: sql<number>`COALESCE(sum(${expenses.amount}), 0)` })
                .from(expenses)
                .where(sql`date(${expenses.date}) = date('now')`),
            db
                .select({ sum: sql<number>`COALESCE(sum(${expenses.amount}), 0)` })
                .from(expenses)
                .where(
                    sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ sum: sql<number>`COALESCE(sum(${expenses.amount}), 0)` })
                .from(expenses)
                .where(
                    sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
                ),
            db
                .select({
                    count: sql<number>`count(DISTINCT ${consultations.patientId})`,
                })
                .from(consultations)
                .where(sql`${consultations.date} >= date('now', '-12 months')`),
            db
                .select({ count: sql<number>`count(*)` })
                .from(appointments)
                .where(sql`date(${appointments.date}) = date('now')`),
            db
                .select({
                    id: patients.id,
                    firstName: patients.first_name,
                    lastName: patients.last_name,
                    reason: consultations.reason,
                    diagnosis: consultations.diagnosis,
                    date: consultations.date,
                })
                .from(consultations)
                .innerJoin(patients, eq(consultations.patientId, patients.id))
                .orderBy(sql`date(${consultations.date}) DESC`)
                .limit(5),
            db
                .select({
                    count: sql<number>`count(DISTINCT ${consultations.patientId})`,
                })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({
                    count: sql<number>`count(DISTINCT ${consultations.patientId})`,
                })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
                ),
            this.getDashboardDiagnoses(),
            db.select({
                day: sql<string>`case cast(strftime('%w', ${consultations.date}) as integer) 
                    when 0 then 'Dimanche' 
                    when 1 then 'Lundi' 
                    when 2 then 'Mardi' 
                    when 3 then 'Mercredi' 
                    when 4 then 'Jeudi' 
                    when 5 then 'Vendredi' 
                    when 6 then 'Samedi' end`,
                count: sql<number>`count(*)`
            })
                .from(consultations)
                .groupBy(sql`strftime('%w', ${consultations.date})`)
                .orderBy(desc(sql`count(*)`)),
            db.select({
                patientId: consultations.patientId,
                count: sql<number>`count(*)`
            })
                .from(consultations)
                .groupBy(consultations.patientId),
            db.select({
                gender: sql<string>`case 
                    when lower(${patients.gender}) in ('male', 'm', 'homme') then 'male'
                    when lower(${patients.gender}) in ('female', 'f', 'femme') then 'female'
                    else 'other' end`,
                count: sql<number>`count(*)`
            })
                .from(patients)
                .groupBy(sql`case 
                    when lower(${patients.gender}) in ('male', 'm', 'homme') then 'male'
                    when lower(${patients.gender}) in ('female', 'f', 'femme') then 'female'
                    else 'other' end`),
            db.select({
                ageGroup: sql<string>`case 
                    when age < 18 then 'Pédiatrie'
                    when age between 18 and 60 then 'Adulte'
                    else 'Senior' end`,
                count: sql<number>`count(*)`
            })
                .from(patients)
                .groupBy(sql`case 
                    when age < 18 then 'Pédiatrie'
                    when age between 18 and 60 then 'Adulte'
                    else 'Senior' end`),
            db
                .select({ sum: sql<number>`COALESCE(sum(${consultations.amountPaid}), 0)` })
                .from(consultations)
                .where(sql`strftime('%Y', ${consultations.date}) = strftime('%Y', CURRENT_TIMESTAMP)`),
            db
                .select({ sum: sql<number>`COALESCE(sum(${expenses.amount}), 0)` })
                .from(expenses)
                .where(sql`strftime('%Y', ${expenses.date}) = strftime('%Y', CURRENT_TIMESTAMP)`),
        ]);

        const totalUniquePatientsCount = allPatientsConsultations.length;
        const totalReturnPatientsCount = allPatientsConsultations.filter(p => p.count > 1).length;
        const retentionRate = totalUniquePatientsCount > 0
            ? (totalReturnPatientsCount / totalUniquePatientsCount) * 100
            : 0;

        // Simplified stats for now, can add more complex SQL queries if needed
        return {
            consultationsThisMonth: consultationsThisMonth.count,
            consultationsToday: consultationsToday.count,
            prescriptionsThisMonth: prescriptionsThisMonth.count,
            totalPatients: totalPatients.count,
            appointmentsToday: appointmentsToday.count,
            recentConsultations,
            consultationsLastMonth: consultationsLastMonth.count,
            patientsThisMonth: patientsThisMonth.count,
            patientsLastMonth: patientsLastMonth.count,
            earningsToday: earningsToday.sum || 0,
            earningsThisMonth: earningsThisMonth.sum || 0,
            earningsLastMonth: earningsLastMonth.sum || 0,
            expensesToday: expensesToday.sum || 0,
            expensesThisMonth: expensesThisMonth.sum || 0,
            expensesLastMonth: expensesLastMonth.sum || 0,
            commonDiagnoses: commonDiagnoses.slice(0, 5),
            busiestDays: busiestDays.slice(0, 7),
            retentionRate,
            totalReturnPatients: totalReturnPatientsCount,
            totalUniquePatients: totalUniquePatientsCount,
            genderDistribution,
            ageDistribution,
            earningsYear: earningsYear.sum || 0,
            expensesYear: expensesYear.sum || 0,
        };
    }

    async getFinancialStats() {
        const months = [
            "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
            "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
        ];

        const currentYear = new Date().getFullYear();

        const revenueResults = await db
            .select({
                month: sql<string>`strftime('%m', ${consultations.date})`,
                total: sql<number>`sum(${consultations.amountPaid})`,
            })
            .from(consultations)
            .where(sql`strftime('%Y', ${consultations.date}) = ${String(currentYear)}`)
            .groupBy(sql`strftime('%m', ${consultations.date})`);

        const expenseResults = await db
            .select({
                month: sql<string>`strftime('%m', ${expenses.date})`,
                total: sql<number>`sum(${expenses.amount})`,
            })
            .from(expenses)
            .where(sql`strftime('%Y', ${expenses.date}) = ${String(currentYear)}`)
            .groupBy(sql`strftime('%m', ${expenses.date})`);

        const revenueMap: Record<string, number> = {};
        for (const row of revenueResults) {
            revenueMap[row.month] = row.total || 0;
        }

        const expenseMap: Record<string, number> = {};
        for (const row of expenseResults) {
            expenseMap[row.month] = row.total || 0;
        }

        return months.map((name, index) => {
            const monthNumber = String(index + 1).padStart(2, "0");
            const revenue = revenueMap[monthNumber] || 0;
            const expense = expenseMap[monthNumber] || 0;
            return {
                name,
                revenue,
                expense,
                profit: revenue - expense,
            };
        });
    }

    async getExpenseBreakdown() {
        const result = await db
            .select({
                category: expenses.category,
                total: sql<number>`sum(${expenses.amount})`,
            })
            .from(expenses)
            .where(
                sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
            )
            .groupBy(expenses.category)
            .orderBy(desc(sql`sum(${expenses.amount})`));
            
        return result;
    }

    async getMonthlyPatients() {
        const months = [
            "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
            "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
        ];

        const currentYear = new Date().getFullYear();

        const results = await db
            .select({
                month: sql<string>`strftime('%m', ${consultations.date})`,
                total: sql<number>`count(DISTINCT ${consultations.patientId})`,
            })
            .from(consultations)
            .where(sql`strftime('%Y', ${consultations.date}) = ${String(currentYear)}`)
            .groupBy(sql`strftime('%m', ${consultations.date})`);

        const monthMap: Record<string, number> = {};
        for (const row of results) {
            monthMap[row.month] = row.total;
        }

        return months.map((name, index) => {
            const monthNumber = String(index + 1).padStart(2, "0");
            return {
                name,
                total: monthMap[monthNumber] || 0,
            };
        });
    }

    private getAssetPath(filename: string) {
        if (env.USER_DATA_PATH) {
            return path.join(env.USER_DATA_PATH, filename);
        }
        if (process.env.IS_PACKAGED_ELECTRON === 'true' && process.env.RESOURCES_PATH) {
            return path.join(process.env.RESOURCES_PATH, filename);
        }
        return path.join(process.cwd(), '..', 'public', filename);
    }

    async getCommonDiagnostics() {
        const consultationsPath = this.getAssetPath('common_consultations.json');
        try {
            if (!fs.existsSync(consultationsPath)) return [];
            const data = fs.readFileSync(consultationsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to read common_consultations.json:", error);
            return [];
        }
    }

    async updateCommonDiagnostics(diagnostics: any[]) {
        const consultationsPath = this.getAssetPath('common_consultations.json');
        try {
            fs.writeFileSync(consultationsPath, JSON.stringify(diagnostics, null, 4), 'utf-8');
            return { success: true };
        } catch (error) {
            console.error("Failed to write common_consultations.json:", error);
            return { success: false, error: "Failed to update diagnostics" };
        }
    }

    async getBilans() {
        const bilansPath = this.getAssetPath('common_bilans.json');
        try {
            if (!fs.existsSync(bilansPath)) return [];
            const data = fs.readFileSync(bilansPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to read common_bilans.json:", error);
            return [];
        }
    }

    async updateBilans(bilans: any[]) {
        const bilansPath = this.getAssetPath('common_bilans.json');
        try {
            fs.writeFileSync(bilansPath, JSON.stringify(bilans, null, 4), 'utf-8');
            return { success: true };
        } catch (error) {
            console.error("Failed to write common_bilans.json:", error);
            return { success: false, error: "Failed to update bilans" };
        }
    }

    async getBilanTemplates() {
        const templatesPath = this.getAssetPath('bilan_templates.json');
        try {
            if (!fs.existsSync(templatesPath)) return [];
            const data = fs.readFileSync(templatesPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to read bilan_templates.json:", error);
            return [];
        }
    }

    async updateBilanTemplates(templates: any[]) {
        const templatesPath = this.getAssetPath('bilan_templates.json');
        try {
            fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 4), 'utf-8');
            return { success: true };
        } catch (error) {
            console.error("Failed to write bilan_templates.json:", error);
            return { success: false, error: "Failed to update bilan templates" };
        }
    }

    async getDashboardDiagnoses() {
        const result = await db
            .select({
                diagnosis: consultations.diagnosis,
                count: sql<number>`count(*)`,
            })
            .from(consultations)
            .where(
                and(
                    isNotNull(consultations.diagnosis),
                    sql`${consultations.diagnosis} != ''`,
                    sql`${consultations.date} >= date('now', '-3 months')`,
                ),
            )
            .groupBy(consultations.diagnosis)
            .orderBy(sql`count(*) DESC`)
            .limit(5);
        return result;
    }

    async getCustomFieldDefinitions() {
        const result = await db
            .select()
            .from(customFields)
            .where(eq(customFields.isActive, true));
        return result;
    }
    async createCustomFieldDefinitions(data: any) {
        const [result] = await db
            .insert(customFields)
            .values({
                name: data.name,
                type: data.type,
                label: data.label,
                isActive: true,
            })
            .returning({ id: customFields.id });
        return { success: true, id: result.id };
    }

    async deleteCustomFieldDefinition(id: number) {
        await db.delete(customFields).where(eq(customFields.id, id));
        return { success: true };
    }

    // ─── Exam Form Templates ─────────────────────────────────────────────────

    async getExamForms() {
        const result = await db.select().from(examForms).orderBy(examForms.name);
        return result;
    }

    async getExamFormById(id: number) {
        const [result] = await db.select().from(examForms).where(eq(examForms.id, id));
        return result;
    }

    async createExamForm(data: { name: string; specialty: string; fields: any[]; isDefault?: boolean }) {
        const [result] = await db.insert(examForms).values({
            name: data.name,
            specialty: data.specialty || 'general',
            fields: data.fields || [],
            isDefault: data.isDefault ?? false,
        }).returning({ id: examForms.id });
        return { success: true, id: result.id };
    }

    async updateExamForm(id: number, data: { name?: string; specialty?: string; fields?: any[]; isDefault?: boolean }) {
        await db.update(examForms).set({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.specialty !== undefined && { specialty: data.specialty }),
            ...(data.fields !== undefined && { fields: data.fields }),
            ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        }).where(eq(examForms.id, id));
        return { success: true };
    }

    async deleteExamForm(id: number) {
        await db.delete(examForms).where(eq(examForms.id, id));
        return { success: true };
    }

    async getTodayConsultations() {
        const result = await db
            .select({
                id: consultations.id,
                patientId: consultations.patientId,
                appointmentId: consultations.appointmentId,
                date: consultations.date,
                reason: consultations.reason,
                status: consultations.status,
                patient: {
                    id: patients.id,
                    first_name: patients.first_name,
                    last_name: patients.last_name,
                },
            })
            .from(consultations)
            .innerJoin(patients, eq(consultations.patientId, patients.id))
            .where(sql`date(${consultations.date}) = date('now')`)
            .orderBy(desc(consultations.date));
        return result;
    }
}

export const consultationService = new ConsultationService();
