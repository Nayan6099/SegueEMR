const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

const genId = () => `RX-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapPrescription = (rx) => {
    if (!rx) return null;
    return {
        id: rx.id,
        prescriptionId: rx.id,
        patientId: rx.patientId,
        patientName: rx.patientName,
        doctorId: rx.doctorId,
        doctorName: rx.doctorName,
        diagnosis: rx.diagnosis,
        status: rx.status,
        dispensedBy: rx.dispensedBy,
        dispensedAt: rx.dispensedAt,
        createdAt: rx.createdAt,
        updatedAt: rx.updatedAt,
        medications: (rx.medications || []).map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration
        }))
    };
};

class PrescriptionController {
    async createPrescription(req, res) {
        try {
            const { patientId, patientName, doctorId, doctorName, medications, diagnosis } = req.body;

            if (!patientId || !patientName || !doctorId || !medications || !medications.length) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId, patientName, doctorId, and at least one medication are required'
                });
            }

            const prescription = await prisma.prescription.create({
                data: {
                    id: genId(),
                    patientId,
                    patientName,
                    doctorId,
                    doctorName: doctorName || '',
                    diagnosis: diagnosis || '',
                    status: 'pending',
                    medications: {
                        create: medications.map(med => ({
                            name: med.name,
                            dosage: med.dosage || '',
                            frequency: med.frequency || '',
                            duration: med.duration || ''
                        }))
                    }
                },
                include: { medications: true }
            });

            await logActivity('PRESCRIPTION_CREATED', doctorId, { prescriptionId: prescription.id, patientId });

            return res.status(201).json({ success: true, data: mapPrescription(prescription) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async dispensePrescription(req, res) {
        try {
            const { prescriptionId } = req.params;
            const { dispensedBy } = req.body;

            if (!dispensedBy) {
                return res.status(400).json({ success: false, error: 'dispensedBy is required' });
            }

            const checkPrescription = await prisma.prescription.findUnique({
                where: { id: prescriptionId }
            });

            if (!checkPrescription || checkPrescription.status !== 'pending') {
                return res.status(404).json({ success: false, error: 'Pending prescription not found' });
            }

            const prescription = await prisma.prescription.update({
                where: { id: prescriptionId },
                data: { status: 'dispensed', dispensedBy, dispensedAt: new Date() },
                include: { medications: true }
            });

            await logActivity('PRESCRIPTION_DISPENSED', dispensedBy, { prescriptionId });

            return res.json({ success: true, data: mapPrescription(prescription) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listPrescriptions(req, res) {
        try {
            const { patientId, doctorId, status } = req.query;
            const where = {};
            if (patientId) where.patientId = patientId;
            if (doctorId) where.doctorId = doctorId;
            if (status) where.status = status;

            const prescriptions = await prisma.prescription.findMany({
                where,
                include: { medications: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: prescriptions.map(mapPrescription) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new PrescriptionController();
