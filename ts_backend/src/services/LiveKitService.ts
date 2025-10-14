import { AccessToken } from 'livekit-server-sdk';
import { AppResponse } from '../types/common';
import { createLogger } from '../utils/logger';

const logger = createLogger('LiveKitService');

/**
 * LiveKit Service - Handles LiveKit access token generation
 * Uses static methods for simplicity
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class LiveKitService {
  /**
   * Generate a LiveKit access token for a participant to join a room
   * 
   * @param roomName - Name of the LiveKit room
   * @param participantName - Name/identity of the participant
   * @returns AppResponse with JWT token
   */
  static async generateToken(roomName: string, participantName: string): Promise<AppResponse<{ token: string }>> {
    try {
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;

      if (!apiKey || !apiSecret) {
        logger.error('LiveKit API credentials not configured');
        return {
          success: false,
          message: 'LiveKit service not configured',
          status: 500
        };
      }

      // Create access token with participant identity
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
      });

      // Grant permissions: join room, publish audio/video, subscribe to others
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true
      });

      const token = await at.toJwt();

      logger.info(`Generated LiveKit token for participant: ${participantName} in room: ${roomName}`);

      return {
        success: true,
        data: { token },
        status: 200
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`Error generating LiveKit token: ${error.message}`, { error: error.stack });
      return {
        success: false,
        message: 'Failed to generate LiveKit token',
        status: 500
      };
    }
  }
}
