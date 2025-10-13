import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validate } from '../../middleware/validation';
import { 
  userIdSchema, 
  addFavoriteSchema, 
  removeFavoriteSchema, 
  callWaiterSchema 
} from '../../types/validationSchemas';

/**
 * Create user router with static controller methods
 */
export function createUserRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.post('/waiter/call', validate(callWaiterSchema), UserController.callWaiter);
  
  router.get('/:userId/favorites', validate(userIdSchema), UserController.getUserFavorites);
  
  router.post('/:userId/favorites', validate(addFavoriteSchema), UserController.addFavorite);
  
  router.delete('/:userId/favorites/:itemId', validate(removeFavoriteSchema), UserController.removeFavorite);

  return router;
}
