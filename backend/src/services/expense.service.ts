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
        try {
            console.log(`[ExpenseService] Creating expense:`, data);
            
            // Ensure amount is a number and not NaN
            const amount = Number(data.amount);
            if (isNaN(amount)) {
                throw new Error(`Invalid amount: ${data.amount}`);
            }

            const result = await db.insert(expenses).values({
                description: data.description,
                amount: amount,
                category: data.category,
                date: data.date || new Date().toISOString(),
            });
            
            console.log(`[ExpenseService] Insert result:`, result);
            
            // Handle BigInt and different result structures safely
            const lastId = result.lastInsertRowid !== undefined 
                ? Number(result.lastInsertRowid) 
                : null;
                
            return { success: true, id: lastId };
        } catch (error) {
            console.error(`[ExpenseService] Error creating expense:`, error);
            throw error;
        }
    }

    async delete(id: number) {
        await db.delete(expenses).where(eq(expenses.id, id));
        return { success: true };
    }
}

export const expenseService = new ExpenseService();
