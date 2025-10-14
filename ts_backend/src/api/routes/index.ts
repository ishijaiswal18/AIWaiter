import { Router } from 'express';
import { createMenuRouter } from './menuRoutes';
import { createOrderRouter } from './orderRoutes';
import { createUserRouter } from './userRoutes';
import livekitRouter from './livekitRoutes';

/**
 * Create and configure all API routes
 */
export function createApiRouter(): Router {
  const router = Router();

  // Mount route modules
  router.use('/menu', createMenuRouter());
  router.use('/orders', createOrderRouter());
  router.use('/users', createUserRouter());
  router.use('/', livekitRouter); // Mount at root to match /get-token

  return router;
}
