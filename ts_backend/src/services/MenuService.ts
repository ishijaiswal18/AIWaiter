import { IMenuRepository } from '../repositories/interfaces/IMenuRepository';
import { MenuItem } from '../types/entities';
import { AppResponse } from '../types/common';
import { Logger } from 'winston';

/**
 * Menu Service - Business logic layer for menu operations
 * Implements dependency injection for testability and maintainability
 */
export class MenuService {
  constructor(
    private menuRepository: IMenuRepository,
    private logger: Logger
  ) {}

  /**
   * Get all menu items
   */
  getMenu(): AppResponse<MenuItem[]> {
    try {
      const items = this.menuRepository.getAll();
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error getting all menu items: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get menu items by category
   */
  getMenuByCategory(categoryName: string): AppResponse<MenuItem[]> {
    try {
      const items = this.menuRepository.getByCategory(categoryName);
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
      this.logger.error(`Error getting menu by category ${categoryName}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get menu items by type (veg/non-veg)
   */
  getMenuByType(foodType: 'veg' | 'non-veg'): AppResponse<MenuItem[]> {
    try {
      const items = this.menuRepository.getByType(foodType);
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
      this.logger.error(`Error getting menu by type ${foodType}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Search menu items by query
   */
  searchMenu(query: string): AppResponse<MenuItem[]> {
    try {
      if (!query) {
        return { 
          success: false, 
          message: 'Search query is required', 
          status: 400 
        };
      }
      const items = this.menuRepository.search(query);
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error searching menu for ${query}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get special menu items
   */
  getSpecials(): AppResponse<MenuItem[]> {
    try {
      const items = this.menuRepository.getSpecials();
      return { success: true, data: items };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error getting specials: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get item details by ID
   */
  getItemDetails(itemId: string): AppResponse<MenuItem> {
    try {
      const item = this.menuRepository.getById(itemId);
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
      this.logger.error(`Error getting item details for ${itemId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
