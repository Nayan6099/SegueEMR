/**
 * Request validation and sanitization utilities.
 *
 * validateRequired(fields, body)  — returns a list of missing fields
 * assertRequired(fields, body)    — throws AppError(MISSING_FIELDS) if any missing
 * sanitizeString(str)             — trims + strips common injection chars
 * sanitizeBody(body, fields)      — sanitizes a list of string fields on a body object
 */

const { AppError, ERROR_CODES } = require('./errors');

/**
 * @param {string[]} fields  — required field names
 * @param {object}  body    — request body
 * @returns {string[]}       — list of missing field names
 */
function validateRequired(fields, body) {
  return fields.filter(field => {
    const val = body[field];
    return val === undefined || val === null || String(val).trim() === '';
  });
}

/**
 * @throws {AppError} MISSING_FIELDS if any required field is absent
 */
function assertRequired(fields, body) {
  const missing = validateRequired(fields, body);
  if (missing.length > 0) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELDS,
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}

/**
 * Trim and strip dangerous characters from a string value.
 * NOT a full sanitizer — use parameterized queries (Prisma) for SQL safety.
 * This prevents obvious garbage inputs from reaching the DB.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Sanitize a specific set of string fields on an object (mutates a copy).
 * @param {object}   body
 * @param {string[]} fields
 * @returns {object}
 */
function sanitizeBody(body, fields) {
  const sanitized = { ...body };
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeString(sanitized[field]);
    }
  }
  return sanitized;
}

module.exports = { validateRequired, assertRequired, sanitizeString, sanitizeBody };
