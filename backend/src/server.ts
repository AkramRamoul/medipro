import app from './app';
import { env } from './config/env';
import { sqlite } from './db';

const startServer = async () => {
    const server = app.listen(env.PORT, () => {
        console.log(`[Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        console.log(`[Server] Database: ${env.DATABASE_PATH}`);
        console.log(`[Server] Health check: http://localhost:${env.PORT}/api/health`);
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
