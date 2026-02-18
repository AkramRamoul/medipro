import { Router } from 'express';
import { settingsService } from '../services/settings.service';

const router = Router();

router.get('/prescription-model', async (req, res, next) => {
    try {
        const model = await settingsService.getPrescriptionModel();
        res.json({ success: true, model });
    } catch (error) {
        next(error);
    }
});

router.post('/prescription-model', async (req, res, next) => {
    try {
        const result = await settingsService.savePrescriptionModel(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/logo', async (req, res, next) => {
    try {
        const image = await settingsService.getLogo();
        res.json({ success: true, image });
    } catch (error) {
        next(error);
    }
});

router.post('/logo', async (req, res, next) => {
    try {
        const result = await settingsService.uploadLogo(req.body.image);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
