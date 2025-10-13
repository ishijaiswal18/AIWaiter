import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';
import DIContainer from '../../utils/DIContainer';
import { validate } from '../../middleware/validation';
import { 
  searchMenuSchema, 
  menuItemIdSchema, 
  categoryNameSchema, 
  foodTypeSchema 
} from '../../types/validationSchemas';

/**
 * Create menu router with dependency injection
 * Services are created per-request for test isolation
 */
export function createMenuRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: Order matters - more specific routes before generic ones
  router.get('/specials', (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.getSpecials(req, res);
  });
  
  router.get('/search', validate(searchMenuSchema), (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.searchMenu(req, res);
  });
  
  router.get('/category/:categoryName', validate(categoryNameSchema), (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.getMenuByCategory(req, res);
  });
  
  router.get('/type/:foodType', validate(foodTypeSchema), (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.getMenuByType(req, res);
  });
  
  router.get('/:itemId', validate(menuItemIdSchema), (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.getItemDetails(req, res);
  });
  
  router.get('/', (req, res) => {
    const service = DIContainer.createMenuService();
    const controller = new MenuController(service);
    controller.getMenu(req, res);
  });

  return router;
}
