import { IOrderRepository } from '../repositories/interfaces/IOrderRepository';
import { Order, OrderItem, OrderStatus } from '../types/entities';
import { AppResponse } from '../types/common';
import { Logger } from 'winston';

/**
 * Order Service - Business logic layer for order operations
 * Implements dependency injection for testability and maintainability
 */
export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private logger: Logger
  ) {}

  /**
   * Create a new order
   */
  createOrder(userId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return { 
          success: false, 
          message: 'Invalid order data', 
          status: 400 
        };
      }
      const newOrder = this.orderRepository.create(userId, items);
      return { success: true, data: newOrder, status: 201 };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error creating order for user ${userId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Update an existing order
   */
  updateOrder(orderId: string, items: OrderItem[]): AppResponse<Order> {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return { 
          success: false, 
          message: 'Invalid items data for update', 
          status: 400 
        };
      }
      const updatedOrder = this.orderRepository.update(orderId, items);
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
      this.logger.error(`Error updating order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): AppResponse {
    try {
      const cancelled = this.orderRepository.cancel(orderId);
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
      this.logger.error(`Error cancelling order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get order status
   */
  getOrderStatus(orderId: string): AppResponse<OrderStatus> {
    try {
      const status = this.orderRepository.getStatus(orderId);
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
      this.logger.error(`Error getting status for order ${orderId}: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get all orders
   */
  getOrders(): AppResponse<Order[]> {
    try {
      const orders = this.orderRepository.getAll();
      return { success: true, data: orders };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error getting all orders: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }
}
