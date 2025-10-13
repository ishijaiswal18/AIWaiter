import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { validate } from '../../middleware/validation';
import { 
  createOrderSchema, 
  updateOrderSchema, 
  orderIdSchema 
} from '../../types/validationSchemas';

/**
 * Create order router with static controller methods
 */
export function createOrderRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.get('/:orderId/status', validate(orderIdSchema), OrderController.getOrderStatus);
  
  router.get('/', OrderController.getOrders);
  
  router.post('/', validate(createOrderSchema), OrderController.createOrder);
  
  router.put('/:orderId', validate(updateOrderSchema), OrderController.updateOrder);
  
  router.delete('/:orderId', validate(orderIdSchema), OrderController.cancelOrder);

  return router;
}
