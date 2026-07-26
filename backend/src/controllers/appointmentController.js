const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

const genId = () => `APT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapAppointment = (apt) => {
    if (!apt) return null;
    return {
        id: apt.id,
        appointmentId: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        doctorId: apt.doctorId,
        doctorName: apt.doctorName,
        scheduledAt: apt.scheduledTime,
        scheduledTime: apt.scheduledTime,
        status: apt.status,
        reason: apt.notes,
        notes: apt.notes,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
    };
};

class AppointmentController {
    async createAppointment(req, res) {
        try {
            const { patientId, patientName, doctorId, doctorName, scheduledAt, notes, status, createdBy } = req.body;

            if (!patientId || !patientName || !doctorId || !scheduledAt || !createdBy) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId, patientName, doctorId, scheduledAt, and createdBy are required'
                });
            }

            const appointment = await prisma.appointment.create({
                data: {
                    id: genId(),
                    patientId,
                    patientName,
                    doctorId,
                    doctorName: doctorName || '',
                    scheduledTime: new Date(scheduledAt),
                    status: status || 'scheduled',
                    notes: notes || ''
                }
            });

            await logActivity('APPOINTMENT_CREATED', createdBy, { appointmentId: appointment.id, patientId, doctorId });

            return res.status(201).json({ success: true, data: mapAppointment(appointment) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async updateAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { scheduledAt, status, notes, updatedBy } = req.body;

            const update = {};
            if (scheduledAt) update.scheduledTime = new Date(scheduledAt);
            if (status) update.status = status;
            if (notes !== undefined) update.notes = notes;

            const appointment = await prisma.appointment.update({
                where: { id: appointmentId },
                data: update
            });

            await logActivity('APPOINTMENT_UPDATED', updatedBy || 'unknown', { appointmentId, update });

            return res.json({ success: true, data: mapAppointment(appointment) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async cancelAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { cancelledBy } = req.body;

            const appointment = await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'cancelled' }
            });

            await logActivity('APPOINTMENT_CANCELLED', cancelledBy || 'unknown', { appointmentId });

            return res.json({ success: true, data: mapAppointment(appointment) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listAppointments(req, res) {
        try {
            const { doctorId, patientId, status, from, to, search } = req.query;
            const where = {};
            if (doctorId) where.doctorId = doctorId;
            if (patientId) where.patientId = patientId;
            if (status) where.status = status;
            if (search) {
                where.patientName = { contains: search, mode: 'insensitive' };
            }
            if (from || to) {
                where.scheduledTime = {};
                if (from) where.scheduledTime.gte = new Date(from);
                if (to) where.scheduledTime.lte = new Date(to);
            }

            const appointments = await prisma.appointment.findMany({
                where,
                orderBy: { scheduledTime: 'asc' }
            });

            return res.json({ success: true, data: appointments.map(mapAppointment) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async getAvailableSlots(req, res) {
        try {
            const { doctorId, date } = req.query;
            if (!doctorId) {
                return res.status(400).json({ success: false, error: 'doctorId is required' });
            }

            const targetDate = date ? new Date(date) : new Date();
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            const day = targetDate.getDate();

            const standardSlots = [
                '09:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00'
            ];

            const startOfDay = new Date(year, month, day, 0, 0, 0);
            const endOfDay = new Date(year, month, day, 23, 59, 59);

            const appointments = await prisma.appointment.findMany({
                where: {
                    doctorId,
                    status: { in: ['scheduled', 'checked-in'] },
                    scheduledTime: { gte: startOfDay, lte: endOfDay }
                }
            });

            const bookedTimes = appointments.map(apt => {
                const h = String(apt.scheduledTime.getHours()).padStart(2, '0');
                const m = String(apt.scheduledTime.getMinutes()).padStart(2, '0');
                return `${h}:${m}`;
            });

            const availableSlots = standardSlots.filter(slot => !bookedTimes.includes(slot));

            return res.json({ success: true, data: availableSlots });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new AppointmentController();
