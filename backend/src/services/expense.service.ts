import { db } from '../db';
import { expenses } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class ExpenseService {
    async getAll() {
        return await db
            .select()
            .from(expenses)
            .orderBy(desc(expenses.date));
    }

    async create(data: { description: string; amount: number; category: string; date?: string }) {
        const result = await db.insert(expenses).values({
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: data.date || new Date().toISOString(),
        });
        return { success: true, id: Number(result.lastInsertRowid) };
    }

    async delete(id: number) {
        await db.delete(expenses).where(eq(expenses.id, id));
        return { success: true };
    }
}

export const expenseService = new ExpenseService();
