import { Request, Response } from 'express';
import { OrderService } from '../../services/OrderService';

const LOG_SOURCE = '[OrderController]';

/**
 * Order Controller - Handles HTTP requests for order operations
 * Delegates business logic to OrderService using static methods
 */
export class OrderController {
  /**
   * GET /api/orders
   * Get all orders
   */
  static getOrders(req: Request, res: Response): void {
    req.log.info(`${LOG_SOURCE} GET /api/orders`);
    const result = OrderService.getOrders();
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  static createOrder(req: Request, res: Response): void {
    const { userId, items } = req.body;
    req.log.info(`${LOG_SOURCE} POST /api/orders for user ${userId}`);
    const result = OrderService.createOrder(userId, items);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  }

  /**
   * PUT /api/orders/:orderId
   * Update an existing order
   */
  static updateOrder(req: Request, res: Response): void {
    const { orderId } = req.params;
    const { items } = req.body;
    req.log.info(`${LOG_SOURCE} PUT /api/orders/${orderId}`);
    const result = OrderService.updateOrder(orderId, items);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }

  /**
   * DELETE /api/orders/:orderId
   * Cancel an order
   */
  static cancelOrder(req: Request, res: Response): void {
    const { orderId } = req.params;
    req.log.info(`${LOG_SOURCE} DELETE /api/orders/${orderId}`);
    const result = OrderService.cancelOrder(orderId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  }

  /**
   * GET /api/orders/:orderId/status
   * Get order status
   */
  static getOrderStatus(req: Request, res: Response): void {
    const { orderId } = req.params;
    req.log.info(`${LOG_SOURCE} GET /api/orders/${orderId}/status`);
    const result = OrderService.getOrderStatus(orderId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  }
}
