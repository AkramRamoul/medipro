import { Router } from 'express';
import patientRoutes from './patient.routes';
import consultationRoutes from './consultation.routes';
import prescriptionRoutes from './prescription.routes';
import userRoutes from './user.routes';
import documentRoutes from './document.routes';
import settingsRoutes from './settings.routes';
import appointmentRoutes from './appointment.routes';

import expenseRoutes from './expense.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Auth routes (some are public, middleware handled inside authRoutes)
router.use('/auth', authRoutes);

// Protected entity routes
router.use('/patients', authMiddleware, patientRoutes);
router.use('/consultations', authMiddleware, consultationRoutes);
router.use('/prescriptions', authMiddleware, prescriptionRoutes);
router.use('/users', userRoutes);
router.use('/documents', authMiddleware, documentRoutes);
router.use('/settings', authMiddleware, settingsRoutes);
router.use('/appointments', authMiddleware, appointmentRoutes);
router.use('/expenses', authMiddleware, expenseRoutes);

export default router;
