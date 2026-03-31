import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import path from 'path';
import routes from './routes';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';

// BigInt serialization fix
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

const app: Application = express();

// Standard middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', routes);

// Serve static files from the React frontend build
const isBundled = (process as any).pkg !== undefined || process.env.CAXA !== undefined || process.env.IS_PACKAGED_ELECTRON === "true";
const projectRoot = isBundled
    ? __dirname // With caxa, dist-react is bundled relative to the extraction dir
    : path.join(__dirname, '../../');

const distPath = isBundled
    ? (process.env.IS_PACKAGED_ELECTRON === "true" ? path.join(__dirname, 'dist-react') : path.join(projectRoot, '../dist-react'))
    : path.join(projectRoot, 'dist-react');

app.use(express.static(distPath));

// Root route or redirect
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// SPA fallback for any other routes (except /api)
app.get('/*splat', (req: Request, res: Response, next: any) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorMiddleware);

export default app;
