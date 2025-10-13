import { Order, OrderItem, OrderStatus } from '../../types/entities';

/**
 * Repository interface for order operations
 * Follows the Repository Pattern for data access abstraction
 */
export interface IOrderRepository {
  /**
   * Create a new order
   */
  create(userId: string, items: OrderItem[]): Order;

  /**
   * Update an existing order's items
   */
  update(orderId: string, newItems: OrderItem[]): Order | null;

  /**
   * Cancel an order by removing it
   * @returns true if order was cancelled, false if not found
   */
  cancel(orderId: string): boolean;

  /**
   * Get the status of an order
   */
  getStatus(orderId: string): OrderStatus | null;

  /**
   * Get all orders
   */
  getAll(): Order[];
}
