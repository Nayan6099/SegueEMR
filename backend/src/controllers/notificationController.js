const prisma = require('../config/prisma');

class NotificationController {
  async listNotifications(req, res) {
    try {
      const recipientId = req.user.userId;
      
      const notifications = await prisma.notification.findMany({
        where: { recipientId },
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

  async markRead(req, res) {
    try {
      const { id } = req.params;
      const recipientId = req.user.userId;

      const notification = await prisma.notification.findFirst({
        where: { id, recipientId }
      });

      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true }
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
      const recipientId = req.user.userId;

      await prisma.notification.updateMany({
        where: { recipientId, read: false },
        data: { read: true }
      });

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
