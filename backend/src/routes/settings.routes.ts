import { Router } from 'express';
import { settingsService } from '../services/settings.service';
import { authorize } from '../middleware/role.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Only doctors and admins can manage settings
router.use(authorize(['doctor', 'admin']));

// Configure multer for database restoration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'backups');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `restore_${Date.now()}.db`);
    }
});

const upload = multer({ storage });

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

// Database Backup
router.get('/backup', async (req, res, next) => {
    try {
        const filepath = await settingsService.backup();
        res.download(filepath, 'backup.db', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up the temporary backup file after download
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        });
    } catch (error) {
        next(error);
    }
});

// Database Restore
router.post('/restore', upload.single('database'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const result = await settingsService.restore(req.file.path);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
