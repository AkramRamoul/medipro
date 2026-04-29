import { Router } from 'express';
import { documentService } from '../services/document.service';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/all', async (req, res, next) => {
    try {
        const documents = await documentService.getAll();
        res.json(documents);
    } catch (error) {
        next(error);
    }
});

router.get('/patient/:patientId', async (req, res, next) => {
    try {
        const documents = await documentService.getByPatientId(Number(req.params.patientId));
        res.json(documents);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const doc = await documentService.getById(Number(req.params.id));
        res.json(doc);
    } catch (error) {
        next(error);
    }
});

router.post('/', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const id = await documentService.create(req.body);
        res.status(201).json({ id });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await documentService.delete(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Template routes
router.get('/templates/all', async (req, res, next) => {
    try {
        const templates = await documentService.getTemplates();
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

router.get('/templates/:id', async (req, res, next) => {
    try {
        const template = await documentService.getTemplateById(Number(req.params.id));
        res.json(template);
    } catch (error) {
        next(error);
    }
});

router.post('/templates', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await documentService.createTemplate(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

router.put('/templates/:id', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await documentService.updateTemplate(Number(req.params.id), req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/templates/:id', authorize(['doctor', 'admin']), async (req, res, next) => {
    try {
        const result = await documentService.deleteTemplate(Number(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
