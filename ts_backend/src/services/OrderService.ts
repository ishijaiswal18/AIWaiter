import { Order, OrderItem, OrderStatus } from '../types/entities';
import { AppResponse } from '../types/common';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import logger from '../utils/logger';

const LOG_SOURCE = '[OrderService]';

/**
 * Order Service - Business logic layer for order operations
 * Uses static methods for simplicity and RepositoryFactory for data access
 */
export class OrderService {
  /**
   * Create a new order
   */
  static createOrder(userId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return { 
          success: false, 
          message: 'Invalid order data', 
          status: 400 
        };
      }
      const repo = RepositoryFactory.getOrderRepository();
      const newOrder = repo.create(userId, items);
      return { success: true, data: newOrder, status: 201 };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error creating order for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Update an existing order
   */
  static updateOrder(orderId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return { 
          success: false, 
          message: 'Invalid items data for update', 
          status: 400 
        };
      }
      const repo = RepositoryFactory.getOrderRepository();
      const updatedOrder = repo.update(orderId, items);
      if (!updatedOrder) {
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      return { success: true, data: updatedOrder };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error updating order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Cancel an order
   */
  static cancelOrder(orderId: string): AppResponse {
    try {
      const repo = RepositoryFactory.getOrderRepository();
      const cancelled = repo.cancel(orderId);
      if (!cancelled) {
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      return { success: true, status: 204 };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error cancelling order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get order status
   */
  static getOrderStatus(orderId: string): AppResponse<OrderStatus> {
    try {
      const repo = RepositoryFactory.getOrderRepository();
      const status = repo.getStatus(orderId);
      if (!status) {
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      return { success: true, data: status };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting status for order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get all orders
   */
  static getOrders(): AppResponse<Order[]> {
    try {
      const repo = RepositoryFactory.getOrderRepository();
      const orders = repo.getAll();
      return { success: true, data: orders };
    } catch (err) {
      const error = err as Error;
      logger.error(`${LOG_SOURCE} Error getting all orders: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
