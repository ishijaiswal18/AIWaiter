/**
 * Type augmentation for Express Request interface
 * 
 * Extends the Express Request object with custom properties:
 * - id: Unique identifier for request tracing
 * - log: Request-scoped Winston logger instance
 */

import { Logger } from 'winston';

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Unique identifier for this request (UUID v4)
     * Set by requestIdMiddleware
     */
    id: string;

    /**
     * Request-scoped Winston logger with requestId context
     * Set by requestIdMiddleware
     */
    log: Logger;
  }
}
