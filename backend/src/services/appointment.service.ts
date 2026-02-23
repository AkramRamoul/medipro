import { db } from '../db';
import { appointments, patients, consultations } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class AppointmentService {
    async getAll() {
        const result = await db
            .select({
                id: appointments.id,
                patientId: appointments.patientId,
                date: appointments.date,
                time: appointments.time,
                title: appointments.title,
                notes: appointments.notes,
                status: appointments.status,
                patientFirstName: patients.first_name,
                patientLastName: patients.last_name,
            })
            .from(appointments)
            .innerJoin(patients, eq(appointments.patientId, patients.id))
            .orderBy(desc(appointments.date));
        return result;
    }

    async getTodayAppointments() {
        const result = await db
            .select({
                id: appointments.id,
                patientId: appointments.patientId,
                date: appointments.date,
                time: appointments.time,
                title: appointments.title,
                notes: appointments.notes,
                status: appointments.status,
                patient: {
                    id: patients.id,
                    first_name: patients.first_name,
                    last_name: patients.last_name,
                },
                consultation: {
                    id: consultations.id,
                    status: consultations.status,
                }
            })
            .from(appointments)
            .innerJoin(patients, eq(appointments.patientId, patients.id))
            .leftJoin(consultations, eq(consultations.appointmentId, appointments.id))
            .where(sql`date(${appointments.date}) = date('now')`)
            .orderBy(appointments.time);
        return result;
    }

    async getByPatientId(patientId: number) {
        const result = await db
            .select()
            .from(appointments)
            .where(eq(appointments.patientId, patientId))
            .orderBy(desc(appointments.date));
        return result;
    }

    async create(data: any) {
        const result = await db.insert(appointments).values(data).returning({ id: appointments.id });
        return result[0];
    }

    async delete(id: number) {
        await db.delete(appointments).where(eq(appointments.id, id));
        return { success: true };
    }

    async update(id: number, data: any) {
        await db.update(appointments).set(data).where(eq(appointments.id, id));
        return { success: true };
    }
}

export const appointmentService = new AppointmentService();
