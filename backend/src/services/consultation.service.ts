import { db } from '../db';
import { consultations, patients, expenses, prescriptions, appointments, customFields } from '../db/schema';
import { eq, sql, desc, and, isNotNull } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export class ConsultationService {
    async getAll() {
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

        return result;
    }

    async getById(id: number) {
        const result = await db
            .select()
            .from(consultations)
            .where(eq(consultations.id, id));
        return result;
    }

    async getByPatientId(patientId: number) {
        const result = await db
            .select()
            .from(consultations)
            .where(eq(consultations.patientId, patientId))
            .orderBy(desc(consultations.date));
        return result;
    }

    async create(data: any) {
        const { vitals, ...rest } = data;

        await db.insert(consultations).values({
            ...rest,
            bloodPressure:
                vitals?.bpSystolic && vitals?.bpDiastolic
                    ? `${vitals.bpSystolic}/${vitals.bpDiastolic}`
                    : data.bloodPressure || null,
            glucose: vitals?.glucose ? Number(vitals.glucose) : data.glucose || null,
            weight: vitals?.weight?.toString() || data.weight || null,
            amountPaid: data.amountPaid ? Math.round(Number(data.amountPaid)) : null,
            customFields: data.customFields || {},
            date: data.date || new Date().toISOString(),
        });

        return { success: true };
    }

    async update(id: number, data: any) {
        const { id: _, ...rest } = data;
        if (rest.amountPaid !== undefined && rest.amountPaid !== null) {
            rest.amountPaid = Math.round(Number(rest.amountPaid));
        }
        await db.update(consultations).set(rest).where(eq(consultations.id, id));
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
                .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
                .from(consultations)
                .where(sql`date(${consultations.date}) = date('now')`),
            db
                .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
                .from(consultations)
                .where(
                    sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
                ),
            db
                .select({ sum: sql<number>`sum(${expenses.amount})` })
                .from(expenses)
                .where(sql`date(${expenses.date}) = date('now')`),
            db
                .select({ sum: sql<number>`sum(${expenses.amount})` })
                .from(expenses)
                .where(
                    sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
                ),
            db
                .select({ sum: sql<number>`sum(${expenses.amount})` })
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
        ]);

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
        };
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

    async getCommonDiagnostics() {
        const consultationsPath = path.join(process.cwd(), '..', 'public', 'common_consultations.json');
        try {
            const data = fs.readFileSync(consultationsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to read common_consultations.json:", error);
            // Fallback to DB if file fails
            const result = await db
                .select({ name: consultations.diagnosis })
                .from(consultations)
                .where(isNotNull(consultations.diagnosis))
                .groupBy(consultations.diagnosis)
                .orderBy(sql`COUNT(*) DESC`)
                .limit(20);
            return result;
        }
    }

    async getCustomFieldDefinitions() {
        const result = await db
            .select()
            .from(customFields)
            .where(eq(customFields.isActive, true));
        return result;
    }
}

export const consultationService = new ConsultationService();
