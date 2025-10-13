
import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

const { combine, timestamp, json, colorize, printf } = winston.format;

// AsyncLocalStorage for request context propagation
export const requestContext = new AsyncLocalStorage<{ requestId: string; source?: string }>();

// Custom format for development console logging with context-aware formatting
const devFormat = printf(({ level, message, timestamp, requestId, source }) => {
  const ctx = requestContext.getStore();
  const reqId = requestId || ctx?.requestId || 'none';
  const src = source || ctx?.source || '';
  
  // Build metadata section: [reqId:xxx] [source:SourceName]
  let metadata = `[reqId:${reqId}]`;
  if (src) metadata += ` [source:${src}]`;
  
  return `${timestamp} [${level}] ${metadata}: ${message}`;
});

// Custom format for JSON logging with context
const jsonFormatWithContext = winston.format((info) => {
  const ctx = requestContext.getStore();
  if (ctx) {
    info.requestId = info.requestId || ctx.requestId;
    info.source = info.source || ctx.source;
  }
  return info;
})();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    jsonFormatWithContext,
    json(),
  ),
  transports: [
    // In production, we'll only use file transports
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

// If we're not in production, add a console logger with a simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      jsonFormatWithContext,
      devFormat
    ),
  }));
}

/**
 * Create a logger with a specific source context
 * This allows automatic source tagging without manual string concatenation
 */
export function createLogger(source: string) {
  return logger.child({ source });
}

export default logger;
