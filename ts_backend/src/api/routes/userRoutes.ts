import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../../services/UserService';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import logger from '../../utils/logger';
import { validate } from '../../middleware/validation';
import { 
  userIdSchema, 
  addFavoriteSchema, 
  removeFavoriteSchema, 
  callWaiterSchema 
} from '../../types/validationSchemas';

/**
 * Get fresh service instance with current repositories
 * This ensures tests get fresh repositories after reset()
 */
function getUserService(): UserService {
  const userRepository = RepositoryFactory.getUserRepository();
  const menuRepository = RepositoryFactory.getMenuRepository();
  return new UserService(userRepository, menuRepository, logger);
}

/**
 * Create user router with dependency injection
 */
export function createUserRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.post('/waiter/call', validate(callWaiterSchema), (req, res) => {
    const controller = new UserController(getUserService());
    controller.callWaiter(req, res);
  });
  
  router.get('/:userId/favorites', validate(userIdSchema), (req, res) => {
    const controller = new UserController(getUserService());
    controller.getUserFavorites(req, res);
  });
  
  router.post('/:userId/favorites', validate(addFavoriteSchema), (req, res) => {
    const controller = new UserController(getUserService());
    controller.addFavorite(req, res);
  });
  
  router.delete('/:userId/favorites/:itemId', validate(removeFavoriteSchema), (req, res) => {
    const controller = new UserController(getUserService());
    controller.removeFavorite(req, res);
  });

  return router;
}
