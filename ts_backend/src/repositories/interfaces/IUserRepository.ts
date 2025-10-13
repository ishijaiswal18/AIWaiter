/**
 * Repository interface for user operations
 * Follows the Repository Pattern for data access abstraction
 */
export interface IUserRepository {
  /**
   * Get a user's favorite menu item IDs
   */
  getFavorites(userId: string): string[];

  /**
   * Add a menu item to user's favorites
   * @returns true if added, false if already exists
   */
  addFavorite(userId: string, itemId: string): boolean;

  /**
   * Remove a menu item from user's favorites
   * @returns true if removed, false if not found
   */
  removeFavorite(userId: string, itemId: string): boolean;
}
