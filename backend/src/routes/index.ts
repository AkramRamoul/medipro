import { Router } from 'express';
import patientRoutes from './patient.routes';
import consultationRoutes from './consultation.routes';
import prescriptionRoutes from './prescription.routes';
import userRoutes from './user.routes';
import documentRoutes from './document.routes';
import settingsRoutes from './settings.routes';
import appointmentRoutes from './appointment.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Entity routes
router.use('/patients', patientRoutes);
router.use('/consultations', consultationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/settings', settingsRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
