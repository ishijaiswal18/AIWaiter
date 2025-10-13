import { Router } from 'express';
import { createMenuRouter } from './menuRoutes';
import { createOrderRouter } from './orderRoutes';
import { createUserRouter } from './userRoutes';

/**
 * Create and configure all API routes
 */
export function createApiRouter(): Router {
  const router = Router();

  // Mount route modules
  router.use('/menu', createMenuRouter());
  router.use('/orders', createOrderRouter());
  router.use('/users', createUserRouter());

  return router;
}
