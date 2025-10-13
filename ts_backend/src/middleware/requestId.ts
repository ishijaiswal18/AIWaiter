
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import mainLogger from '../utils/logger';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  req.id = requestId;

  // Create a request-scoped child logger
  req.log = mainLogger.child({ requestId });

  // Set header for client-side correlation
  res.setHeader('X-Request-Id', requestId);

  req.log.info(`Request received: ${req.method} ${req.originalUrl}`);

  next();
};
