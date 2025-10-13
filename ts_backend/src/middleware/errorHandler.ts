
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('ErrorHandler');

// A simple placeholder error handler
// In a real app, you might have custom error classes
export const errorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });

  // Avoid leaking stack trace in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      error: 'Internal Server Error' 
    });
  }

  return res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
};
