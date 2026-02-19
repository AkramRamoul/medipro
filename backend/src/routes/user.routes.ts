import { Router } from 'express';
import { userService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Public routes for app initialization and license
router.get('/init', async (req, res, next) => {
    try {
        const data = await userService.getAppInitData();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/machine-id', async (req, res, next) => {
    try {
        const id = await userService.getMachineId();
        res.json({ id });
    } catch (error) {
        next(error);
    }
});

router.post('/license-submit', async (req, res, next) => {
    try {
        const { key, payload } = req.body;
        const isValid = await userService.validateLicense(key, payload);
        res.json({ isValid });
    } catch (error) {
        next(error);
    }
});

// Admin-only routes for user management
router.get('/', authMiddleware, authorize(['admin']), async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authMiddleware, authorize(['admin']), async (req, res, next) => {
    try {
        const result = await userService.deleteUser(parseInt(req.params.id as string, 10));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Settings & Password management (Protected, user can change their own if needed, but for now simple)
router.post('/change-password', authMiddleware, async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await userService.changePassword(oldPassword, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
