import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import DIContainer from '../../utils/DIContainer';
import { validate } from '../../middleware/validation';
import { 
  userIdSchema, 
  addFavoriteSchema, 
  removeFavoriteSchema, 
  callWaiterSchema 
} from '../../types/validationSchemas';

/**
 * Create user router with dependency injection
 * Services are created per-request for test isolation
 */
export function createUserRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.post('/waiter/call', validate(callWaiterSchema), (req, res) => {
    const service = DIContainer.createUserService();
    const controller = new UserController(service);
    controller.callWaiter(req, res);
  });
  
  router.get('/:userId/favorites', validate(userIdSchema), (req, res) => {
    const service = DIContainer.createUserService();
    const controller = new UserController(service);
    controller.getUserFavorites(req, res);
  });
  
  router.post('/:userId/favorites', validate(addFavoriteSchema), (req, res) => {
    const service = DIContainer.createUserService();
    const controller = new UserController(service);
    controller.addFavorite(req, res);
  });
  
  router.delete('/:userId/favorites/:itemId', validate(removeFavoriteSchema), (req, res) => {
    const service = DIContainer.createUserService();
    const controller = new UserController(service);
    controller.removeFavorite(req, res);
  });

  return router;
}
