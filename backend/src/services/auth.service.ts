import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

export class AuthService {
    generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });
    }

    verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

export const authService = new AuthService();
