import { MenuItem } from '../types/entities';
import { AppResponse } from '../types/common';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { createLogger } from '../utils/logger';

const logger = createLogger('MenuService');

/**
 * Menu Service - Business logic layer for menu operations
 * Uses static methods for simplicity and RepositoryFactory for data access
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class MenuService {
  /**
   * Get all menu items
   */
  static getMenu(): AppResponse<MenuItem[]> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.getAll();
      logger.info('Retrieved all menu items');
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting all menu items: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get menu items by category
   */
  static getMenuByCategory(categoryName: string): AppResponse<MenuItem[]> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.getByCategory(categoryName);
      if (items.length === 0) {
        logger.info(`No items found for category: ${categoryName}`);
        return { 
          success: false, 
          message: 'Category not found or no items in category', 
          status: 404 
        };
      }
      logger.info(`Retrieved ${items.length} items for category: ${categoryName}`);
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting menu by category ${categoryName}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get menu items by type (veg/non-veg)
   */
  static getMenuByType(foodType: 'veg' | 'non-veg'): AppResponse<MenuItem[]> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.getByType(foodType);
      if (items.length === 0) {
        logger.info(`No items found for type: ${foodType}`);
        return { 
          success: false, 
          message: 'Food type not found or no items of this type', 
          status: 404 
        };
      }
      logger.info(`Retrieved ${items.length} items for type: ${foodType}`);
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting menu by type ${foodType}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Search menu items by query
   */
  static searchMenu(query: string): AppResponse<MenuItem[]> {
    try {
      if (!query) {
        return { 
          success: false, 
          message: 'Search query is required', 
          status: 400 
        };
      }
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.search(query);
      logger.info(`Search for "${query}" returned ${items.length} results`);
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error searching menu for ${query}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get special menu items
   */
  static getSpecials(): AppResponse<MenuItem[]> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.getSpecials();
      logger.info(`Retrieved ${items.length} special items`);
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting specials: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get item details by ID
   */
  static getItemDetails(itemId: string): AppResponse<MenuItem> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const item = repo.getById(itemId);
      if (!item) {
        logger.info(`Item not found: ${itemId}`);
        return { 
          success: false, 
          message: 'Item not found', 
          status: 404 
        };
      }
      logger.info(`Retrieved item details for: ${itemId}`);
      return { success: true, data: item };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting item details for ${itemId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
