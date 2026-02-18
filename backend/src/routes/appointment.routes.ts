import { Router } from 'express';
import { appointmentService } from '../services/appointment.service';

const router = Router();

// Get all appointments
router.get('/', async (req, res, next) => {
    try {
        const result = await appointmentService.getAll();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get appointments by patient ID
router.get('/patient/:patientId', async (req, res, next) => {
    try {
        const result = await appointmentService.getByPatientId(Number(req.params.patientId));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Create appointment
router.post('/', async (req, res, next) => {
    try {
        const result = await appointmentService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Update appointment
router.put('/:id', async (req, res, next) => {
    try {
        const result = await appointmentService.update(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete appointment
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await appointmentService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
