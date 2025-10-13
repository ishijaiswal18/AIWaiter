import { Request, Response } from 'express';
import { MenuService } from '../../services/MenuService';

/**
 * Menu Controller - Handles HTTP requests for menu operations
 * Delegates business logic to MenuService
 */
export class MenuController {
  constructor(private menuService: MenuService) {}

  /**
   * GET /api/menu
   * Get all menu items
   */
  getMenu = (req: Request, res: Response): void => {
    req.log.info('GET /api/menu');
    const result = this.menuService.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/menu/category/:categoryName
   * Get menu items by category
   */
  getMenuByCategory = (req: Request, res: Response): void => {
    const { categoryName } = req.params;
    req.log.info(`GET /api/menu/category/${categoryName}`);
    const result = this.menuService.getMenuByCategory(categoryName);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/menu/type/:foodType
   * Get menu items by food type (veg/non-veg)
   */
  getMenuByType = (req: Request, res: Response): void => {
    const { foodType } = req.params;
    req.log.info(`GET /api/menu/type/${foodType}`);
    
    // Validate foodType
    if (foodType !== 'veg' && foodType !== 'non-veg') {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid food type. Must be "veg" or "non-veg"' 
      });
      return;
    }
    
    const result = this.menuService.getMenuByType(foodType);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/menu/search?q=query
   * Search menu items
   */
  searchMenu = (req: Request, res: Response): void => {
    const { q } = req.query;
    req.log.info(`GET /api/menu/search?q=${q}`);
    const result = this.menuService.searchMenu(q as string);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/menu/specials
   * Get special menu items
   */
  getSpecials = (req: Request, res: Response): void => {
    req.log.info('GET /api/menu/specials');
    const result = this.menuService.getSpecials();
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/menu/:itemId
   * Get item details by ID
   */
  getItemDetails = (req: Request, res: Response): void => {
    const { itemId } = req.params;
    req.log.info(`GET /api/menu/${itemId}`);
    const result = this.menuService.getItemDetails(itemId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };
}
