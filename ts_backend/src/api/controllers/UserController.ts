import { Request, Response } from 'express';
import { UserService } from '../../services/UserService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('UserController');

/**
 * User Controller - Handles HTTP requests for user operations
 * Delegates business logic to UserService using static methods
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class UserController {
  /**
   * GET /api/users/:userId/favorites
   * Get user's favorite menu items
   */
  static getUserFavorites(req: Request, res: Response): void {
    const { userId } = req.params;
    logger.info(`GET /api/users/${userId}/favorites`);
    const result = UserService.getUserFavorites(userId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * POST /api/users/:userId/favorites
   * Add item to user's favorites
   */
  static addFavorite(req: Request, res: Response): void {
    const { userId } = req.params;
    const { itemId } = req.body;
    logger.info(`POST /api/users/${userId}/favorites for item ${itemId}`);
    const result = UserService.addFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  }

  /**
   * DELETE /api/users/:userId/favorites/:itemId
   * Remove item from user's favorites
   */
  static removeFavorite(req: Request, res: Response): void {
    const { userId, itemId } = req.params;
    logger.info(`DELETE /api/users/${userId}/favorites/${itemId}`);
    const result = UserService.removeFavorite(userId, itemId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  }

  /**
   * POST /api/users/waiter/call
   * Call human waiter (simple notification endpoint)
   */
  static callWaiter(req: Request, res: Response): void {
    const { userId, message } = req.body;
    logger.info(`POST /api/users/waiter/call by user ${userId}. Message: ${message || 'No message provided.'}`);
    res.status(200).json({ success: true, message: 'Human waiter has been notified.' });
  }
}
