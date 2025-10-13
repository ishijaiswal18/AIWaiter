import { MenuItem } from '../../types/entities';

/**
 * Repository interface for menu operations
 * Follows the Repository Pattern for data access abstraction
 */
export interface IMenuRepository {
  /**
   * Get all menu items
   */
  getAll(): MenuItem[];

  /**
   * Get a menu item by its ID
   */
  getById(id: string): MenuItem | undefined;

  /**
   * Get menu items by category
   */
  getByCategory(category: string): MenuItem[];

  /**
   * Get menu items by type (veg/non-veg)
   */
  getByType(type: 'veg' | 'non-veg'): MenuItem[];

  /**
   * Search menu items by name or description
   */
  search(query: string): MenuItem[];

  /**
   * Get special menu items
   */
  getSpecials(): MenuItem[];
}
