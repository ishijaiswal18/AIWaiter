import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';
import { validate } from '../../middleware/validation';
import { 
  searchMenuSchema, 
  menuItemIdSchema, 
  categoryNameSchema, 
  foodTypeSchema 
} from '../../types/validationSchemas';

/**
 * Create menu router with static controller methods
 */
export function createMenuRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: Order matters - more specific routes before generic ones
  router.get('/specials', MenuController.getSpecials);
  
  router.get('/search', validate(searchMenuSchema), MenuController.searchMenu);
  
  router.get('/category/:categoryName', validate(categoryNameSchema), MenuController.getMenuByCategory);
  
  router.get('/type/:foodType', validate(foodTypeSchema), MenuController.getMenuByType);
  
  router.get('/:itemId', validate(menuItemIdSchema), MenuController.getItemDetails);
  
  router.get('/', MenuController.getMenu);

  return router;
}
