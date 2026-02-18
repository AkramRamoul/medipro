import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';

const app: Application = express();

// Standard middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', routes);

// Root route or redirect
app.get('/', (req: Request, res: Response) => {
    res.send('Clinic Management API');
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorMiddleware);

export default app;
