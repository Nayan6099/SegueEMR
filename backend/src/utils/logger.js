/**
 * Structured application logger using Winston.
 * - Development: colorized, readable console output
 * - Production: JSON format for log aggregation (Datadog, Azure Monitor, etc.)
 *
 * Usage: const logger = require('./logger');
 *        logger.info('User logged in', { userId, role });
 *        logger.error('DB query failed', { error: err.message, code: err.code });
 */

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
  ],
  // Never crash the process due to a logging error
  exitOnError: false,
});

module.exports = logger;
