import { Request, Response } from 'express';
import { LiveKitService } from '../../services';
import { createLogger } from '../../utils/logger';

const logger = createLogger('LiveKitController');

/**
 * LiveKit Controller - Handles HTTP requests for LiveKit token generation
 * Uses static methods for consistency with other controllers
 * Logger automatically includes requestId from AsyncLocalStorage context
 */
export class LiveKitController {
  /**
   * Handle POST /get-token request
   * Generate a LiveKit access token for a participant to join a room
   * 
   * @param req - Express request with body { roomName: string, participantName: string }
   * @param res - Express response
   */
  static async getToken(req: Request, res: Response): Promise<void> {
    const { roomName, participantName } = req.body;

    logger.info(`POST /get-token - Room: ${roomName}, Participant: ${participantName}`);

    const result = await LiveKitService.generateToken(roomName, participantName);

    res.status(result.success ? 200 : result.status || 500).json(
      result.success 
        ? result.data 
        : { success: false, message: result.message }
    );
  }
}
