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

router.get('/check-password-exists', async (req, res, next) => {
    try {
        const exists = await userService.checkPasswordExists();
        res.json({ exists });
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
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to delete user" });
    }
});

router.patch('/:id/role', authMiddleware, authorize(['admin']), async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['doctor', 'receptionist', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        const result = await userService.updateUserRole(parseInt(req.params.id as string, 10), role);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to update role" });
    }
});

// Global Password management
router.post('/create-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const result = await userService.createPassword(password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/change-password', async (req, res, next) => {
    try {
        const { oldPassword, password } = req.body;
        const result = await userService.changePassword(oldPassword, password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/remove-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const result = await userService.removePassword(password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/verify-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const isValid = await userService.checkPassword(password);
        res.json({ success: isValid });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
