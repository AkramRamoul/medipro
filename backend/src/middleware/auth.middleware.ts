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

        if (req.user.requiresPasswordChange) {
            // Allow access to essential auth routes during password reset phase
            const allowedRoutes = ['/force-reset', '/me', '/login', '/bootstrap'];
            const isAllowed = allowedRoutes.some(route => req.originalUrl.includes(route));
            
            if (!isAllowed) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Password change required',
                    requirePasswordChange: true 
                });
            }
        }

        next();
    } catch (error: any) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
