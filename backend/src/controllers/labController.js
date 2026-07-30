const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');
const fhirService = require('../services/fhirService');
const externalFhirService = require('../services/externalFhirService');
const blobStorageService = require('../services/blobStorageService');
const auditService = require('../services/auditService');
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
    }// Legacy endpoint retained for backward compatibility
    async notifyLabOrderLegacy(req, res) {
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

    // New FHIR‑based notification workflow
    async notifyLabOrderFhir(req, res) {
        const { orderId } = req.params;
        const { target } = req.body; // 'doctor', 'patient', or 'both'
        const requesterRole = req.user.role;

        // Authorization check
        if (requesterRole !== 'lab_technician' && requesterRole !== 'doctor') {
            return res.status(403).json({ success: false, error: 'Only lab technicians and doctors can send notifications' });
        }

        try {
            await prisma.$transaction(async (tx) => {
                const labOrder = await tx.labOrder.findUnique({
                    where: { id: orderId },
                    include: { doctor: true, patient: true }
                });

                if (!labOrder) {
                    throw new AppError(ERROR_CODES.NOT_FOUND, 'Lab order not found');
                }
                if (labOrder.status !== 'completed') {
                    throw new AppError(ERROR_CODES.INVALID_STATE, 'Lab order must be completed before notifying');
                }

                // Sync to FHIR (creates DiagnosticReport)
                const fhirResult = await fhirService.syncLabOrder(labOrder);
                if (!fhirResult || !fhirResult.id) {
                    throw new AppError(ERROR_CODES.EXTERNAL_SERVICE, 'Failed to create FHIR DiagnosticReport');
                }

                // Persist FHIR ID
                await tx.labOrder.update({
                    where: { id: orderId },
                    data: { fhirResourceId: fhirResult.id }
                });

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
                    if (isDuplicate) continue;

                    const title = 'Lab Result Ready';
                    const fhirUrl = `${process.env.FHIR_BASE_URL}/DiagnosticReport/${fhirResult.id}`;
                    const message = `Lab result for ${labOrder.testName} is ready. View at ${fhirUrl}`;

                    const notif = await tx.notification.create({
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
                    await tx.labOrder.update({
                        where: { id: orderId },
                        data: labUpdateData
                    });
                }

                // Respond after transaction commits
                res.status(201).json({
                    success: true,
                    data: notifications,
                    updatedOrder: labUpdateData,
                    fhirReportId: fhirResult.id
                });
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.message || 'Internal server error';
            return res.status(status).json({ success: false, error: message });
        }
    }

    async uploadPdfReport(req, res) {
        try {
            const { id } = req.params;
            const file = req.file;
            const processedBy = req.user.userId;

            if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });

            const labOrder = await prisma.labOrder.findUnique({ where: { id } });
            if (!labOrder) return res.status(404).json({ success: false, error: 'Lab order not found' });
            if (labOrder.status !== 'completed') return res.status(400).json({ success: false, error: 'Lab order must be completed first' });

            const blobName = `lab-report-${id}-${Date.now()}.pdf`;
            const pdfBlobUrl = await blobStorageService.uploadBlob(blobName, file.buffer, file.mimetype);

            let fhirBinaryId = null;
            let fhirDocumentReferenceId = null;

            try {
                fhirBinaryId = await fhirService.createBinary(pdfBlobUrl, file.mimetype);
                fhirDocumentReferenceId = await fhirService.createDocumentReference(labOrder, fhirBinaryId, pdfBlobUrl);
            } catch (fhirErr) {
                logger.error('[FHIR] Failed to create DocumentReference', { error: fhirErr.message });
            }

            const updatedOrder = await prisma.labOrder.update({
                where: { id },
                data: {
                    pdfBlobName: blobName,
                    pdfBlobUrl,
                    fhirBinaryId,
                    fhirDocumentReferenceId
                }
            });

            await auditService.logLabAction(id, 'UPLOAD_PDF', processedBy);

            return res.json({ success: true, data: updatedOrder });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async sendLabReport(req, res) {
        try {
            const { id } = req.params;
            const { recipient } = req.body;
            const senderId = req.user.userId;
            const requesterRole = req.user.role;

            if (requesterRole !== 'lab_technician' && requesterRole !== 'doctor') {
                return res.status(403).json({ success: false, error: 'Only lab technicians and doctors can send reports' });
            }

            const labOrder = await prisma.labOrder.findUnique({ where: { id } });
            if (!labOrder) return res.status(404).json({ success: false, error: 'Lab order not found' });
            if (!labOrder.pdfBlobUrl) return res.status(400).json({ success: false, error: 'PDF report must be uploaded first' });

            const targets = recipient === 'both' ? ['doctor', 'patient'] : [recipient];
            const notifications = [];
            const labUpdateData = {};

            await prisma.$transaction(async (tx) => {
                for (const t of targets) {
                    let recipientId;
                    if (t === 'doctor') {
                        recipientId = labOrder.doctorId;
                        labUpdateData.doctorNotifiedAt = new Date();
                    } else if (t === 'patient') {
                        const patientRecord = await tx.patient.findUnique({ where: { id: labOrder.patientId } });
                        recipientId = patientRecord?.userId || labOrder.patientName || labOrder.patientId;
                        console.log('[DEBUG NOTIFICATION] Patient target:', {
                            labOrderPatientId: labOrder.patientId,
                            labOrderPatientName: labOrder.patientName,
                            patientRecordFound: !!patientRecord,
                            patientRecordUserId: patientRecord?.userId,
                            resolvedRecipientId: recipientId
                        });
                        labUpdateData.patientNotifiedAt = new Date();
                    }

                    const title = 'Lab Report Ready';
                    const message = `The PDF report for ${labOrder.testName} is ready.`;

                    const notif = await tx.notification.create({
                        data: {
                            userId: recipientId,
                            title,
                            message,
                            type: 'lab_report',
                            referenceType: 'LabOrder',
                            referenceId: id
                        }
                    });
                    notifications.push(notif);
                }

                if (Object.keys(labUpdateData).length > 0) {
                    await tx.labOrder.update({
                        where: { id },
                        data: labUpdateData
                    });
                }
            });

            await auditService.logLabAction(id, 'SEND_NOTIFICATION', senderId, { recipient });

            return res.json({ success: true, data: notifications, updatedOrder: labUpdateData });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async downloadSecureReport(req, res) {
        try {
            const { id } = req.params;
            const labOrder = await prisma.labOrder.findUnique({ where: { id } });
            if (!labOrder || !labOrder.pdfBlobName) {
                return res.status(404).json({ success: false, error: 'Report not found' });
            }

            // Verify ownership
            if (req.user.role === 'patient') {
                // Fetch patient record to compare login userId
                const patientRecord = await prisma.patient.findUnique({ where: { id: labOrder.patientId } });
                if (!patientRecord || patientRecord.userId !== req.user.userId) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access' });
                }
            }
            if (req.user.role === 'doctor' && req.user.doctorId !== labOrder.doctorId) {
                return res.status(403).json({ success: false, error: 'Unauthorized access' });
            }

            const sasUrl = await blobStorageService.generateSasUrl(labOrder.pdfBlobName, 5);
            await auditService.logLabAction(id, 'DOWNLOAD', req.user.userId);
            
            return res.json({ success: true, sasUrl });
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

            // Cleanup Azure Blob if exists
            if (labOrder.pdfBlobName) {
                try {
                    await blobStorageService.deleteBlob(labOrder.pdfBlobName);
                } catch (err) {
                    logger.warn('[Blob] Cleanup failed on undo', { error: err.message });
                }
            }

            const updatedOrder = await prisma.labOrder.update({
                where: { id: orderId },
                data: {
                    status: 'processing',
                    doctorNotifiedAt: null,
                    patientNotifiedAt: null,
                    pdfBlobName: null,
                    pdfBlobUrl: null,
                    fhirBinaryId: null,
                    fhirDocumentReferenceId: null
                }
            });

            await auditService.logLabAction(orderId, 'UNDO_COMPLETE', req.user.userId);

            return res.json({ success: true, data: updatedOrder });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new LabController();
