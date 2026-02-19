import { Router } from 'express';
import { patientService } from '../services/patient.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// Search patients (All roles)
router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q as string;
        const results = await patientService.search(query);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get all patients (All roles)
router.get('/', async (req, res, next) => {
    try {
        const patients = await patientService.getAll();
        res.json(patients);
    } catch (error) {
        next(error);
    }
});

// Get patient timeline (All roles)
router.get('/:id/timeline', async (req, res, next) => {
    try {
        const timeline = await patientService.getTimeline(Number(req.params.id));
        res.json(timeline);
    } catch (error) {
        next(error);
    }
});

// Get patient by id (All roles)
router.get('/:id', async (req, res, next) => {
    try {
        const patient = await patientService.getById(Number(req.params.id));
        res.json(patient);
    } catch (error) {
        next(error);
    }
});

// Create patient (Receptionist and Doctor)
router.post('/', authorize(['receptionist', 'doctor', 'admin']), async (req, res, next) => {
    try {
        const patientId = await patientService.create(req.body);
        res.status(201).json({ id: patientId });
    } catch (error) {
        next(error);
    }
});

// Update patient (Receptionist and Doctor)
router.put('/:id', authorize(['receptionist', 'doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await patientService.update(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete patient (Doctor and Admin)
router.delete('/:id', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await patientService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Lab results (All roles)
router.get('/:id/lab-results', async (req, res, next) => {
    try {
        const results = await patientService.getLabResults(Number(req.params.id));
        res.json(results);
    } catch (error) {
        next(error);
    }
});

router.post('/lab-panel', authorize(['receptionist', 'doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await patientService.addLabPanel(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/lab-panel/:panelId', authorize(['doctor', 'admin']), async (req, res, next) => {
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
