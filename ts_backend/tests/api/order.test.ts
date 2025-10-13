import request from 'supertest';
import app from '../../src/app';
import DIContainer from '../../src/utils/DIContainer';

describe('Order API Endpoints', () => {
  // Reset orders before each test
  beforeEach(() => {
    DIContainer.reset();
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 'user1',
        items: [
          { itemId: 'm1', quantity: 2 },
          { itemId: 'm2', quantity: 1 }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('userId', 'user1');
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data.items).toHaveLength(2);
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ items: [{ itemId: 'm1', quantity: 1 }] });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when items array is empty', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ userId: 'user1', items: [] });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      // Create an order first
      await request(app)
        .post('/api/orders')
        .send({ userId: 'user1', items: [{ itemId: 'm1', quantity: 1 }] });

      const response = await request(app).get('/api/orders');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/:orderId/status', () => {
    it('should return order status', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders')
        .send({ userId: 'user1', items: [{ itemId: 'm1', quantity: 1 }] });
      
      const orderId = createResponse.body.data.orderId;

      const response = await request(app).get(`/api/orders/${orderId}/status`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId', orderId);
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).get('/api/orders/o999/status');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:orderId', () => {
    it('should update an existing order', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders')
        .send({ userId: 'user1', items: [{ itemId: 'm1', quantity: 1 }] });
      
      const orderId = createResponse.body.data.orderId;

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ items: [{ itemId: 'm2', quantity: 3 }] });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'updated');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0]).toHaveProperty('itemId', 'm2');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .put('/api/orders/o999')
        .send({ items: [{ itemId: 'm1', quantity: 1 }] });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/orders/:orderId', () => {
    it('should cancel an order', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders')
        .send({ userId: 'user1', items: [{ itemId: 'm1', quantity: 1 }] });
      
      const orderId = createResponse.body.data.orderId;

      const response = await request(app).delete(`/api/orders/${orderId}`);
      
      expect(response.status).toBe(204);
      // Note: 204 No Content responses have empty body
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).delete('/api/orders/o999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
