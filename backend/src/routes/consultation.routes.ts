import { Router } from 'express';
import { consultationService } from '../services/consultation.service';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Get dashboard stats
router.get('/stats', authorize('VIEW_DASHBOARD_STATS'), async (req, res, next) => {
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

// Update common diagnostics
router.post('/diagnostics/common', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await consultationService.updateCommonDiagnostics(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get common bilans
router.get('/bilans/common', async (req, res, next) => {
    try {
        const bilans = await consultationService.getBilans();
        res.json(bilans);
    } catch (error) {
        next(error);
    }
});

// Update common bilans
router.post('/bilans/common', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await consultationService.updateBilans(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get bilan templates
router.get('/bilans/templates', async (req, res, next) => {
    try {
        const templates = await consultationService.getBilanTemplates();
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

// Update bilan templates
router.post('/bilans/templates', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await consultationService.updateBilanTemplates(req.body);
        res.json(result);
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

// Create custom field definition
router.post('/settings/custom-fields', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await consultationService.createCustomFieldDefinitions(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete custom field definition
router.delete('/settings/custom-fields/:id', authorize('MANAGE_SETTINGS'), async (req, res, next) => {
    try {
        const result = await consultationService.deleteCustomFieldDefinition(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get all consultations
router.get('/', authorize('VIEW_PATIENTS'), async (req, res, next) => {
    try {
        const consultations = await consultationService.getAll(req.user!.role as any);
        res.json(consultations);
    } catch (error) {
        next(error);
    }
});

// Get patient vitals from consultations
router.get('/patient/:patientId/vitals', authorize('VIEW_PATIENTS'), async (req, res, next) => {
    try {
        const vitals = await consultationService.getVitals(Number(req.params.patientId));
        res.json(vitals);
    } catch (error) {
        next(error);
    }
});

// Get consultations for a specific patient
router.get('/patient/:patientId', authorize('VIEW_PATIENTS'), async (req, res, next) => {
    try {
        const consultations = await consultationService.getByPatientId(Number(req.params.patientId), req.user!.role as any);
        res.json(consultations);
    } catch (error) {
        next(error);
    }
});

// Get consultation by id
router.get('/:id', authorize('VIEW_PATIENTS'), async (req, res, next) => {
    try {
        const consultation = await consultationService.getById(Number(req.params.id), req.user!.role as any);
        res.json(consultation);
    } catch (error) {
        next(error);
    }
});

// Create consultation
router.post('/', authorize('EDIT_MEDICAL_RECORDS'), async (req, res, next) => {
    try {
        const result = await consultationService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/start', authorize('EDIT_MEDICAL_RECORDS'), async (req, res, next) => {
    try {
        const { patientId, appointmentId, reason } = req.body;
        const result = await consultationService.startConsultation(Number(patientId), Number(appointmentId), reason);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update consultation
router.put('/:id', authorize('EDIT_MEDICAL_RECORDS'), async (req, res, next) => {
    try {
        const result = await consultationService.update(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete consultation
router.delete('/:id', authorize('EDIT_MEDICAL_RECORDS'), async (req, res, next) => {
    try {
        const result = await consultationService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
