import { db } from '../db';
import { Document as DocumentTable, documentTemplates, patients } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class DocumentService {
    async getByPatientId(patientId: number) {
        const result = await db
            .select()
            .from(DocumentTable)
            .where(eq(DocumentTable.patientId, patientId))
            .orderBy(desc(DocumentTable.createdAt));
        return result;
    }

    async getById(id: number) {
        const [doc] = await db
            .select()
            .from(DocumentTable)
            .where(eq(DocumentTable.id, id));
        return doc;
    }

    async getAll() {
        const result = await db
            .select({
                id: DocumentTable.id,
                patientId: DocumentTable.patientId,
                patientFirstName: patients.first_name,
                patientLastName: patients.last_name,
                patientAge: patients.age,
                name: DocumentTable.name,
                type: DocumentTable.type,
                documentDate: DocumentTable.documentDate,
                createdAt: DocumentTable.createdAt,
                content: DocumentTable.content,
            })
            .from(DocumentTable)
            .leftJoin(patients, eq(DocumentTable.patientId, patients.id))
            .orderBy(desc(DocumentTable.createdAt));
        return result;
    }

    async create(data: any) {
        const [insertedDoc] = await db
            .insert(DocumentTable)
            .values({
                ...data,
                createdAt: new Date().toISOString(),
                documentDate: data.documentDate || new Date().toISOString(),
            })
            .returning({ id: DocumentTable.id });

        return insertedDoc.id;
    }

    async delete(id: number) {
        await db.delete(DocumentTable).where(eq(DocumentTable.id, id));
        return { success: true };
    }

    // Template methods
    async getTemplates() {
        return await db
            .select()
            .from(documentTemplates)
            .orderBy(desc(documentTemplates.createdAt));
    }

    async getTemplateById(id: number) {
        const [template] = await db
            .select()
            .from(documentTemplates)
            .where(eq(documentTemplates.id, id));
        return template;
    }

    async createTemplate(data: any) {
        const [inserted] = await db
            .insert(documentTemplates)
            .values({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .returning({ id: documentTemplates.id });
        return { success: true, id: inserted.id };
    }

    async updateTemplate(id: number, data: any) {
        await db
            .update(documentTemplates)
            .set({
                ...data,
                updatedAt: new Date().toISOString()
            })
            .where(eq(documentTemplates.id, id));
        return { success: true };
    }

    async deleteTemplate(id: number) {
        await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
        return { success: true };
    }
}

export const documentService = new DocumentService();
