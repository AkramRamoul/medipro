import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const payload = authService.verifyToken(token);

        req.user = payload;
        next();
    } catch (error: any) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
