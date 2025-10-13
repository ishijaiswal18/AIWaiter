import { MenuItem } from '../types/entities';
import { AppResponse } from '../types/common';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import logger from '../utils/logger';

const LOG_SOURCE = '[MenuService]';

/**
 * Menu Service - Business logic layer for menu operations
 * Uses static methods for simplicity and RepositoryFactory for data access
 */
export class MenuService {
  /**
   * Get all menu items
   */
  static getMenu(): AppResponse<MenuItem[]> {
    try {
      const repo = RepositoryFactory.getMenuRepository();
      const items = repo.getAll();
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting all menu items: ${error.message}`);
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
        return { 
          success: false, 
          message: 'Category not found or no items in category', 
          status: 404 
        };
      }
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting menu by category ${categoryName}: ${error.message}`);
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
        return { 
          success: false, 
          message: 'Food type not found or no items of this type', 
          status: 404 
        };
      }
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting menu by type ${foodType}: ${error.message}`);
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
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error searching menu for ${query}: ${error.message}`);
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
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting specials: ${error.message}`);
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
        return { 
          success: false, 
          message: 'Item not found', 
          status: 404 
        };
      }
      return { success: true, data: item };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting item details for ${itemId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
