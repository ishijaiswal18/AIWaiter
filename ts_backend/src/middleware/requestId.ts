
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContext, createLogger } from '../utils/logger';

const logger = createLogger('RequestIdMiddleware');

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();

  // Set header for client-side correlation
  res.setHeader('X-Request-Id', requestId);

  // Store request context in AsyncLocalStorage for the entire request lifecycle
  requestContext.run({ requestId }, () => {
    logger.info(`Request received: ${req.method} ${req.originalUrl}`);
    next();
  });
};
