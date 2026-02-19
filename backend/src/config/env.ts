import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Env {
    PORT: number;
    NODE_ENV: string;
    DATABASE_PATH: string;
    CORS_ORIGIN: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
}

const getEnv = (): Env => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const DATABASE_PATH = process.env.DATABASE_PATH || '../database.db';
    const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it';
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

    return {
        PORT,
        NODE_ENV,
        DATABASE_PATH,
        CORS_ORIGIN,
        JWT_SECRET,
        JWT_EXPIRES_IN,
    };
};

export const env = getEnv();
