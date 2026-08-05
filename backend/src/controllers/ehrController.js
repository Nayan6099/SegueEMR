const crypto = require('crypto');
// archiver is imported dynamically where needed
const blobStorageService = require('../services/blobStorageService');
const dbService = require('../services/dbService');
const fhirService = require('../services/fhirService');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

/**
 * Derive encryption key based on salt/key format
 */
function getDerivedKey(encryptionKeyOrSalt) {
    if (!process.env.ENCRYPTION_MASTER_KEY) {
        throw new Error('ENCRYPTION_MASTER_KEY is not set in the environment');
    }
    
    // Legacy format: the stored string is a 64-character hex string (32 bytes)
    if (encryptionKeyOrSalt.length === 64) {
        // Fall back to old behavior: derive from the stored plaintext key using hardcoded 'salt'
        return crypto.scryptSync(encryptionKeyOrSalt, 'salt', 32);
    } 
    
    // New format: the stored string is a 32-character hex string (16 bytes salt)
    if (encryptionKeyOrSalt.length === 32) {
        // Derive key from Master Key and the unique salt
        return crypto.scryptSync(process.env.ENCRYPTION_MASTER_KEY, encryptionKeyOrSalt, 32);
    }

    throw new Error('Invalid encryption key/salt format');
}

/**
 * Encrypt file using AES-256-CBC
 */
function encryptFile(buffer, encryptionKeyOrSalt) {
    const algorithm = 'aes-256-cbc';
    const key = getDerivedKey(encryptionKeyOrSalt);
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
function decryptFile(encryptedBuffer, encryptionKeyOrSalt) {
    const algorithm = 'aes-256-cbc';
    const key = getDerivedKey(encryptionKeyOrSalt);
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

            let finalPatientId = patientId;
            if (req.user.role === 'patient') {
                finalPatientId = req.user.patientId;
            }
            const uploadedBy = req.user.userId;

            // Generate unique record ID
            const recordId = `EHR_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            console.log(`Generated Record ID: ${recordId}`);

            // Generate encryption salt (16 bytes = 32 hex chars) for the new schema
            const encryptionKey = crypto.randomBytes(16).toString('hex');

            // Encrypt file
            console.log('Encrypting file before upload...');
            const encryptedBuffer = encryptFile(req.file.buffer, encryptionKey);

            // Upload to Azure Blob Storage
            console.log('Uploading to Azure Blob Storage...');
            const blobName = `${finalPatientId}/${recordId}_${req.file.originalname}`;
            const blobUrl = await blobStorageService.uploadBlob(blobName, encryptedBuffer, req.file.mimetype);
            console.log(`Uploaded blob URL: ${blobUrl}`);

            // Save metadata to database (PostgreSQL)
            console.log('Saving metadata to database...');
            const savedMetadata = await dbService.saveMetadata({
                recordId,
                patientId: finalPatientId,
                patientName,
                blobReference: blobName,
                recordType,
                description: description || '',
                fileSize: req.file.size,
                uploadedBy,
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

            await logActivity('RECORD_UPLOADED', uploadedBy, { recordId, recordType, fileSize: req.file.size });

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

            const { recordId } = req.query;
            const userId = req.user.userId;

            if (!recordId) {
                return res.status(400).json({
                    error: 'Missing required param: recordId'
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
            const { recordId } = req.query;
            const userId = req.user.userId;

            if (!recordId) {
                return res.status(400).json({
                    error: 'Missing required param: recordId'
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

            const { recordId, doctorId } = req.body;
            const patientId = req.user.patientId;

            if (!recordId || !patientId || !doctorId) {
                return res.status(400).json({
                    error: 'Missing required fields: recordId, doctorId'
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

            const { recordId, doctorId } = req.body;
            const patientId = req.user.patientId;

            if (!recordId || !patientId || !doctorId) {
                return res.status(400).json({
                    error: 'Missing required fields: recordId, doctorId'
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
            const { recordId } = req.query;

            if (!recordId) {
                return res.status(400).json({
                    error: 'Missing required param: recordId'
                });
            }

            // Verify access history permissions (admin or record owner)
            const metadata = await dbService.getRecordById(recordId);
            if (req.user.role !== 'admin' && req.user.role !== 'admin_staff' && metadata.patientId !== req.user.patientId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access Denied',
                    details: 'Unauthorized to view access logs for this record'
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
            const { patientId } = req.query;
            const userId = req.user.userId;
            const role = req.user.role;

            let metadata;
            if (role === 'patient') {
                const finalPatientId = req.user.patientId;
                metadata = await dbService.getRecordsByPatient(finalPatientId);
            } else {
                metadata = await dbService.getRecordsAccessibleByUser(userId);
                if (patientId) {
                    metadata = metadata.filter(m => m.patientId === patientId);
                }
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

    /**
     * BULK EXPORT PATIENT RECORDS (ZIP)
     */
    async bulkExportEHR(req, res) {
        try {
            console.log('\n=== BULK EXPORT EHR REQUEST ===');

            // 1. Authenticate & fetch metadata using the same secure logic as listPatientRecords
            const role = req.user.role;
            if (role !== 'patient') {
                return res.status(403).json({ error: 'Only patients can bulk-export their own records.' });
            }
            const finalPatientId = req.user.patientId;
            const metadataList = await dbService.getRecordsByPatient(finalPatientId);

            if (!metadataList || metadataList.length === 0) {
                return res.status(404).json({ error: 'No records found for bulk export.' });
            }

            // 2. Set headers for ZIP response
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="Medical_Records_${finalPatientId}.zip"`);

            // 3. Initialize archiver (dynamically imported because it is an ES module)
            const { default: archiver } = await import('archiver');
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.on('error', (err) => {
                console.error('Archiver error:', err);
                if (!res.headersSent) {
                    res.status(500).send({ error: 'Failed to create ZIP archive.' });
                }
            });

            // Pipe archive data to the response
            archive.pipe(res);

            // 4. Stream and decrypt each record into the archive
            for (const metadata of metadataList) {
                try {
                    console.log(`Zipping ${metadata.recordId}...`);
                    const encryptedBuffer = await blobStorageService.downloadBlob(metadata.blobReference);
                    const fileBuffer = decryptFile(encryptedBuffer, metadata.encryptionKey);
                    
                    // Create a safe filename (e.g., ClinicalNote_abc123.pdf or just ClinicalNote_abc123)
                    const filename = `${metadata.recordType}_${metadata.recordId}`;
                    archive.append(fileBuffer, { name: filename });
                } catch (err) {
                    console.error(`Failed to zip record ${metadata.recordId}:`, err);
                    // Add an error log inside the zip instead of failing the whole zip
                    archive.append(`Failed to download or decrypt record: ${metadata.recordId}\nError: ${err.message}`, { name: `ERROR_${metadata.recordId}.txt` });
                }
            }

            // 5. Finalize the archive (this will finish the response stream)
            await archive.finalize();
            console.log('=== BULK EXPORT EHR COMPLETE ===\n');

        } catch (error) {
            console.error('Error in bulkExportEHR:', error);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to bulk export records',
                    details: error.message
                });
            }
        }
    }
}

module.exports = new EHRController();
