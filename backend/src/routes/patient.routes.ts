import { Router } from 'express';
import { patientService } from '../services/patient.service';

const router = Router();

// Search patients
router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q as string;
        const results = await patientService.search(query);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get all patients
router.get('/', async (req, res, next) => {
    try {
        const patients = await patientService.getAll();
        res.json(patients);
    } catch (error) {
        next(error);
    }
});

// Get patient timeline
router.get('/:id/timeline', async (req, res, next) => {
    try {
        const timeline = await patientService.getTimeline(Number(req.params.id));
        res.json(timeline);
    } catch (error) {
        next(error);
    }
});

// Get patient by id
router.get('/:id', async (req, res, next) => {
    try {
        const patient = await patientService.getById(Number(req.params.id));
        res.json(patient);
    } catch (error) {
        next(error);
    }
});

// Create patient
router.post('/', async (req, res, next) => {
    try {
        const patientId = await patientService.create(req.body);
        res.status(201).json({ id: patientId });
    } catch (error) {
        next(error);
    }
});

// Update patient
router.put('/:id', async (req, res, next) => {
    try {
        const result = await patientService.update(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await patientService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Lab results
router.get('/:id/lab-results', async (req, res, next) => {
    try {
        const results = await patientService.getLabResults(Number(req.params.id));
        res.json(results);
    } catch (error) {
        next(error);
    }
});

router.post('/lab-panel', async (req, res, next) => {
    try {
        const result = await patientService.addLabPanel(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/lab-panel/:panelId', async (req, res, next) => {
    try {
        const result = await patientService.deleteLabPanel(req.params.panelId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/:id/lab-export', async (req, res, next) => {
    try {
        const result = await patientService.exportLabResultsExcel(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
