const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Logs a laboratory action to the LabAudit table.
 * 
 * @param {string} labOrderId 
 * @param {string} action (e.g. 'UPLOAD_PDF', 'SEND_NOTIFICATION', 'DOWNLOAD', 'UNDO_COMPLETE')
 * @param {string} performedBy 
 * @param {Object} details 
 */
async function logLabAction(labOrderId, action, performedBy, details = null) {
  try {
    const auditRecord = await prisma.labAudit.create({
      data: {
        labOrderId,
        action,
        performedBy,
        details: details ? JSON.stringify(details) : null
      }
    });
    return auditRecord;
  } catch (error) {
    if (logger && logger.error) {
      logger.error('[AuditService] Failed to log lab action:', {
        labOrderId,
        action,
        error: error.message
      });
    } else {
      console.error('[AuditService] Failed to log lab action:', error);
    }
    return null;
  }
}

module.exports = {
  logLabAction
};
