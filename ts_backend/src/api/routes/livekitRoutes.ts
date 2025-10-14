import { Router } from 'express';
import { LiveKitController } from '../controllers/LiveKitController';
import { validate } from '../../middleware/validation';
import { tokenRequestSchema } from '../../types/validationSchemas';

const router = Router();

/**
 * LiveKit Routes - Token generation endpoint
 * POST /get-token - Generate LiveKit access token for room access
 */
router.post('/get-token', validate(tokenRequestSchema), LiveKitController.getToken);

export default router;
