import { IMenuRepository, IOrderRepository, IUserRepository } from './interfaces';
import { MockMenuRepository, MockOrderRepository, MockUserRepository } from './implementations';

/**
 * Repository Factory for Dependency Injection
 * Provides singleton instances of repositories based on environment
 * 
 * In production, this would be extended to return database-backed implementations
 * For now, returns mock implementations for development
 */
class RepositoryFactory {
  private static menuRepository: IMenuRepository;
  private static orderRepository: IOrderRepository;
  private static userRepository: IUserRepository;

  /**
   * Get menu repository instance (singleton)
   */
  static getMenuRepository(): IMenuRepository {
    if (!this.menuRepository) {
      this.menuRepository = new MockMenuRepository();
    }
    return this.menuRepository;
  }

  /**
   * Get order repository instance (singleton)
   */
  static getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.orderRepository = new MockOrderRepository();
    }
    return this.orderRepository;
  }

  /**
   * Get user repository instance (singleton)
   */
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MockUserRepository();
    }
    return this.userRepository;
  }

  /**
   * Reset all repository instances (useful for testing)
   * Forces singleton getters to return fresh instances
   */
  static reset(): void {
    // @ts-ignore - Force reset by setting to undefined first
    this.menuRepository = undefined;
    // @ts-ignore
    this.orderRepository = undefined;
    // @ts-ignore
    this.userRepository = undefined;
  }
}

export default RepositoryFactory;
