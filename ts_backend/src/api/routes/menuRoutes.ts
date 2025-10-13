import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';
import { MenuService } from '../../services/MenuService';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import logger from '../../utils/logger';
import { validate } from '../../middleware/validation';
import { 
  searchMenuSchema, 
  menuItemIdSchema, 
  categoryNameSchema, 
  foodTypeSchema 
} from '../../types/validationSchemas';

/**
 * Create menu router with dependency injection
 */
export function createMenuRouter(): Router {
  const router = Router();
  
  // Initialize dependencies
  const menuRepository = RepositoryFactory.getMenuRepository();
  const menuService = new MenuService(menuRepository, logger);
  const menuController = new MenuController(menuService);

  // Route definitions with validation
  // Note: Order matters - more specific routes before generic ones
  router.get('/specials', menuController.getSpecials);
  router.get('/search', validate(searchMenuSchema), menuController.searchMenu);
  router.get('/category/:categoryName', validate(categoryNameSchema), menuController.getMenuByCategory);
  router.get('/type/:foodType', validate(foodTypeSchema), menuController.getMenuByType);
  router.get('/:itemId', validate(menuItemIdSchema), menuController.getItemDetails);
  router.get('/', menuController.getMenu);

  return router;
}
