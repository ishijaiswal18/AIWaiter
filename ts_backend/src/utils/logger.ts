
import winston from 'winston';

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for development console logging
const devFormat = printf(({ level, message, timestamp, requestId }) => {
  return `${timestamp} [${level}] [reqId:${requestId || 'none'}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
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
      devFormat
    ),
  }));
}

export default logger;
