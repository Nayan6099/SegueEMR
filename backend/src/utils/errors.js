/**
 * Centralized application error handling.
 *
 * AppError  — structured error thrown from business logic
 * errorHandler — Express global error middleware
 * ERROR_CODES — well-known machine-readable codes for frontend mapping
 *
 * NEVER expose raw database/stack trace messages to clients.
 * All internal details are logged server-side only.
 */

const logger = require('./logger');

// ─── Known Error Codes ───────────────────────────────────────────────────────
const ERROR_CODES = {
  // Auth
  AUTH_FAILED:           'AUTH_FAILED',
  AUTH_FORBIDDEN:        'AUTH_FORBIDDEN',
  SESSION_EXPIRED:       'SESSION_EXPIRED',
  // Resource
  NOT_FOUND:             'NOT_FOUND',
  CONFLICT:              'CONFLICT',
  // Input
  VALIDATION_ERROR:      'VALIDATION_ERROR',
  MISSING_FIELDS:        'MISSING_FIELDS',
  // Server / DB
  DB_ERROR:              'DB_ERROR',
  INTERNAL_ERROR:        'INTERNAL_ERROR',
  // Domain
  DOCTOR_NOT_FOUND:      'DOCTOR_NOT_FOUND',
  PATIENT_NOT_FOUND:     'PATIENT_NOT_FOUND',
  RECORD_NOT_FOUND:      'RECORD_NOT_FOUND',
  ALREADY_DISPENSED:     'ALREADY_DISPENSED',
  APPOINTMENT_CONFLICT:  'APPOINTMENT_CONFLICT',
};

// ─── User-facing messages (never expose internals) ────────────────────────────
const USER_MESSAGES = {
  [ERROR_CODES.AUTH_FAILED]:          'Invalid credentials. Please try again.',
  [ERROR_CODES.AUTH_FORBIDDEN]:       'You are not authorized to perform this action.',
  [ERROR_CODES.SESSION_EXPIRED]:      'Your session has expired. Please sign in again.',
  [ERROR_CODES.NOT_FOUND]:            'The requested resource could not be found.',
  [ERROR_CODES.CONFLICT]:             'This record already exists.',
  [ERROR_CODES.VALIDATION_ERROR]:     'Please check your input and try again.',
  [ERROR_CODES.MISSING_FIELDS]:       'Please complete all required fields.',
  [ERROR_CODES.DB_ERROR]:             'Unable to process your request at this time.',
  [ERROR_CODES.INTERNAL_ERROR]:       'Something went wrong. Please try again shortly.',
  [ERROR_CODES.DOCTOR_NOT_FOUND]:     'The specified doctor could not be found.',
  [ERROR_CODES.PATIENT_NOT_FOUND]:    'The specified patient could not be found.',
  [ERROR_CODES.RECORD_NOT_FOUND]:     'The requested record could not be found.',
  [ERROR_CODES.ALREADY_DISPENSED]:    'This prescription has already been dispensed.',
  [ERROR_CODES.APPOINTMENT_CONFLICT]: 'A scheduling conflict exists for this time slot.',
};

// ─── AppError class ───────────────────────────────────────────────────────────
class AppError extends Error {
  /**
   * @param {string} code    - One of ERROR_CODES
   * @param {string} [detail] - Internal detail (NEVER sent to client)
   * @param {number} [statusCode]
   */
  constructor(code, detail = '', statusCode = null) {
    super(detail || USER_MESSAGES[code] || 'An error occurred');
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode || AppError._defaultStatus(code);
    this.userMessage = USER_MESSAGES[code] || USER_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
    this.isOperational = true; // Known/expected error — don't crash the process
  }

  static _defaultStatus(code) {
    switch (code) {
      case ERROR_CODES.AUTH_FAILED:
      case ERROR_CODES.SESSION_EXPIRED:
        return 401;
      case ERROR_CODES.AUTH_FORBIDDEN:
        return 403;
      case ERROR_CODES.NOT_FOUND:
      case ERROR_CODES.DOCTOR_NOT_FOUND:
      case ERROR_CODES.PATIENT_NOT_FOUND:
      case ERROR_CODES.RECORD_NOT_FOUND:
        return 404;
      case ERROR_CODES.CONFLICT:
      case ERROR_CODES.ALREADY_DISPENSED:
      case ERROR_CODES.APPOINTMENT_CONFLICT:
        return 409;
      case ERROR_CODES.VALIDATION_ERROR:
      case ERROR_CODES.MISSING_FIELDS:
        return 400;
      default:
        return 500;
    }
  }
}

// ─── Global Express Error Handler ────────────────────────────────────────────
/**
 * Must be registered as the LAST middleware in server.js:
 *   app.use(errorHandler);
 */
function errorHandler(err, req, res, _next) {
  // Operational errors — known, expected
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`[${err.code}] ${err.message}`, {
      path: req.path,
      method: req.method,
      userId: req.user?.userId,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.userMessage,
      code: err.code,
    });
  }

  // Prisma errors — map to safe messages
  if (err.code && err.code.startsWith('P')) {
    logger.error(`[PRISMA:${err.code}] ${err.message}`, {
      path: req.path,
      meta: err.meta,
    });
    return res.status(500).json({
      success: false,
      message: USER_MESSAGES[ERROR_CODES.DB_ERROR],
      code: ERROR_CODES.DB_ERROR,
    });
  }

  // Unknown / unexpected — log full details server-side only
  logger.error(`[UNHANDLED] ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  return res.status(500).json({
    success: false,
    message: USER_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
    code: ERROR_CODES.INTERNAL_ERROR,
  });
}

module.exports = { AppError, errorHandler, ERROR_CODES };
