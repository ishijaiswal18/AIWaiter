import { Request, Response } from 'express';
import { OrderService } from '../../services/OrderService';

/**
 * Order Controller - Handles HTTP requests for order operations
 * Delegates business logic to OrderService
 */
export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * GET /api/orders
   * Get all orders
   */
  getOrders = (req: Request, res: Response): void => {
    req.log.info('GET /api/orders');
    const result = this.orderService.getOrders();
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * POST /api/orders
   * Create a new order
   */
  createOrder = (req: Request, res: Response): void => {
    const { userId, items } = req.body;
    req.log.info(`POST /api/orders for user ${userId}`);
    const result = this.orderService.createOrder(userId, items);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  };

  /**
   * PUT /api/orders/:orderId
   * Update an existing order
   */
  updateOrder = (req: Request, res: Response): void => {
    const { orderId } = req.params;
    const { items } = req.body;
    req.log.info(`PUT /api/orders/${orderId}`);
    const result = this.orderService.updateOrder(orderId, items);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };

  /**
   * DELETE /api/orders/:orderId
   * Cancel an order
   */
  cancelOrder = (req: Request, res: Response): void => {
    const { orderId } = req.params;
    req.log.info(`DELETE /api/orders/${orderId}`);
    const result = this.orderService.cancelOrder(orderId);
    res.status(result.success ? result.status || 200 : result.status || 500).json(result);
  };

  /**
   * GET /api/orders/:orderId/status
   * Get order status
   */
  getOrderStatus = (req: Request, res: Response): void => {
    const { orderId } = req.params;
    req.log.info(`GET /api/orders/${orderId}/status`);
    const result = this.orderService.getOrderStatus(orderId);
    res.status(result.success ? 200 : result.status || 500).json(result);
  };
}
