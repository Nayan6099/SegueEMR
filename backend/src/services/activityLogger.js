const prisma = require('../config/prisma');

async function logActivity(actionOrData, userId, details) {
  let finalAction;
  let finalUserId;
  let finalDetails = {};

  if (typeof actionOrData === 'object' && actionOrData !== null) {
    finalAction = actionOrData.action;
    finalUserId = actionOrData.userId;
    finalDetails = actionOrData.details || {};
  } else {
    finalAction = actionOrData;
    finalUserId = userId;
    finalDetails = details || {};
  }

  try {
    const log = await prisma.activityLog.create({
      data: {
        userId: String(finalUserId || 'system'),
        role: 'user',
        action: String(finalAction),
        details: JSON.stringify(finalDetails)
      }
    });
    return log.id;
  } catch (error) {
    console.error('Error inserting activity log to DB:', error.message);
    return null;
  }
}

module.exports = {
  logActivity,
};
