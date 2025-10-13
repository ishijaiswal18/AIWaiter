import { IMenuRepository } from './interfaces/IMenuRepository';
import { IOrderRepository } from './interfaces/IOrderRepository';
import { IUserRepository } from './interfaces/IUserRepository';
import { MockMenuRepository } from './implementations/MockMenuRepository';
import { MockOrderRepository } from './implementations/MockOrderRepository';
import { MockUserRepository } from './implementations/MockUserRepository';

/**
 * Repository Factory - Centralized repository creation and management
 * Provides singleton repository instances based on configuration
 * 
 * Usage:
 * - Production: Returns appropriate repository based on config.DB_TYPE
 * - Tests: Returns mock repositories, reset via reset() method
 */
export class RepositoryFactory {
  private static menuRepository: IMenuRepository;
  private static orderRepository: IOrderRepository;
  private static userRepository: IUserRepository;

  /**
   * Get menu repository instance
   * Returns mock repository for tests/dev, can be extended for database
   */
  static getMenuRepository(): IMenuRepository {
    if (!this.menuRepository) {
      // Future: Check config.DB_TYPE to return PostgresMenuRepository
      // if (config.DB_TYPE === 'postgres') {
      //   this.menuRepository = new PostgresMenuRepository();
      // } else {
      //   this.menuRepository = new MockMenuRepository();
      // }
      this.menuRepository = new MockMenuRepository();
    }
    return this.menuRepository;
  }

  /**
   * Get order repository instance
   * Returns mock repository for tests/dev, can be extended for database
   */
  static getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.orderRepository = new MockOrderRepository();
    }
    return this.orderRepository;
  }

  /**
   * Get user repository instance
   * Returns mock repository for tests/dev, can be extended for database
   */
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MockUserRepository();
    }
    return this.userRepository;
  }

  /**
   * Reset all repositories to fresh instances
   * Used in test beforeEach() hooks to ensure test isolation
   */
  static reset(): void {
    // @ts-ignore - Intentionally set to undefined to force recreation
    this.menuRepository = undefined;
    // @ts-ignore
    this.orderRepository = undefined;
    // @ts-ignore
    this.userRepository = undefined;
  }

  /**
   * Override specific repositories (for advanced testing scenarios)
   */
  static setRepositories(repos: {
    menu?: IMenuRepository;
    order?: IOrderRepository;
    user?: IUserRepository;
  }): void {
    if (repos.menu) this.menuRepository = repos.menu;
    if (repos.order) this.orderRepository = repos.order;
    if (repos.user) this.userRepository = repos.user;
  }
}
