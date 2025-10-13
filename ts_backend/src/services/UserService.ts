import { MenuItem } from '../types/entities';
import { AppResponse } from '../types/common';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserService');

/**
 * User Service - Business logic layer for user operations
 * Uses static methods for simplicity and RepositoryFactory for data access
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class UserService {
  /**
   * Get user's favorite menu items
   * Returns full menu item objects, not just IDs
   */
  static getUserFavorites(userId: string): AppResponse<MenuItem[]> {
    try {
      const userRepo = RepositoryFactory.getUserRepository();
      const menuRepo = RepositoryFactory.getMenuRepository();
      
      const favoriteIds = userRepo.getFavorites(userId);
      const favoriteItems = favoriteIds
        .map(id => menuRepo.getById(id))
        .filter((item): item is MenuItem => item !== undefined);
      
      logger.info(`Retrieved ${favoriteItems.length} favorites for user ${userId}`);
      return { success: true, data: favoriteItems };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting favorites for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Add a menu item to user's favorites
   */
  static addFavorite(userId: string, itemId: string): AppResponse<string[]> {
    try {
      if (!itemId) {
        logger.info(`itemId missing for user ${userId}`);
        return { 
          success: false, 
          message: 'itemId is required', 
          status: 400 
        };
      }
      
      const menuRepo = RepositoryFactory.getMenuRepository();
      const userRepo = RepositoryFactory.getUserRepository();
      
      // Validate item exists in menu
      if (!menuRepo.getById(itemId)) {
        logger.info(`Item ${itemId} not found in menu for user ${userId}`);
        return { 
          success: false, 
          message: 'Item not found in menu', 
          status: 404 
        };
      }
      
      const added = userRepo.addFavorite(userId, itemId);
      if (!added) {
        logger.info(`Item ${itemId} already favorited by user ${userId}`);
        return { 
          success: false, 
          message: 'Item already favorited', 
          status: 409 
        }; // Conflict
      }
      
      logger.info(`Added favorite ${itemId} for user ${userId}`);
      return { 
        success: true, 
        data: userRepo.getFavorites(userId), 
        status: 200 
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error adding favorite ${itemId} for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Remove a menu item from user's favorites
   */
  static removeFavorite(userId: string, itemId: string): AppResponse {
    try {
      const userRepo = RepositoryFactory.getUserRepository();
      const removed = userRepo.removeFavorite(userId, itemId);
      if (!removed) {
        logger.info(`Favorite ${itemId} not found for user ${userId}`);
        return { 
          success: false, 
          message: 'Favorite item not found for this user', 
          status: 404 
        };
      }
      logger.info(`Removed favorite ${itemId} for user ${userId}`);
      return { success: true, status: 204 };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error removing favorite ${itemId} for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
