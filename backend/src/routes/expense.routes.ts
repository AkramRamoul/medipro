import { Router } from 'express';
import { expenseService } from '../services/expense.service';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Apply authorize to all routes - only doctors and admins can manage expenses
// Get all expenses
router.get('/', authorize('VIEW_EXPENSES'), async (req, res, next) => {
    try {
        const expenses = await expenseService.getAll();
        res.json(expenses);
    } catch (error) {
        next(error);
    }
});

// Create expense
router.post('/', authorize('MANAGE_EXPENSES'), async (req, res, next) => {
    try {
        const result = await expenseService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Delete expense
router.delete('/:id', authorize('MANAGE_EXPENSES'), async (req, res, next) => {
    try {
        const result = await expenseService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
