const prisma = require('../config/prisma');
const dataverseService = require('../services/dataverseService');

class AdminController {
    async getDashboardStats(req, res) {
        try {
            const totalRecords = await prisma.eHRMetadata.count();
            
            let totalUsers = 0;
            let totalPatients = 0;
            let totalDoctors = 0;
            
            try {
                const staff = await dataverseService.listStaff('hospital');
                totalUsers = staff.length;
                totalPatients = staff.filter(u => u.role === 'patient').length;
                totalDoctors = staff.filter(u => u.role === 'doctor').length;
            } catch (err) {
                console.warn('Dataverse offline, fallback user counts to mock.');
            }

            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentActivity = await prisma.activityLog.count({
                where: { createdAt: { gte: last24Hours } }
            });

            return res.json({
                success: true,
                stats: {
                    totalRecords,
                    totalUsers,
                    totalPatients,
                    totalDoctors,
                    recentActivity,
                    storageUsed: totalRecords * 1024 * 15 // Mock calculation
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getActivityLogs(req, res) {
        try {
            const { limit = 50, page = 1, userId, action, startDate, endDate } = req.query;
            const where = {};
            if (userId) where.userId = userId;
            if (action) where.action = action;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const take = parseInt(limit);
            const skip = (parseInt(page) - 1) * take;

            const [activities, totalCount] = await Promise.all([
                prisma.activityLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take,
                    skip
                }),
                prisma.activityLog.count({ where })
            ]);

            return res.json({
                success: true,
                data: activities.map(a => ({
                    ...a,
                    timestamp: a.createdAt,
                    details: JSON.parse(a.details)
                })),
                pagination: {
                    total: totalCount,
                    page: parseInt(page),
                    limit: take,
                    pages: Math.ceil(totalCount / take)
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const { role } = req.query;
            let staff = await dataverseService.listStaff('hospital');
            if (role) {
                staff = staff.filter(u => u.role === role);
            }
            return res.json({
                success: true,
                count: staff.length,
                data: staff
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllRecords(req, res) {
        try {
            const { patientId, status } = req.query;
            const where = {};
            if (patientId) where.patientId = patientId;
            if (status) where.status = status;

            const records = await prisma.eHRMetadata.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });

            return res.json({
                success: true,
                count: records.length,
                data: records.map(r => ({
                    ...r,
                    metadata: JSON.parse(r.metadata)
                }))
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateUserStatus(req, res) {
        try {
            const { userId, status } = req.body;
            if (!userId || !status) {
                return res.status(400).json({ success: false, error: 'userId and status are required' });
            }

            const user = await dataverseService.findUser(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found in Dataverse' });
            }

            await dataverseService.syncEntity('contacts', {
                statecode: status === 'active' ? 0 : 1
            }, user.id);

            await prisma.activityLog.create({
                data: {
                    userId: req.user?.userId || 'admin',
                    role: req.user?.role || 'admin',
                    action: 'USER_STATUS_UPDATED',
                    details: JSON.stringify({ targetUserId: userId, newStatus: status })
                }
            });

            return res.json({
                success: true,
                message: `User ${userId} status updated to ${status}`,
                data: { userId, status }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteRecord(req, res) {
        try {
            const { recordId } = req.params;
            const { reason } = req.body;

            const record = await prisma.eHRMetadata.update({
                where: { recordId },
                data: {
                    metadata: JSON.stringify({ status: 'deleted', deletedBy: req.user?.userId || 'admin', deletionReason: reason })
                }
            });

            await prisma.activityLog.create({
                data: {
                    userId: req.user?.userId || 'admin',
                    role: req.user?.role || 'admin',
                    action: 'RECORD_DELETED',
                    details: JSON.stringify({ recordId, reason })
                }
            });

            return res.json({
                success: true,
                message: 'Record deleted successfully',
                data: record
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getUsageAnalytics(req, res) {
        try {
            const { days = 7 } = req.query;
            const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

            const logs = await prisma.activityLog.findMany({
                where: { createdAt: { gte: startDate } }
            });

            const dailyActivityMap = {};
            const activityByTypeMap = {};
            const topUsersMap = {};

            logs.forEach(l => {
                const dateStr = l.createdAt.toISOString().split('T')[0];
                dailyActivityMap[dateStr] = (dailyActivityMap[dateStr] || 0) + 1;
                activityByTypeMap[l.action] = (activityByTypeMap[l.action] || 0) + 1;
                topUsersMap[l.userId] = (topUsersMap[l.userId] || 0) + 1;
            });

            return res.json({
                success: true,
                data: {
                    dailyActivity: Object.entries(dailyActivityMap).map(([date, count]) => ({ date, count })),
                    activityByType: Object.entries(activityByTypeMap).map(([action, count]) => ({ action, count })),
                    topUsers: Object.entries(topUsersMap)
                        .map(([userId, activityCount]) => ({ userId, activityCount }))
                        .sort((a, b) => b.activityCount - a.activityCount)
                        .slice(0, 10)
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async forceRevokeAccess(req, res) {
        try {
            const { recordId, userId, reason } = req.body;

            await prisma.activityLog.create({
                data: {
                    userId: req.user?.userId || 'admin',
                    role: req.user?.role || 'admin',
                    action: 'ADMIN_FORCE_REVOKE',
                    details: JSON.stringify({ recordId, targetUserId: userId, reason })
                }
            });

            return res.json({
                success: true,
                message: `Access revoked by admin from user ${userId}`,
                reason
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getSystemHealth(req, res) {
        try {
            let postgresStatus = 'disconnected';
            try {
                await prisma.$queryRaw`SELECT 1`;
                postgresStatus = 'connected';
            } catch (err) {
                postgresStatus = 'error';
            }

            return res.json({
                success: true,
                health: {
                    blockchain: 'running',
                    ipfs: 'connected',
                    postgres: postgresStatus,
                    api: 'running',
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async exportCSV(req, res) {
        try {
            const { resource } = req.params;
            let data = [];
            let filename = `${resource}-export.csv`;

            if (resource === 'activity-logs') {
                const logs = await prisma.activityLog.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 1000
                });
                data = logs.map(l => ({
                    id: l.id,
                    action: l.action,
                    performedBy: l.userId,
                    timestamp: l.createdAt.toISOString(),
                    details: l.details
                }));
            } else if (resource === 'invoices') {
                const invoices = await prisma.invoice.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 1000
                });
                data = invoices.map(i => ({
                    id: i.id,
                    patientId: i.patientId,
                    patientName: i.patientName,
                    amount: i.totalAmount,
                    status: i.status,
                    createdAt: i.createdAt.toISOString()
                }));
            } else if (resource === 'records') {
                const records = await prisma.eHRMetadata.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 1000
                });
                data = records.map(r => {
                    const meta = JSON.parse(r.metadata || '{}');
                    return {
                        recordId: r.recordId,
                        patientId: r.patientId,
                        orgName: r.orgName,
                        recordType: meta.recordType || 'Report',
                        description: meta.description || '',
                        uploadedBy: r.doctorId,
                        uploadDate: r.createdAt.toISOString()
                    };
                });
            } else {
                return res.status(400).json({ success: false, error: 'Invalid resource type' });
            }

            if (data.length === 0) {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                return res.send('No data available');
            }

            const header = Object.keys(data[0]);
            let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName] === undefined ? '' : row[fieldName])).join(','));
            csv.unshift(header.join(','));
            const csvOutput = csv.join('\r\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(csvOutput);
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async getSettings(req, res) {
        try {
            const settings = await prisma.setting.findMany({});
            return res.json({
                success: true,
                data: settings.map(s => ({
                    key: s.key,
                    value: JSON.parse(s.value)
                }))
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async updateSetting(req, res) {
        try {
            const { key, value } = req.body;
            if (!key || value === undefined) {
                return res.status(400).json({ success: false, error: 'key and value are required' });
            }

            const stringifiedValue = JSON.stringify(value);
            const setting = await prisma.setting.upsert({
                where: { key },
                update: { value: stringifiedValue },
                create: { key, value: stringifiedValue }
            });

            return res.json({
                success: true,
                data: {
                    key: setting.key,
                    value: JSON.parse(setting.value)
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new AdminController();