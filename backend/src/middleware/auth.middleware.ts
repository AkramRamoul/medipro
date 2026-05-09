import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.user = { userId: 1, email: 'admin@local', role: 'admin' };

        next();
    } catch (error: any) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
