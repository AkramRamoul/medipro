import { Router } from 'express';
import { userService } from '../services/user.service';

const router = Router();

router.get('/init', async (req, res, next) => {
    try {
        const data = await userService.getAppInitData();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/check-password-exists', async (req, res, next) => {
    try {
        const exists = await userService.checkPasswordExists();
        res.json({ exists });
    } catch (error) {
        next(error);
    }
});

router.post('/check-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const isValid = await userService.checkPassword(password);
        res.json({ isValid });
    } catch (error) {
        next(error);
    }
});

router.post('/create-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const result = await userService.createPassword(password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/change-password', async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await userService.changePassword(oldPassword, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/remove-password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const result = await userService.removePassword(password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/machine-id', async (req, res, next) => {
    try {
        const id = await userService.getMachineId();
        res.json({ id });
    } catch (error) {
        next(error);
    }
});

router.get('/license', async (req, res, next) => {
    try {
        const license = await userService.getLicense();
        res.json(license);
    } catch (error) {
        next(error);
    }
});

router.post('/license-submit', async (req, res, next) => {
    try {
        const { key, payload } = req.body;
        const isValid = await userService.validateLicense(key, payload);
        res.json({ isValid });
    } catch (error) {
        next(error);
    }
});

export default router;
