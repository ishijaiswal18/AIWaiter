import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import DIContainer from '../../utils/DIContainer';
import { validate } from '../../middleware/validation';
import { 
  createOrderSchema, 
  updateOrderSchema, 
  orderIdSchema 
} from '../../types/validationSchemas';

/**
 * Create order router with dependency injection
 * Services are created per-request for test isolation
 */
export function createOrderRouter(): Router {
  const router = Router();

  // Route definitions with validation
  // Note: More specific routes before generic ones
  router.get('/:orderId/status', validate(orderIdSchema), (req, res) => {
    const service = DIContainer.createOrderService();
    const controller = new OrderController(service);
    controller.getOrderStatus(req, res);
  });
  
  router.get('/', (req, res) => {
    const service = DIContainer.createOrderService();
    const controller = new OrderController(service);
    controller.getOrders(req, res);
  });
  
  router.post('/', validate(createOrderSchema), (req, res) => {
    const service = DIContainer.createOrderService();
    const controller = new OrderController(service);
    controller.createOrder(req, res);
  });
  
  router.put('/:orderId', validate(updateOrderSchema), (req, res) => {
    const service = DIContainer.createOrderService();
    const controller = new OrderController(service);
    controller.updateOrder(req, res);
  });
  
  router.delete('/:orderId', validate(orderIdSchema), (req, res) => {
    const service = DIContainer.createOrderService();
    const controller = new OrderController(service);
    controller.cancelOrder(req, res);
  });

  return router;
}
