import fs from 'fs';
import path from 'path';

// Error logging setup - MUST BE FIRST to catch import errors
const isBundled = (process as any).pkg !== undefined || process.env.CAXA !== undefined;
const logDir = isBundled ? path.dirname(process.execPath) : path.join(__dirname, '../../');
const logFile = process.env.BACKEND_LOG_FILE || path.join(logDir, 'backend-error.log');

const logError = (error: any) => {
    try {
        const message = `[${new Date().toISOString()}] ${error.stack || error}\n`;
        fs.appendFileSync(logFile, message);
        console.error(message);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
};

process.on('uncaughtException', (err) => {
    logError(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logError(reason);
    process.exit(1);
});

// Other imports
import app from './app';
import { env } from './config/env';
import { sqlite } from './db';
// import open from 'open'; // Removed legacy static import

const startServer = async () => {
    const server = app.listen(env.PORT, '0.0.0.0', () => {
        console.log(`[Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        console.log(`[Server] Database: ${env.DATABASE_PATH}`);
        console.log(`[Server] Health check: http://localhost:${env.PORT}/api/health`);

        // Auto-open browser in production mode (only if not inside packaged Electron)
        if (env.NODE_ENV === 'production' && process.env.IS_PACKAGED_ELECTRON !== 'true') {
            // Using a dynamic eval-based import to prevent esbuild from transpiling this to require()
            // since 'open' is an ESM-only package.
            const openUrl = `http://localhost:${env.PORT}`;
            (new Function('url', 'return import("open").then(m => m.default(url))'))(openUrl);
        }
    });

    // Graceful shutdown
    const shutdown = () => {
        console.log('\n[Server] Shutting down gracefully...');
        server.close(() => {
            console.log('[Server] HTTP server closed');
            try {
                sqlite.close();
                console.log('[Server] SQLite connection closed');
                process.exit(0);
            } catch (err) {
                console.error('[Server] Error during shutdown:', err);
                process.exit(1);
            }
        });

        // Force shutdown after 10s
        setTimeout(() => {
            console.error('[Server] Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

startServer().catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
});
