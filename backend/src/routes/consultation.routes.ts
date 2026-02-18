import { Router } from 'express';
import { consultationService } from '../services/consultation.service';

const router = Router();

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await consultationService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Get monthly patients stats
router.get('/monthly-patients', async (req, res, next) => {
    try {
        const data = await consultationService.getMonthlyPatients();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Get common diagnostics
router.get('/diagnostics/common', async (req, res, next) => {
    try {
        const diagnostics = await consultationService.getCommonDiagnostics();
        res.json(diagnostics);
    } catch (error) {
        next(error);
    }
});

// Get custom field definitions
router.get('/settings/custom-fields', async (req, res, next) => {
    try {
        const fields = await consultationService.getCustomFieldDefinitions();
        res.json(fields);
    } catch (error) {
        next(error);
    }
});

// Get all consultations
router.get('/', async (req, res, next) => {
    try {
        const consultations = await consultationService.getAll();
        res.json(consultations);
    } catch (error) {
        next(error);
    }
});

// Get patient vitals from consultations
router.get('/patient/:patientId/vitals', async (req, res, next) => {
    try {
        const vitals = await consultationService.getVitals(Number(req.params.patientId));
        res.json(vitals);
    } catch (error) {
        next(error);
    }
});

// Get consultations for a specific patient
router.get('/patient/:patientId', async (req, res, next) => {
    try {
        const consultations = await consultationService.getByPatientId(Number(req.params.patientId));
        res.json(consultations);
    } catch (error) {
        next(error);
    }
});

// Get consultation by id
router.get('/:id', async (req, res, next) => {
    try {
        const consultation = await consultationService.getById(Number(req.params.id));
        res.json(consultation);
    } catch (error) {
        next(error);
    }
});

// Create consultation
router.post('/', async (req, res, next) => {
    try {
        const result = await consultationService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update consultation
router.put('/:id', async (req, res, next) => {
    try {
        const result = await consultationService.update(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete consultation
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await consultationService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
