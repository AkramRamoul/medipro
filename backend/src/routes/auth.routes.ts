import { Router } from 'express';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import bcrypt from 'bcryptjs';

const router = Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['doctor', 'receptionist', 'admin']),
});

// Login route
router.post('/login', async (req, res, next) => {
    try {
        console.log(`[Auth] Login attempt for: ${req.body.email}`);
        const { email, password } = loginSchema.parse(req.body);
        const user = await userService.findByEmail(email);

        if (!user) {
            console.log(`[Auth] User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[Auth] Password match for ${email}: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = authService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            requiresPasswordChange: user.requires_password_change ?? false,
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                requiresPasswordChange: user.requires_password_change ?? false,
            }
        });
    } catch (error) {
        next(error);
    }
});

// Register route (Admin only)
router.post('/register', authMiddleware, authorize(['admin']), async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);

        const existing = await userService.findByEmail(data.email);
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = await userService.createUser(data);
        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        next(error);
    }
});

// Bootstrap route (Only works if no users exist)
router.post('/bootstrap', async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        if (users.length > 0) {
            return res.status(403).json({ success: false, message: 'Bootstrap already completed' });
        }

        const data = registerSchema.parse(req.body);
        const newUser = await userService.createUser({
            ...data,
            role: 'admin', // Force admin for bootstrap
            requires_password_change: true
        });

        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                requiresPasswordChange: true,
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get current user data
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await userService.findById(req.user!.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                requiresPasswordChange: user.requires_password_change ?? false,
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get available accounts for login selection (Public - excludes admins)
router.get('/accounts', async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users
            .filter(u => u.role !== 'admin')
            .map(u => ({
                id: u.id,
                email: u.email,
                role: u.role
            }))
        );
    } catch (error) {
        next(error);
    }
});

const forceResetSchema = z.object({
    newPassword: z.string().min(6),
});

// Force password reset
router.post('/force-reset', authMiddleware, async (req, res, next) => {
    try {
        const { newPassword } = forceResetSchema.parse(req.body);
        const userId = req.user!.userId;
        
        await userService.forcePasswordReset(userId, newPassword);
        const user = await userService.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const token = authService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            requiresPasswordChange: false,
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                requiresPasswordChange: false,
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
