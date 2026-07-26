const prisma = require('../config/prisma');

const mapMetadata = (record) => {
    if (!record) return null;
    const meta = JSON.parse(record.metadata || '{}');
    return {
        recordId: record.recordId,
        patientId: record.patientId,
        patientName: meta.patientName || '',
        blobReference: meta.blobReference || '',
        recordType: meta.recordType || 'Report',
        description: meta.description || '',
        fileSize: Number(meta.fileSize || 0),
        uploadedBy: record.doctorId,
        encryptionKey: meta.encryptionKey || '',
        authorizedUsers: meta.authorizedUsers || [record.patientId],
        fhirResourceId: record.fhirResourceId,
        uploadDate: record.createdAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
};

class DatabaseService {
    constructor() {
        this.isConnected = true;
    }

    async connect() {
        return true;
    }

    async saveMetadata(metadata) {
        try {
            const authorizedUsers = metadata.authorizedUsers || [metadata.patientId];
            const metaPayload = {
                patientName: metadata.patientName,
                blobReference: metadata.blobReference,
                recordType: metadata.recordType,
                description: metadata.description || '',
                fileSize: metadata.fileSize,
                encryptionKey: metadata.encryptionKey || '',
                authorizedUsers
            };

            const record = await prisma.eHRMetadata.create({
                data: {
                    recordId: metadata.recordId,
                    patientId: metadata.patientId,
                    doctorId: metadata.uploadedBy || '',
                    orgName: 'hospital',
                    metadata: JSON.stringify(metaPayload)
                }
            });

            console.log(`✓ Metadata saved for record ${metadata.recordId}`);
            return mapMetadata(record);
        } catch (error) {
            console.error('Error saving metadata:', error);
            throw error;
        }
    }

    async getRecordsByPatient(patientId, options = {}) {
        try {
            const records = await prisma.eHRMetadata.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' },
                take: options.limit || 100
            });
            return records.map(mapMetadata);
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    }

    async getRecordById(recordId) {
        try {
            const record = await prisma.eHRMetadata.findUnique({
                where: { recordId }
            });
            if (!record) throw new Error(`Record ${recordId} not found in database`);
            return mapMetadata(record);
        } catch (error) {
            console.error('Error fetching record:', error);
            throw error;
        }
    }

    async getRecordsAccessibleByUser(userId) {
        try {
            const allRecords = await prisma.eHRMetadata.findMany({
                orderBy: { createdAt: 'desc' }
            });
            const mapped = allRecords.map(mapMetadata);
            return mapped.filter(r => r.authorizedUsers.includes(userId));
        } catch (error) {
            console.error('Error fetching accessible records:', error);
            throw error;
        }
    }

    async updateMetadata(recordId, updates) {
        try {
            const record = await prisma.eHRMetadata.findUnique({
                where: { recordId }
            });
            if (!record) throw new Error(`Record ${recordId} not found`);

            const currentMeta = JSON.parse(record.metadata || '{}');
            let updatedMeta = { ...currentMeta };

            if (updates.$addToSet && updates.$addToSet.authorizedUsers) {
                const userToAdd = updates.$addToSet.authorizedUsers;
                const currentUsers = currentMeta.authorizedUsers || [record.patientId];
                if (!currentUsers.includes(userToAdd)) {
                    currentUsers.push(userToAdd);
                }
                updatedMeta.authorizedUsers = currentUsers;
            } else if (updates.$pull && updates.$pull.authorizedUsers) {
                const userToRemove = updates.$pull.authorizedUsers;
                const currentUsers = currentMeta.authorizedUsers || [record.patientId];
                updatedMeta.authorizedUsers = currentUsers.filter(u => u !== userToRemove);
            } else {
                updatedMeta = { ...currentMeta, ...updates };
            }

            const updatedRecord = await prisma.eHRMetadata.update({
                where: { recordId },
                data: {
                    metadata: JSON.stringify(updatedMeta)
                }
            });

            console.log(`✓ Metadata updated for record ${recordId}`);
            return mapMetadata(updatedRecord);
        } catch (error) {
            console.error('Error updating metadata:', error);
            throw error;
        }
    }

    async getStatistics(patientId) {
        try {
            const records = await this.getRecordsByPatient(patientId);
            const statsMap = {};
            records.forEach(r => {
                if (!statsMap[r.recordType]) {
                    statsMap[r.recordType] = { _id: r.recordType, count: 0, totalSize: 0 };
                }
                statsMap[r.recordType].count += 1;
                statsMap[r.recordType].totalSize += r.fileSize;
            });
            return Object.values(statsMap);
        } catch (error) {
            console.error('Error getting statistics:', error);
            throw error;
        }
    }
}

module.exports = new DatabaseService();
