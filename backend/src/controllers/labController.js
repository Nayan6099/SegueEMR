const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');
const fhirService = require('../services/fhirService');


const genId = () => `LAB-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapLabOrder = (lab) => {
    if (!lab) return null;
    return {
        id: lab.id,
        labOrderId: lab.id,
        patientId: lab.patientId,
        patientName: lab.patientName,
        doctorId: lab.doctorId,
        testType: lab.testName,
        testName: lab.testName,
        status: lab.status,
        notes: lab.notes,
        resultSummary: lab.resultSummary,
        critical: lab.critical,
        resultFields: lab.resultFields ? JSON.parse(lab.resultFields) : {},
        processedBy: lab.processedBy,
        createdAt: lab.createdAt,
        updatedAt: lab.updatedAt
    };
};

class LabController {
    async createLabOrder(req, res) {
        try {
            const { patientId, patientName, testType, testName, notes } = req.body;
            const doctorId = req.user.doctorId;

            const nameOfTest = testType || testName;
            if (!patientId || !patientName || !doctorId || !nameOfTest) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId, patientName, and testType/testName are required'
                });
            }

            const labOrder = await prisma.labOrder.create({
                data: {
                    id: genId(),
                    patientId,
                    patientName,
                    doctorId,
                    testName: nameOfTest,
                    notes: notes || '',
                    status: 'pending'
                }
            });

            await logActivity('LAB_ORDER_CREATED', doctorId, { labOrderId: labOrder.id, patientId, testType: nameOfTest });

            // Sync to FHIR (fire-and-forget, non-blocking)
            fhirService.syncLabOrder(labOrder)
                .then(res => {
                    if (res && res.id) {
                        prisma.labOrder.update({
                            where: { id: labOrder.id },
                            data: { fhirResourceId: res.id }
                        }).catch(e => console.error('[FHIR] Failed to save fhirResourceId in LabOrder:', e.message));
                    }
                })
                .catch(err => console.error('[FHIR] LabOrder sync failed:', err.message));

            return res.status(201).json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async updateLabOrderStatus(req, res) {
        try {
            const { labOrderId } = req.params;
            const { status } = req.body;
            const processedBy = req.user.userId;

            if (!status) {
                return res.status(400).json({ success: false, error: 'status is required' });
            }

            const labOrder = await prisma.labOrder.update({
                where: { id: labOrderId },
                data: { status, processedBy }
            });

            await logActivity('LAB_ORDER_UPDATED', processedBy, { labOrderId, status });

            // Sync to FHIR (fire-and-forget, non-blocking)
            fhirService.syncLabOrder(labOrder).catch(err => console.error('[FHIR] LabOrder status sync failed:', err.message));

            return res.json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async uploadResult(req, res) {
        try {
            const { labOrderId } = req.params;
            const { resultSummary, resultFields } = req.body;
            const processedBy = req.user.userId;

            if (!resultSummary) {
                return res.status(400).json({ success: false, error: 'resultSummary is required' });
            }

            let critical = false;
            if (resultFields) {
                const chol = Number(resultFields.cholesterol);
                const hb = Number(resultFields.hemoglobin);
                const gluc = Number(resultFields.glucose);

                if (chol > 240) critical = true;
                if (hb > 0 && (hb < 10 || hb > 18)) critical = true;
                if (gluc > 0 && (gluc > 200 || gluc < 60)) critical = true;
            }

            const labOrder = await prisma.labOrder.update({
                where: { id: labOrderId },
                data: {
                    resultSummary,
                    resultFields: resultFields ? JSON.stringify(resultFields) : '{}',
                    critical,
                    processedBy,
                    status: 'completed'
                }
            });

            await logActivity('LAB_RESULT_UPLOADED', processedBy, { labOrderId, critical });

            // Sync to FHIR (fire-and-forget, non-blocking)
            fhirService.syncLabOrder(labOrder).catch(err => console.error('[FHIR] LabOrder result sync failed:', err.message));

            return res.json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listLabOrders(req, res) {
        try {
            const { patientId, doctorId, status } = req.query;
            const where = {};
            let finalPatientId = patientId;

            if (req.user.role === 'patient') {
                finalPatientId = req.user.patientId;
            }

            if (finalPatientId) where.patientId = finalPatientId;
            if (doctorId) where.doctorId = doctorId;
            if (status) where.status = status;

            const labOrders = await prisma.labOrder.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: labOrders.map(mapLabOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new LabController();
