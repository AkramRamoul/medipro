import { Router } from 'express';
import { prescriptionService } from '../services/prescription.service';

const router = Router();

// Get all prescriptions
router.get('/', async (req, res, next) => {
    try {
        const prescriptions = await prescriptionService.getAll();
        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
});

// Get all medications
router.get('/medications', async (req, res, next) => {
    try {
        const medications = await prescriptionService.getMedications();
        res.json(medications);
    } catch (error) {
        next(error);
    }
});

// Get next psychotropic number
router.get('/next-psychotropic', async (req, res, next) => {
    try {
        const nextNumber = await prescriptionService.getNextPsychotropicNumber();
        res.json({ nextNumber });
    } catch (error) {
        next(error);
    }
});

// Get prescription templates
router.get('/templates', async (req, res, next) => {
    try {
        const templates = await prescriptionService.getTemplates();
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

// Get prescriptions for a specific patient
router.get('/patient/:patientId', async (req, res, next) => {
    try {
        const prescriptions = await prescriptionService.getByPatientId(Number(req.params.patientId));
        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
});

// Get prescription by id
router.get('/:id', async (req, res, next) => {
    try {
        const prescription = await prescriptionService.getById(Number(req.params.id));
        res.json(prescription);
    } catch (error) {
        next(error);
    }
});

// Create prescription
router.post('/', async (req, res, next) => {
    try {
        const result = await prescriptionService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Create prescription template
router.post('/templates', async (req, res, next) => {
    try {
        const result = await prescriptionService.createTemplate(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Delete prescription
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await prescriptionService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete prescription template
router.delete('/templates/:id', async (req, res, next) => {
    try {
        const result = await prescriptionService.deleteTemplate(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
