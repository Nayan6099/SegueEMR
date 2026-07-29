/**
 * Activity Logger — records all significant user actions for compliance/audit trails.
 *
 * Fixes from original:
 * - Role was always hardcoded to 'user' — now accepts role from context
 * - Uses structured logger instead of console.error
 * - Never throws — logging failure must not interrupt the primary request
 */

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Log a user action to the ActivityLog table.
 *
 * @param {string} action   - Action identifier e.g. 'APPOINTMENT_CREATED'
 * @param {string} userId   - The actor's userId
 * @param {object} details  - Arbitrary details object (serialized to JSON)
 * @param {string} [role]   - Actor's role (doctor, nurse, patient, etc.)
 * @returns {Promise<string|null>} - ActivityLog id, or null on failure
 */
async function logActivity(action, userId, details = {}, role = 'unknown') {
  try {
    const log = await prisma.activityLog.create({
      data: {
        userId:  String(userId || 'system'),
        role:    String(role || 'unknown'),
        action:  String(action),
        details: JSON.stringify(details),
      },
    });
    return log.id;
  } catch (error) {
    // Never crash the caller — logging is non-critical
    logger.error('[ActivityLogger] Failed to write activity log', {
      action,
      userId,
      error: error.message,
    });
    return null;
  }
}

module.exports = { logActivity };
