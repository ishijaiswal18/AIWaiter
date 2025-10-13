import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../../services/OrderService';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import logger from '../../utils/logger';
import { validate } from '../../middleware/validation';
import { 
  createOrderSchema, 
  updateOrderSchema, 
  orderIdSchema 
} from '../../types/validationSchemas';

/**
 * Create order router with dependency injection
 */
export function createOrderRouter(): Router {
  const router = Router();
  
  // Initialize dependencies
  const orderRepository = RepositoryFactory.getOrderRepository();
  const orderService = new OrderService(orderRepository, logger);
  const orderController = new OrderController(orderService);

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.get('/:orderId/status', validate(orderIdSchema), orderController.getOrderStatus);
  router.get('/', orderController.getOrders);
  router.post('/', validate(createOrderSchema), orderController.createOrder);
  router.put('/:orderId', validate(updateOrderSchema), orderController.updateOrder);
  router.delete('/:orderId', validate(orderIdSchema), orderController.cancelOrder);

  return router;
}
