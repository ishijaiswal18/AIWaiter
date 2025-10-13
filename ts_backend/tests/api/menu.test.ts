import request from 'supertest';
import app from '../../src/app';

describe('Menu API Endpoints', () => {
  describe('GET /api/menu', () => {
    it('should return all menu items', async () => {
      const response = await request(app).get('/api/menu');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('price');
    });
  });

  describe('GET /api/menu/specials', () => {
    it('should return only special menu items', async () => {
      const response = await request(app).get('/api/menu/specials');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((item: any) => item.isSpecial === true)).toBe(true);
    });
  });

  describe('GET /api/menu/category/:categoryName', () => {
    it('should return menu items by category', async () => {
      const response = await request(app).get('/api/menu/category/Appetizer');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((item: any) => item.category === 'Appetizer')).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app).get('/api/menu/category/NonExistent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/menu/type/:foodType', () => {
    it('should return veg menu items', async () => {
      const response = await request(app).get('/api/menu/type/veg');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((item: any) => item.type === 'veg')).toBe(true);
    });

    it('should return non-veg menu items', async () => {
      const response = await request(app).get('/api/menu/type/non-veg');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((item: any) => item.type === 'non-veg')).toBe(true);
    });

    it('should return 400 for invalid food type', async () => {
      const response = await request(app).get('/api/menu/type/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/menu/search', () => {
    it('should search menu items by query', async () => {
      const response = await request(app).get('/api/menu/search?q=chicken');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 when query is missing', async () => {
      const response = await request(app).get('/api/menu/search');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/menu/:itemId', () => {
    it('should return menu item by ID', async () => {
      const response = await request(app).get('/api/menu/m1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'm1');
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return 404 for non-existent item ID', async () => {
      const response = await request(app).get('/api/menu/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
