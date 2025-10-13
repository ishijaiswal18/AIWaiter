
import express, { Request, Response } from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { createApiRouter } from './api/routes';
import { createLogger } from './utils/logger';

const app = express();
const logger = createLogger('HealthCheck');

// Core Middleware
app.use(cors());
app.use(express.json());

// 1. Request Tracing Middleware (must be early)
app.use(requestIdMiddleware);

// 2. API Routes
app.use('/api', createApiRouter());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check successful');
  res.status(200).json({ status: 'ok' });
});

// Error Handling Middleware (must be last)
app.use(errorHandlerMiddleware);

export default app;
