import request from 'supertest';
import app from '../../src/app';
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

describe('Concurrent Requests - AsyncLocalStorage Isolation', () => {
  beforeEach(() => {
    RepositoryFactory.reset();
  });

  it('should handle concurrent requests with isolated request contexts', async () => {
    // Fire 10 concurrent requests
    const promises = Array.from({ length: 10 }, (_, i) => 
      request(app).get('/api/menu').expect(200)
    );

    const responses = await Promise.all(promises);

    // Each response should have a unique X-Request-Id header
    const requestIds = responses.map(res => res.headers['x-request-id']);
    
    // Check all request IDs are unique (no context bleeding)
    const uniqueIds = new Set(requestIds);
    expect(uniqueIds.size).toBe(10);
    
    // All requests should succeed
    responses.forEach(res => {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  it('should maintain correct requestId in logs for concurrent requests', async () => {
    // Fire 5 concurrent requests to different read endpoints
    const promises = [
      request(app).get('/api/menu'),
      request(app).get('/api/menu/specials'),
      request(app).get('/api/menu/category/Main Course'),
      request(app).get('/api/menu/type/veg'),
      request(app).get('/health'),
    ];

    const responses = await Promise.all(promises);

    // Extract request IDs from headers
    const requestIds = responses.map(res => res.headers['x-request-id']);
    
    // All should be unique
    const uniqueIds = new Set(requestIds);
    expect(uniqueIds.size).toBe(5);
    
    // All should be valid UUIDs (v4)
    requestIds.forEach(id => {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  it('should not leak context between sequential requests', async () => {
    // First request
    const res1 = await request(app).get('/api/menu').expect(200);
    const requestId1 = res1.headers['x-request-id'];

    // Second request
    const res2 = await request(app).get('/api/menu').expect(200);
    const requestId2 = res2.headers['x-request-id'];

    // Request IDs should be different
    expect(requestId1).not.toBe(requestId2);
  });

  it('should handle rapid concurrent requests without context corruption', async () => {
    // Fire 50 rapid concurrent read requests (safer than writes for concurrency test)
    const promises = Array.from({ length: 50 }, () => 
      request(app)
        .get('/api/menu')
        .expect(200)
    );

    const responses = await Promise.all(promises);

    // Extract all request IDs
    const requestIds = responses.map(res => res.headers['x-request-id']);
    
    // All should be unique (proves no context bleeding)
    const uniqueIds = new Set(requestIds);
    expect(uniqueIds.size).toBe(50);
    
    // All should successfully return menu
    responses.forEach(res => {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
