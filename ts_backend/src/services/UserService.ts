import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IMenuRepository } from '../repositories/interfaces/IMenuRepository';
import { MenuItem } from '../types/entities';
import { AppResponse } from '../types/common';
import { Logger } from 'winston';

/**
 * User Service - Business logic layer for user operations
 * Implements dependency injection for testability and maintainability
 */
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private menuRepository: IMenuRepository,
    private logger: Logger
  ) {}

  /**
   * Get user's favorite menu items
   * Returns full menu item objects, not just IDs
   */
  getUserFavorites(userId: string): AppResponse<MenuItem[]> {
    try {
      const favoriteIds = this.userRepository.getFavorites(userId);
      const favoriteItems = favoriteIds
        .map(id => this.menuRepository.getById(id))
        .filter((item): item is MenuItem => item !== undefined);
      
      return { success: true, data: favoriteItems };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error getting favorites for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Add a menu item to user's favorites
   */
  addFavorite(userId: string, itemId: string): AppResponse<string[]> {
    try {
      if (!itemId) {
        return { 
          success: false, 
          message: 'itemId is required', 
          status: 400 
        };
      }
      
      // Validate item exists in menu
      if (!this.menuRepository.getById(itemId)) {
        return { 
          success: false, 
          message: 'Item not found in menu', 
          status: 404 
        };
      }
      
      const added = this.userRepository.addFavorite(userId, itemId);
      if (!added) {
        return { 
          success: false, 
          message: 'Item already favorited', 
          status: 409 
        }; // Conflict
      }
      
      return { 
        success: true, 
        data: this.userRepository.getFavorites(userId), 
        status: 200 
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error adding favorite ${itemId} for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Remove a menu item from user's favorites
   */
  removeFavorite(userId: string, itemId: string): AppResponse {
    try {
      const removed = this.userRepository.removeFavorite(userId, itemId);
      if (!removed) {
        return { 
          success: false, 
          message: 'Favorite item not found for this user', 
          status: 404 
        };
      }
      return { success: true, status: 204 };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error removing favorite ${itemId} for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
