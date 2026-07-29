const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');
const fhirService = require('../services/fhirService');
const externalFhirService = require('../services/externalFhirService');
const logger = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../utils/errors');
const { resolveDoctorId } = require('../utils/resolvers');
const { assertRequired } = require('../utils/validators');

const genId = () => `LAB-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapLabOrder = (lab) => {
    if (!lab) return null;
    return {
        id: lab.id,
        labOrderId: lab.id,
        patientId: lab.patientId,
        patientName: lab.patientName,
        doctorId: lab.doctorId,
        doctorName: lab.doctor ? lab.doctor.name : (lab.doctorName || null),
        doctorSpecialization: lab.doctor ? lab.doctor.specialization : null,
        testType: lab.testName,
        testName: lab.testName,
        status: lab.status,
        notes: lab.notes,
        resultSummary: lab.resultSummary,
        critical: lab.critical,
        resultFields: lab.resultFields ? JSON.parse(lab.resultFields) : {},
        processedBy: lab.processedBy,
        assignedLabId: lab.assignedLabId,
        externalReferenceId: lab.externalReferenceId,
        createdAt: lab.createdAt,
        updatedAt: lab.updatedAt
    };
};

class LabController {
    async createLabOrder(req, res, next) {
        try {
            const { patientId, patientName, testType, testName, notes, assignedLabId } = req.body;

            assertRequired(['patientId', 'patientName'], req.body);

            const nameOfTest = testType || testName;
            if (!nameOfTest) {
                throw new AppError(ERROR_CODES.MISSING_FIELDS, 'testType or testName is required');
            }

            // Resolve doctor FK — works for both doctorId ('DR-dr.smith') and userId ('dr.smith')
            const rawDoctorId = req.user?.doctorId || req.user?.userId;
            const doctorRecord = await resolveDoctorId(rawDoctorId);

            const labOrder = await prisma.labOrder.create({
                data: {
                    id: genId(),
                    patientId,
                    patientName,
                    doctorId: doctorRecord.id,
                    testName: nameOfTest,
                    notes: notes || '',
                    status: 'pending',
                    assignedLabId: assignedLabId || null
                }
            });

            logActivity('LAB_ORDER_CREATED', req.user?.userId, {
                labOrderId: labOrder.id, patientId, testType: nameOfTest, assignedLabId
            }, req.user?.role).catch(() => {});

            // Sync to FHIR (fire-and-forget)
            fhirService.syncLabOrder(labOrder)
                .then(fhirRes => {
                    if (fhirRes?.id) {
                        prisma.labOrder.update({ where: { id: labOrder.id }, data: { fhirResourceId: fhirRes.id } })
                            .catch(e => logger.error('[FHIR] Lab fhirResourceId save failed', { error: e.message }));
                    }
                })
                .catch(err => logger.error('[FHIR] LabOrder sync failed', { error: err.message }));

            // External lab submission (fire-and-forget)
            externalFhirService.submitLabOrder(labOrder)
                .then(extRes => {
                    if (extRes?.id) {
                        prisma.labOrder.update({ where: { id: labOrder.id }, data: { externalReferenceId: extRes.id } })
                            .catch(e => logger.error('[External] Lab externalReferenceId save failed', { error: e.message }));
                    }
                })
                .catch(err => logger.error('[External] LabOrder submission failed', { error: err.message }));

            return res.status(201).json({ success: true, data: mapLabOrder(labOrder) });
        } catch (err) {
            next(err);
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

            if (req.user.role === 'lab_technician') {
                where.OR = [
                    { assignedLabId: req.user.userId },
                    { assignedLabId: null }
                ];
            }

            if (finalPatientId) where.patientId = finalPatientId;
            if (doctorId) where.doctorId = doctorId;
            if (status) where.status = status;

            const labOrders = await prisma.labOrder.findMany({
                where,
                include: { doctor: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: labOrders.map(mapLabOrder) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
        // --- Doctor Lab Reports (Doctor) ---
    async getDoctorLabReports(req, res) {
        try {
            const doctorId = req.user.doctorId;
            const labOrders = await prisma.labOrder.findMany({
                where: { doctorId, status: 'completed' },
                select: {
                    id: true,
                    testName: true,
                    resultSummary: true,
                    patientId: true,
                    patientName: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: labOrders });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    // New endpoint: Notify doctor or patient about completed lab order
    async notifyLabOrder(req, res) {
        try {
            const { orderId } = req.params;
            const { target } = req.body; // 'doctor', 'patient', or 'both'
            const requesterRole = req.user.role;

            if (requesterRole !== 'lab_technician' && requesterRole !== 'doctor') {
                return res.status(403).json({ success: false, error: 'Only lab technicians and doctors can send notifications' });
            }

            const labOrder = await prisma.labOrder.findUnique({
                where: { id: orderId },
                include: { doctor: true, patient: true }
            });
            
            if (!labOrder) {
                return res.status(404).json({ success: false, error: 'Lab order not found' });
            }
            if (labOrder.status !== 'completed') {
                return res.status(400).json({ success: false, error: 'Lab order must be completed before notifying' });
            }

            const targets = target === 'both' ? ['doctor', 'patient'] : [target];
            const notifications = [];
            const labUpdateData = {};

            for (const t of targets) {
                let recipientId;
                let isDuplicate = false;
                
                if (t === 'doctor') {
                    recipientId = labOrder.doctorId;
                    isDuplicate = !!labOrder.doctorNotifiedAt;
                } else if (t === 'patient') {
                    recipientId = labOrder.patientId;
                    isDuplicate = !!labOrder.patientNotifiedAt;
                } else {
                    continue;
                }

                if (isDuplicate) {
                    continue; // Skip if already notified
                }

                const title = 'Lab Result Ready';
                const message = `Lab result for ${labOrder.testName} is ready.`;
                
                const notif = await prisma.notification.create({
                    data: {
                        userId: recipientId,
                        title,
                        message,
                        type: 'lab_result',
                        referenceType: 'LabOrder',
                        referenceId: orderId
                    }
                });
                
                notifications.push(notif);
                
                if (t === 'doctor') labUpdateData.doctorNotifiedAt = new Date();
                if (t === 'patient') labUpdateData.patientNotifiedAt = new Date();
            }

            if (Object.keys(labUpdateData).length > 0) {
                await prisma.labOrder.update({
                    where: { id: orderId },
                    data: labUpdateData
                });
            }

            return res.status(201).json({ success: true, data: notifications, updatedOrder: labUpdateData });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async undoComplete(req, res) {
        try {
            const { orderId } = req.params;
            const requesterRole = req.user.role;

            if (requesterRole !== 'lab_technician') {
                return res.status(403).json({ success: false, error: 'Only lab technicians can undo completion' });
            }

            const labOrder = await prisma.labOrder.findUnique({ where: { id: orderId } });
            if (!labOrder) return res.status(404).json({ success: false, error: 'Lab order not found' });
            
            if (labOrder.status !== 'completed') {
                return res.status(400).json({ success: false, error: 'Lab order is not completed' });
            }

            const updatedOrder = await prisma.labOrder.update({
                where: { id: orderId },
                data: {
                    status: 'processing',
                    doctorNotifiedAt: null,
                    patientNotifiedAt: null
                }
            });

            return res.json({ success: true, data: updatedOrder });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new LabController();
