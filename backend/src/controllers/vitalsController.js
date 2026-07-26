const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

class VitalsController {
    async createVitals(req, res) {
        try {
            const { patientId, appointmentId, temperature, bloodPressure, pulse, spo2, recordedBy } = req.body;

            if (!patientId || !recordedBy) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId and recordedBy are required'
                });
            }

            const vitals = await prisma.vitals.create({
                data: {
                    patientId,
                    appointmentId: appointmentId || '',
                    temperature: temperature ? Number(temperature) : null,
                    bloodPressure: bloodPressure || '',
                    pulse: pulse ? Number(pulse) : null,
                    spo2: spo2 ? Number(spo2) : null,
                    recordedBy
                }
            });

            await logActivity('VITALS_RECORDED', recordedBy, { patientId, vitalsId: vitals.id });

            return res.status(201).json({ success: true, data: vitals });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listVitals(req, res) {
        try {
            const { patientId } = req.query;
            const where = {};
            if (patientId) where.patientId = patientId;

            const vitals = await prisma.vitals.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: vitals });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new VitalsController();
