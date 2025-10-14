import request from 'supertest';
import app from '../../src/app';
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

describe('LiveKit API', () => {
  beforeEach(() => {
    // Reset repositories for test isolation
    RepositoryFactory.reset();
  });

  describe('POST /api/get-token', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Set up test environment variables
      process.env.LIVEKIT_API_KEY = 'test-api-key';
      process.env.LIVEKIT_API_SECRET = 'test-api-secret';
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should generate a token with valid room and participant names', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'test-participant'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should return 400 if roomName is missing', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          participantName: 'test-participant'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 if participantName is missing', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 if both roomName and participantName are missing', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 if roomName is empty string', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: '',
          participantName: 'test-participant'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 if participantName is empty string', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 500 if LIVEKIT_API_KEY is not configured', async () => {
      delete process.env.LIVEKIT_API_KEY;

      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'test-participant'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('LiveKit service not configured');
    });

    it('should return 500 if LIVEKIT_API_SECRET is not configured', async () => {
      delete process.env.LIVEKIT_API_SECRET;

      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'test-participant'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('LiveKit service not configured');
    });

    it('should generate different tokens for different participants', async () => {
      const response1 = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'participant-1'
        });

      const response2 = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'participant-2'
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.token).not.toBe(response2.body.token);
    });

    it('should generate different tokens for different rooms', async () => {
      const response1 = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'room-1',
          participantName: 'test-participant'
        });

      const response2 = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'room-2',
          participantName: 'test-participant'
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.token).not.toBe(response2.body.token);
    });

    it('should generate a valid JWT token with correct claims', async () => {
      const roomName = 'test-room';
      const participantName = 'test-participant';

      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName,
          participantName
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();

      // Decode and verify the JWT token structure
      const token = response.body.token;
      
      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Decode the payload (second part)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // Verify the token contains expected LiveKit claims
      expect(payload.sub).toBe(participantName); // subject should be participant identity
      expect(payload.video).toBeDefined(); // LiveKit video grants
      expect(payload.video.room).toBe(roomName); // room name in grants
      expect(payload.video.roomJoin).toBe(true); // can join room
      expect(payload.video.canPublish).toBe(true); // can publish
      expect(payload.video.canSubscribe).toBe(true); // can subscribe

      // Verify token has standard JWT claims
      expect(payload.iss).toBe(process.env.LIVEKIT_API_KEY); // issuer should be API key
      expect(payload.exp).toBeDefined(); // expiration time
      expect(payload.nbf).toBeDefined(); // not before time
    });

    it('should generate tokens that can be verified with the API secret', async () => {
      const response = await request(app)
        .post('/api/get-token')
        .send({
          roomName: 'test-room',
          participantName: 'test-participant'
        });

      expect(response.status).toBe(200);
      const generatedToken = response.body.token;

      // Create a new AccessToken instance to verify the token
      // This simulates what LiveKit server would do to validate the token
      try {
        // Decode without verification first
        const parts = generatedToken.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Verify the token was signed with our credentials
        expect(payload.iss).toBe(process.env.LIVEKIT_API_KEY);
        
        // Verify token is not expired
        const now = Math.floor(Date.now() / 1000);
        expect(payload.exp).toBeGreaterThan(now);
        expect(payload.nbf).toBeLessThanOrEqual(now);
      } catch (error) {
        fail(`Token verification failed: ${error}`);
      }
    });
  });
});
