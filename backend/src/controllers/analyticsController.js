const prisma = require('../config/prisma');
const dataverseService = require('../services/dataverseService');

class AnalyticsController {
    async getOverview(req, res) {
        try {
            const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
            const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Fetch Dataverse staff
            let staffList = [];
            try {
                staffList = await dataverseService.listStaff('hospital');
            } catch (err) {
                console.warn('Dataverse offline during analytics overview.');
            }

            const staffByRoleMap = {};
            staffList.forEach(s => {
                staffByRoleMap[s.role] = (staffByRoleMap[s.role] || 0) + 1;
            });
            const staffByRole = Object.entries(staffByRoleMap).map(([_id, count]) => ({ _id, count }));

            const [
                appointmentsToday,
                appointments,
                pendingPrescriptions,
                dispensedPrescriptions,
                labOrdersGroup,
                revenueCollectedSum,
                unpaidInvoices,
                recentActivityCount
            ] = await Promise.all([
                prisma.appointment.count({
                    where: { scheduledTime: { gte: startOfDay, lte: endOfDay } }
                }),
                prisma.appointment.findMany({}),
                prisma.prescription.count({ where: { status: 'pending' } }),
                prisma.prescription.count({ where: { status: 'dispensed' } }),
                prisma.labOrder.groupBy({
                    by: ['status'],
                    _count: { _all: true }
                }),
                prisma.invoice.aggregate({
                    where: { status: 'paid' },
                    _sum: { totalAmount: true }
                }),
                prisma.invoice.count({ where: { status: 'unpaid' } }),
                prisma.activityLog.count({
                    where: { createdAt: { gte: last24Hours } }
                })
            ]);

            const appointmentsByStatusMap = {};
            const doctorPerformanceMap = {};

            appointments.forEach(apt => {
                appointmentsByStatusMap[apt.status] = (appointmentsByStatusMap[apt.status] || 0) + 1;
                
                if (!doctorPerformanceMap[apt.doctorId]) {
                    doctorPerformanceMap[apt.doctorId] = {
                        _id: apt.doctorId,
                        doctorName: apt.doctorName || apt.doctorId,
                        patientVolume: 0
                    };
                }
                doctorPerformanceMap[apt.doctorId].patientVolume += 1;
            });

            const appointmentsByStatus = Object.entries(appointmentsByStatusMap).map(([_id, count]) => ({ _id, count }));
            const doctorPerformance = Object.values(doctorPerformanceMap);

            return res.json({
                success: true,
                data: {
                    totalRecords: await prisma.eHRMetadata.count(),
                    totalAppointments: appointments.length,
                    totalLabOrders: await prisma.labOrder.count(),
                    totalRevenue: revenueCollectedSum._sum.totalAmount || 0,
                    appointmentsToday,
                    appointmentsByStatus,
                    prescriptions: { pending: pendingPrescriptions, dispensed: dispensedPrescriptions },
                    labOrdersByStatus: labOrdersGroup.map(g => ({ _id: g.status, count: g._count._all })),
                    revenueCollected: revenueCollectedSum._sum.totalAmount || 0,
                    unpaidInvoices,
                    staffByRole,
                    recentActivityCount,
                    doctorPerformance
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new AnalyticsController();
