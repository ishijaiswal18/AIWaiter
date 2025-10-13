import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger('ValidationMiddleware');

/**
 * Validation middleware factory using Zod schemas
 * Validates request params, query, and body against provided schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request data (params, query, body)
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.issues.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validation failed', { errors });
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      } else {
        // Unexpected error
        logger.error('Unexpected validation error', { error });
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };
}
