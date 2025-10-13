import { Order, OrderItem, OrderStatus } from '../types/entities';
import { AppResponse } from '../types/common';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { createLogger } from '../utils/logger';

const logger = createLogger('OrderService');

/**
 * Order Service - Business logic layer for order operations
 * Uses static methods for simplicity and RepositoryFactory for data access
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class OrderService {
  /**
   * Create a new order
   */
  static createOrder(userId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        logger.info(`Invalid order data for user: ${userId}`);
        return { 
          success: false, 
          message: 'Invalid order data', 
          status: 400 
        };
      }
      const repo = RepositoryFactory.getOrderRepository();
      const newOrder = repo.create(userId, items);
      logger.info(`Created order ${newOrder.orderId} for user ${userId} with ${items.length} items`);
      return { success: true, data: newOrder, status: 201 };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error creating order for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Update an existing order
   */
  static updateOrder(orderId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        logger.info(`Invalid items data for update: ${orderId}`);
        return { 
          success: false, 
          message: 'Invalid items data for update', 
          status: 400 
        };
      }
      const repo = RepositoryFactory.getOrderRepository();
      const updatedOrder = repo.update(orderId, items);
      if (!updatedOrder) {
        logger.info(`Order not found: ${orderId}`);
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      logger.info(`Updated order ${orderId} with ${items.length} items`);
      return { success: true, data: updatedOrder };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error updating order ${orderId}: ${error.message}`);
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
        logger.info(`Order not found for cancellation: ${orderId}`);
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      logger.info(`Cancelled order: ${orderId}`);
      return { success: true, status: 204 };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error cancelling order ${orderId}: ${error.message}`);
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
        logger.info(`Order not found: ${orderId}`);
        return { 
          success: false, 
          message: 'Order not found', 
          status: 404 
        };
      }
      logger.info(`Retrieved status for order ${orderId}: ${status}`);
      return { success: true, data: status };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting status for order ${orderId}: ${error.message}`);
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
      logger.info(`Retrieved ${orders.length} orders`);
      return { success: true, data: orders };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error getting all orders: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
