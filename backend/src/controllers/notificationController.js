const prisma = require('../config/prisma');

class NotificationController {
  async listNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const patientId = req.user.patientId; // from JWT claim (Patient table ID)

      // For patients, match by userId OR patientId (handles patient records without linked userId)
      const where = patientId && patientId !== userId
        ? { OR: [{ userId }, { userId: patientId }] }
        : { userId };
      
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return res.json({
        success: true,
        data: notifications
      });
    } catch (err) {
      console.error('[Notifications] List error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;
      const patientId = req.user.patientId;
      const userIdFilter = patientId && patientId !== userId
        ? { OR: [{ userId }, { userId: patientId }] }
        : { userId };
      const count = await prisma.notification.count({
        where: { ...userIdFilter, isRead: false }
      });
      return res.json({ success: true, count });
    } catch (err) {
      console.error('[Notifications] Get unread count error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async markRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const patientId = req.user.patientId;
      const userIdFilter = patientId && patientId !== userId
        ? { OR: [{ userId }, { userId: patientId }] }
        : { userId };

      const notification = await prisma.notification.findFirst({
        where: { id, ...userIdFilter }
      });

      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: 'Notification marked as read',
        data: updated
      });
    } catch (err) {
      console.error('[Notifications] Mark read error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async markAllRead(req, res) {
    try {
      const userId = req.user.userId;
      const patientId = req.user.patientId;

      // Update for userId
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      // Also update for patientId if different
      if (patientId && patientId !== userId) {
        await prisma.notification.updateMany({
          where: { userId: patientId, isRead: false },
          data: { isRead: true }
        });
      }

      return res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (err) {
      console.error('[Notifications] Mark all read error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new NotificationController();
