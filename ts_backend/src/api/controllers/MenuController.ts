import { Request, Response } from 'express';
import { MenuService } from '../../services/MenuService';

const LOG_SOURCE = '[MenuController]';

/**
 * Menu Controller - Handles HTTP requests for menu operations
 * Delegates business logic to MenuService using static methods
 */
export class MenuController {
  /**
   * GET /api/menu
   * Get all menu items
   */
  static getMenu(req: Request, res: Response): void {
    req.log.info(`${LOG_SOURCE} GET /api/menu`);
    const result = MenuService.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/menu/category/:categoryName
   * Get menu items by category
   */
  static getMenuByCategory(req: Request, res: Response): void {
    const { categoryName } = req.params;
    req.log.info(`${LOG_SOURCE} GET /api/menu/category/${categoryName}`);
    const result = MenuService.getMenuByCategory(categoryName);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/menu/type/:foodType
   * Get menu items by food type (veg/non-veg)
   */
  static getMenuByType(req: Request, res: Response): void {
    const { foodType } = req.params;
    req.log.info(`${LOG_SOURCE} GET /api/menu/type/${foodType}`);
    
    // Validate foodType
    if (foodType !== 'veg' && foodType !== 'non-veg') {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid food type. Must be "veg" or "non-veg"' 
      });
      return;
    }
    
    const result = MenuService.getMenuByType(foodType);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/menu/search?q=query
   * Search menu items
   */
  static searchMenu(req: Request, res: Response): void {
    const { q } = req.query;
    req.log.info(`${LOG_SOURCE} GET /api/menu/search?q=${q}`);
    const result = MenuService.searchMenu(q as string);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/menu/specials
   * Get special menu items
   */
  static getSpecials(req: Request, res: Response): void {
    req.log.info(`${LOG_SOURCE} GET /api/menu/specials`);
    const result = MenuService.getSpecials();
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/menu/:itemId
   * Get item details by ID
   */
  static getItemDetails(req: Request, res: Response): void {
    const { itemId } = req.params;
    req.log.info(`${LOG_SOURCE} GET /api/menu/${itemId}`);
    const result = MenuService.getItemDetails(itemId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }
}
