const crypto = require('crypto');
const blobStorageService = require('../services/blobStorageService');
const dbService = require('../services/dbService');
const fhirService = require('../services/fhirService');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

/**
 * Encrypt file using AES-256-CBC
 */
function encryptFile(buffer, encryptionKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    return Buffer.concat([
        iv,
        cipher.update(buffer),
        cipher.final()
    ]);
}

/**
 * Decrypt file using AES-256-CBC
 */
function decryptFile(encryptedBuffer, encryptionKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
}

class EHRController {

    /**
     * UPLOAD NEW EHR RECORD
     */
    async uploadEHR(req, res) {
        try {
            console.log('\n=== NEW EHR UPLOAD REQUEST ===');

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { patientId, patientName, recordType, description } = req.body;
            
            if (!patientId || !patientName || !recordType) {
                return res.status(400).json({ 
                    error: 'Missing required fields: patientId, patientName, recordType' 
                });
            }

            // Generate unique record ID
            const recordId = `EHR_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            console.log(`Generated Record ID: ${recordId}`);

            // Generate encryption key
            const encryptionKey = crypto.randomBytes(32).toString('hex');

            // Encrypt file
            console.log('Encrypting file before upload...');
            const encryptedBuffer = encryptFile(req.file.buffer, encryptionKey);

            // Upload to Azure Blob Storage
            console.log('Uploading to Azure Blob Storage...');
            const blobName = `${patientId}/${recordId}_${req.file.originalname}`;
            const blobUrl = await blobStorageService.uploadBlob(blobName, encryptedBuffer, req.file.mimetype);
            console.log(`Uploaded blob URL: ${blobUrl}`);

            // Save metadata to database (PostgreSQL)
            console.log('Saving metadata to database...');
            const savedMetadata = await dbService.saveMetadata({
                recordId,
                patientId,
                patientName,
                blobReference: blobName, // Store blob path/name as the reference
                recordType,
                description: description || '',
                fileSize: req.file.size,
                uploadedBy: patientId, // patient upload self
                encryptionKey
            });

            console.log('=== EHR UPLOAD COMPLETE ===\n');

            // Sync to FHIR (fire-and-forget, non-blocking)
            fhirService.syncEHRRecord(savedMetadata, blobUrl)
                .then(fhirRes => {
                    if (fhirRes && fhirRes.id) {
                        prisma.eHRMetadata.update({
                            where: { recordId },
                            data: { fhirResourceId: fhirRes.id }
                        }).catch(e => console.error('[FHIR] Failed to update fhirResourceId in EHRMetadata:', e.message));
                    }
                })
                .catch(err => console.error('[FHIR] DocumentReference sync failed:', err.message));

            await logActivity('RECORD_UPLOADED', patientId, { recordId, recordType, fileSize: req.file.size });

            return res.status(201).json({
                success: true,
                message: 'EHR record created successfully',
                data: {
                    recordId,
                    blobReference: blobName,
                    fileSize: req.file.size,
                    uploadDate: new Date()
                }
            });
        } catch (error) {
            console.error('Error in uploadEHR:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to upload EHR',
                details: error.message
            });
        }
    }

    /**
     * VIEW/DOWNLOAD EHR RECORD
     */
    async viewEHR(req, res) {
        try {
            console.log('\n=== VIEW EHR REQUEST ===');

            const { recordId, userId, orgName } = req.query;

            if (!recordId || !userId || !orgName) {
                return res.status(400).json({
                    error: 'Missing required params: recordId, userId, orgName'
                });
            }

            console.log(`User ${userId} requesting record ${recordId}`);

            // Get metadata from PostgreSQL (enforce ACL validation)
            const metadata = await dbService.getRecordById(recordId);

            if (!metadata.authorizedUsers.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access Denied',
                    details: 'You are not authorized to view this record'
                });
            }

            console.log('✓ User is authorized to view this record');

            // Download file from Azure Blob Storage
            console.log('Downloading file from Azure Blob Storage...');
            const encryptedBuffer = await blobStorageService.downloadBlob(metadata.blobReference);

            // Decrypt file
            console.log('Decrypting file...');
            const fileBuffer = decryptFile(encryptedBuffer, metadata.encryptionKey);

            console.log('=== VIEW EHR COMPLETE ===\n');

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${recordId}_${metadata.recordType}"`);
            return res.send(fileBuffer);
        } catch (error) {
            console.error('Error in viewEHR:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve EHR',
                details: error.message
            });
        }
    }

    /**
     * GET RECORD DETAILS (metadata only)
     */
    async getRecordDetails(req, res) {
        try {
            const { recordId, userId, orgName } = req.query;

            if (!recordId || !userId || !orgName) {
                return res.status(400).json({
                    error: 'Missing required params: recordId, userId, orgName'
                });
            }

            // Get metadata from PostgreSQL
            const metadata = await dbService.getRecordById(recordId);

            if (!metadata.authorizedUsers.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access Denied',
                    details: 'You are not authorized to view this record'
                });
            }

            return res.json({
                success: true,
                data: {
                    metadata: metadata
                }
            });
        } catch (error) {
            console.error('Error in getRecordDetails:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get record details',
                details: error.message
            });
        }
    }

    /**
     * GRANT ACCESS TO DOCTOR
     */
    async grantAccess(req, res) {
        try {
            console.log('\n=== GRANT ACCESS REQUEST ===');

            const { recordId, patientId, doctorId } = req.body;

            if (!recordId || !patientId || !doctorId) {
                return res.status(400).json({
                    error: 'Missing required fields: recordId, patientId, doctorId'
                });
            }

            // Fetch record to verify patient owns it
            const metadata = await dbService.getRecordById(recordId);
            if (metadata.patientId !== patientId) {
                return res.status(403).json({ success: false, error: 'Unauthorized: Only the record owner can grant access.' });
            }

            console.log(`Patient ${patientId} granting access to ${doctorId} for record ${recordId}`);

            const result = await dbService.updateMetadata(recordId, { $addToSet: { authorizedUsers: doctorId } });

            // Sync update to FHIR (fire-and-forget, non-blocking)
            fhirService.syncEHRRecord(result, result.blobReference).catch(e => console.error('[FHIR] DocumentReference update sync failed:', e.message));

            console.log('=== ACCESS GRANTED ===\n');

            return res.json({
                success: true,
                message: `Access granted to ${doctorId}`,
                data: result
            });
        } catch (error) {
            console.error('Error in grantAccess:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to grant access',
                details: error.message
            });
        }
    }

    /**
     * REVOKE ACCESS FROM DOCTOR
     */
    async revokeAccess(req, res) {
        try {
            console.log('\n=== REVOKE ACCESS REQUEST ===');

            const { recordId, patientId, doctorId } = req.body;

            if (!recordId || !patientId || !doctorId) {
                return res.status(400).json({
                    error: 'Missing required fields: recordId, patientId, doctorId'
                });
            }

            // Fetch record to verify patient owns it
            const metadata = await dbService.getRecordById(recordId);
            if (metadata.patientId !== patientId) {
                return res.status(403).json({ success: false, error: 'Unauthorized: Only the record owner can revoke access.' });
            }

            console.log(`Patient ${patientId} revoking access from ${doctorId} for record ${recordId}`);

            const result = await dbService.updateMetadata(recordId, { $pull: { authorizedUsers: doctorId } });

            // Sync update to FHIR (fire-and-forget, non-blocking)
            fhirService.syncEHRRecord(result, result.blobReference).catch(e => console.error('[FHIR] DocumentReference update sync failed:', e.message));

            console.log('=== ACCESS REVOKED ===\n');

            return res.json({
                success: true,
                message: `Access revoked from ${doctorId}`,
                data: result
            });
        } catch (error) {
            console.error('Error in revokeAccess:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to revoke access',
                details: error.message
            });
        }
    }

    /**
     * GET ACCESS HISTORY (AUDIT TRAIL)
     */
    async getAccessHistory(req, res) {
        try {
            const { recordId, userId, orgName } = req.query;

            if (!recordId || !userId || !orgName) {
                return res.status(400).json({
                    error: 'Missing required params: recordId, userId, orgName'
                });
            }

            // Get access logs from Database instead of blockchain gateway
            const logs = await prisma.activityLog.findMany({
                where: {
                    details: {
                        contains: recordId
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.json({
                success: true,
                data: logs.map(l => ({
                    action: l.action,
                    userId: l.userId,
                    timestamp: l.createdAt,
                    details: l.details
                }))
            });
        } catch (error) {
            console.error('Error in getAccessHistory:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get access history',
                details: error.message
            });
        }
    }

    /**
     * LIST ALL RECORDS FOR A PATIENT
     */
    async listPatientRecords(req, res) {
        try {
            const { patientId, userId, orgName } = req.query;

            if (!patientId || !userId || !orgName) {
                return res.status(400).json({
                    error: 'Missing required params: patientId, userId, orgName'
                });
            }

            let metadata;
            if (orgName === 'patient') {
                metadata = await dbService.getRecordsByPatient(patientId);
            } else {
                metadata = await dbService.getRecordsAccessibleByUser(userId);
            }

            return res.json({
                success: true,
                count: metadata.length,
                data: metadata
            });
        } catch (error) {
            console.error('Error in listPatientRecords:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to list records',
                details: error.message
            });
        }
    }
}

module.exports = new EHRController();
