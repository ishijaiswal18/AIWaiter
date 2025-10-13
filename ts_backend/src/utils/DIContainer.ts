import { Logger } from 'winston';
import { IMenuRepository, IOrderRepository, IUserRepository } from '../repositories/interfaces';
import { MockMenuRepository, MockOrderRepository, MockUserRepository } from '../repositories/implementations';
import { MenuService } from '../services/MenuService';
import { OrderService } from '../services/OrderService';
import { UserService } from '../services/UserService';
import logger from './logger';

/**
 * Centralized Dependency Injection Container
 * Manages lifecycle and creation of all services and repositories
 * 
 * Benefits:
 * - Single source of truth for dependency wiring
 * - Easy to swap implementations (mock vs real DB)
 * - Consistent service instantiation
 * - Request-scoped service creation for tests
 */
class DIContainer {
  private static menuRepository: IMenuRepository;
  private static orderRepository: IOrderRepository;
  private static userRepository: IUserRepository;

  // ============================================
  // Repository Accessors (Singletons)
  // ============================================

  static getMenuRepository(): IMenuRepository {
    if (!this.menuRepository) {
      this.menuRepository = new MockMenuRepository();
    }
    return this.menuRepository;
  }

  static getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.orderRepository = new MockOrderRepository();
    }
    return this.orderRepository;
  }

  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MockUserRepository();
    }
    return this.userRepository;
  }

  // ============================================
  // Service Factories (Request-scoped)
  // ============================================

  /**
   * Create MenuService with all dependencies
   * Request-scoped: Creates new instance on each call
   */
  static createMenuService(): MenuService {
    return new MenuService(
      this.getMenuRepository(),
      logger
    );
  }

  /**
   * Create OrderService with all dependencies
   * Request-scoped: Creates new instance on each call
   */
  static createOrderService(): OrderService {
    return new OrderService(
      this.getOrderRepository(),
      logger
    );
  }

  /**
   * Create UserService with all dependencies
   * Request-scoped: Creates new instance on each call
   */
  static createUserService(): UserService {
    return new UserService(
      this.getUserRepository(),
      this.getMenuRepository(),
      logger
    );
  }

  // ============================================
  // Testing Utilities
  // ============================================

  /**
   * Reset all repository instances
   * Used in test beforeEach() hooks to ensure test isolation
   */
  static reset(): void {
    // @ts-ignore - Force reset by setting to undefined
    this.menuRepository = undefined;
    // @ts-ignore
    this.orderRepository = undefined;
    // @ts-ignore
    this.userRepository = undefined;
  }

  /**
   * Override repositories for testing
   * Allows injection of mock implementations
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

export default DIContainer;
