import { Request, Response } from 'express';
import { UserService } from '../../services/UserService';

/**
 * User Controller - Handles HTTP requests for user operations
 * Delegates business logic to UserService
 */
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /api/users/:userId/favorites
   * Get user's favorite menu items
   */
  getUserFavorites = (req: Request, res: Response): void => {
    const { userId } = req.params;
    req.log.info(`GET /api/users/${userId}/favorites`);
    const result = this.userService.getUserFavorites(userId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * POST /api/users/:userId/favorites
   * Add item to user's favorites
   */
  addFavorite = (req: Request, res: Response): void => {
    const { userId } = req.params;
    const { itemId } = req.body;
    req.log.info(`POST /api/users/${userId}/favorites for item ${itemId}`);
    const result = this.userService.addFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  };

  /**
   * DELETE /api/users/:userId/favorites/:itemId
   * Remove item from user's favorites
   */
  removeFavorite = (req: Request, res: Response): void => {
    const { userId, itemId } = req.params;
    req.log.info(`DELETE /api/users/${userId}/favorites/${itemId}`);
    const result = this.userService.removeFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  };

  /**
   * POST /api/users/waiter/call
   * Call human waiter (simple notification endpoint)
   */
  callWaiter = (req: Request, res: Response): void => {
    const { userId, message } = req.body;
    req.log.info(`POST /api/users/waiter/call by user ${userId}. Message: ${message || 'No message provided.'}`);
    res.status(200).json({ success: true, message: 'Human waiter has been notified.' });
  };
}
