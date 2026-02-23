import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const isBundled = (process as any).pkg !== undefined || process.env.CAXA !== undefined || process.env.IS_PACKAGED_ELECTRON === 'true';
const projectRoot = isBundled
    ? __dirname // Extraction directory
    : path.join(__dirname, '../../');

dotenv.config({ path: path.join(projectRoot, '.env') });

interface Env {
    PORT: number;
    NODE_ENV: string;
    DATABASE_PATH: string;
    CORS_ORIGIN: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    USER_DATA_PATH?: string;
}

const getEnv = (): Env => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    const NODE_ENV = process.env.NODE_ENV || 'production';
    const DATABASE_PATH = process.env.DATABASE_PATH || (isBundled ? path.join(path.dirname(process.execPath), 'database.db') : '../database.db');
    const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it';
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
    const USER_DATA_PATH = process.env.USER_DATA_PATH;

    return {
        PORT,
        NODE_ENV,
        DATABASE_PATH,
        CORS_ORIGIN,
        JWT_SECRET,
        JWT_EXPIRES_IN,
        USER_DATA_PATH,
    };
};

export const env = getEnv();
