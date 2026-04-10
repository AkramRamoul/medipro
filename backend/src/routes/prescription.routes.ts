import { Router } from 'express';
import { prescriptionService } from '../services/prescription.service';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Get all prescriptions
router.get('/', authorize('VIEW_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const prescriptions = await prescriptionService.getAll();
        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
});

// Get all medications
router.get('/medications', authorize('VIEW_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const medications = await prescriptionService.getMedications();
        console.log(`[API] Returning ${medications.length} medications to frontend.`);
        res.json(medications);
    } catch (error) {
        console.error(`[API] Error fetching medications:`, error);
        next(error);
    }
});

// Get next psychotropic number
router.get('/next-psychotropic', authorize('CREATE_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const nextNumber = await prescriptionService.getNextPsychotropicNumber();
        res.json({ nextNumber });
    } catch (error) {
        next(error);
    }
});

// Get prescription templates
router.get('/templates', authorize('VIEW_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const templates = await prescriptionService.getTemplates();
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

// Get prescriptions for a specific patient
router.get('/patient/:patientId', authorize('VIEW_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const prescriptions = await prescriptionService.getByPatientId(Number(req.params.patientId));
        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
});

// Get prescription by id
router.get('/:id', authorize('VIEW_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const prescription = await prescriptionService.getById(Number(req.params.id));
        res.json(prescription);
    } catch (error) {
        next(error);
    }
});

// Create prescription
router.post('/', authorize('CREATE_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const result = await prescriptionService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Create prescription template
router.post('/templates', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await prescriptionService.createTemplate(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update prescription template
router.put('/templates/:id', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await prescriptionService.updateTemplate(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete prescription
router.delete('/:id', authorize('CREATE_PRESCRIPTIONS'), async (req, res, next) => {
    try {
        const result = await prescriptionService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete prescription template
router.delete('/templates/:id', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await prescriptionService.deleteTemplate(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
