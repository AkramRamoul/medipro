import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

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

/**
 * Derives a deterministic but non-guessable JWT secret.
 * Priority:
 *   1. JWT_SECRET env var (explicit override for dev/CI)
 *   2. Machine-unique HMAC-SHA256 derived from machineId + app salt
 * This ensures no static secret is ever baked into the compiled bundle.
 */
function deriveJwtSecret(): string {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

    try {
        // node-machine-id is a prod dependency – always available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { machineIdSync } = require('node-machine-id') as typeof import('node-machine-id');
        const mid = machineIdSync(true); // true = hashed, no raw PII
        // HMAC with a fixed app-level salt – changes if the machine or app identity changes
        const appSalt = [0x4d, 0x65, 0x64, 0x69, 0x50, 0x72, 0x6f, 0x4a, 0x57, 0x54];
        return crypto
            .createHmac('sha256', Buffer.from(appSalt))
            .update(mid)
            .digest('hex');
    } catch {
        // Fallback: random bytes regenerated each run (sessions won't survive restart)
        return crypto.randomBytes(32).toString('hex');
    }
}

const getEnv = (): Env => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    const NODE_ENV = process.env.NODE_ENV || (isBundled ? 'production' : 'development');
    const DATABASE_PATH = process.env.DATABASE_PATH || (isBundled ? path.join(path.dirname(process.execPath), 'database.db') : '../database.db');
    const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
    const JWT_SECRET = deriveJwtSecret();
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
