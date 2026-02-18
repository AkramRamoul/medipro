import { db } from '../db';
import { appointments, patients } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class AppointmentService {
    async getAll() {
        const result = await db
            .select({
                id: appointments.id,
                patientId: appointments.patientId,
                date: appointments.date,
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
