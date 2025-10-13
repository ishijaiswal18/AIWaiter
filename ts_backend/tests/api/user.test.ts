import request from 'supertest';
import app from '../../src/app';
import DIContainer from '../../src/utils/DIContainer';

describe('User API Endpoints', () => {
  // Reset user data before each test
  beforeEach(() => {
    DIContainer.reset();
  });

  describe('GET /api/users/:userId/favorites', () => {
    it('should return empty array for user with no favorites', async () => {
      const response = await request(app).get('/api/users/user1/favorites');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return favorite menu items for user', async () => {
      // Add a favorite first
      await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'm1' });

      const response = await request(app).get('/api/users/user1/favorites');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/users/:userId/favorites', () => {
    it('should add item to user favorites', async () => {
      const response = await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'm2' }); // Use m2 instead of m1 to avoid conflicts
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('m2');
    });

    it('should return 404 for non-existent menu item', async () => {
      const response = await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'nonexistent' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in menu');
    });

    it('should return 409 when item already favorited', async () => {
      // Add favorite first time
      await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'm1' });

      // Try to add same item again
      const response = await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'm1' });
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already favorited');
    });

    it('should return 400 when itemId is missing', async () => {
      const response = await request(app)
        .post('/api/users/user1/favorites')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:userId/favorites/:itemId', () => {
    it('should remove item from user favorites', async () => {
      // Add favorite first
      await request(app)
        .post('/api/users/user1/favorites')
        .send({ itemId: 'm3' });

      const response = await request(app)
        .delete('/api/users/user1/favorites/m3');
      
      expect(response.status).toBe(204);
      // Note: 204 No Content responses have empty body
    });

    it('should return 404 when item not in favorites', async () => {
      const response = await request(app)
        .delete('/api/users/user1/favorites/m1');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/waiter/call', () => {
    it('should successfully call waiter', async () => {
      const response = await request(app)
        .post('/api/users/waiter/call')
        .send({ userId: 'user1', message: 'Need assistance' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('waiter has been notified');
    });

    it('should accept call without message', async () => {
      const response = await request(app)
        .post('/api/users/waiter/call')
        .send({ userId: 'user1' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/users/waiter/call')
        .send({ message: 'Help' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
