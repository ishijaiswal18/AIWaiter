/**
 * Type augmentation for Express Request interface
 * 
 * Note: We use AsyncLocalStorage for request context propagation.
 * Request IDs and other context are stored in AsyncLocalStorage,
 * not attached to the request object.
 * 
 * Use createLogger('SourceName') anywhere in the request lifecycle
 * to automatically get the request context (requestId, source).
 */

import 'express';

// No request extensions needed - AsyncLocalStorage handles all context!
declare module 'express-serve-static-core' {
  // Empty interface extension to maintain module augmentation
  interface Request {}
}
