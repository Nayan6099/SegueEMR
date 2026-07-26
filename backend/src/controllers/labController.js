const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

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
            const { patientId, patientName, doctorId, testType, testName, notes } = req.body;

            const nameOfTest = testType || testName;
            if (!patientId || !patientName || !doctorId || !nameOfTest) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId, patientName, doctorId, and testType/testName are required'
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

            return res.status(201).json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async updateLabOrderStatus(req, res) {
        try {
            const { labOrderId } = req.params;
            const { status, processedBy } = req.body;

            if (!status || !processedBy) {
                return res.status(400).json({ success: false, error: 'status and processedBy are required' });
            }

            const labOrder = await prisma.labOrder.update({
                where: { id: labOrderId },
                data: { status, processedBy }
            });

            await logActivity('LAB_ORDER_UPDATED', processedBy, { labOrderId, status });

            return res.json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async uploadResult(req, res) {
        try {
            const { labOrderId } = req.params;
            const { resultSummary, resultFields, processedBy } = req.body;

            if (!resultSummary || !processedBy) {
                return res.status(400).json({ success: false, error: 'resultSummary and processedBy are required' });
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

            return res.json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listLabOrders(req, res) {
        try {
            const { patientId, doctorId, status } = req.query;
            const where = {};
            if (patientId) where.patientId = patientId;
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
