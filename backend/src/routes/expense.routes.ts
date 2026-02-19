import { Router } from 'express';
import { expenseService } from '../services/expense.service';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Apply authorize to all routes - only doctors and admins can manage expenses
router.use(authorize(['doctor', 'admin']));

// Get all expenses
router.get('/', async (req, res, next) => {
    try {
        const expenses = await expenseService.getAll();
        res.json(expenses);
    } catch (error) {
        next(error);
    }
});

// Create expense
router.post('/', async (req, res, next) => {
    try {
        const result = await expenseService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Delete expense
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await expenseService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
