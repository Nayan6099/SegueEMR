const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const blobStorageService = require('../src/services/blobStorageService');
require('dotenv').config();

const prisma = new PrismaClient();

function getLegacyKey(encryptionKey) {
    return crypto.scryptSync(encryptionKey, 'salt', 32);
}

function getDerivedKey(salt) {
    if (!process.env.ENCRYPTION_MASTER_KEY) {
        throw new Error('ENCRYPTION_MASTER_KEY is not set in the environment');
    }
    return crypto.scryptSync(process.env.ENCRYPTION_MASTER_KEY, salt, 32);
}

async function migrate() {
    console.log('Starting EHR encryption migration...');
    
    if (!process.env.ENCRYPTION_MASTER_KEY) {
        console.error('Error: ENCRYPTION_MASTER_KEY is not set');
        process.exit(1);
    }

    const records = await prisma.eHRMetadata.findMany();
    let migratedCount = 0;
    
    for (const record of records) {
        try {
            let meta = record.metadata;
            if (typeof meta === 'string') {
                meta = JSON.parse(meta);
            }
            
            if (meta.encryptionKey && meta.encryptionKey.length === 64) {
                console.log(`Migrating record: ${record.recordId}`);
                
                // 1. Download
                const encryptedBuffer = await blobStorageService.downloadBlob(meta.blobReference);
                
                // 2. Decrypt with legacy format
                const algorithm = 'aes-256-cbc';
                const legacyKeyBytes = getLegacyKey(meta.encryptionKey);
                const iv = encryptedBuffer.slice(0, 16);
                const encryptedData = encryptedBuffer.slice(16);
                const decipher = crypto.createDecipheriv(algorithm, legacyKeyBytes, iv);
                const decryptedBuffer = Buffer.concat([
                    decipher.update(encryptedData),
                    decipher.final()
                ]);
                
                // 3. Re-encrypt with new format
                const newSalt = crypto.randomBytes(16).toString('hex');
                const newKeyBytes = getDerivedKey(newSalt);
                const newIv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv(algorithm, newKeyBytes, newIv);
                const newEncryptedBuffer = Buffer.concat([
                    newIv,
                    cipher.update(decryptedBuffer),
                    cipher.final()
                ]);
                
                // 4. Upload over old file
                await blobStorageService.uploadBlob(meta.blobReference, newEncryptedBuffer, 'application/octet-stream');
                
                // 5. Update database
                meta.encryptionKey = newSalt;
                await prisma.eHRMetadata.update({
                    where: { recordId: record.recordId },
                    data: { metadata: JSON.stringify(meta) }
                });
                
                console.log(`Successfully migrated ${record.recordId}`);
                migratedCount++;
            }
        } catch (e) {
            console.error(`Failed to migrate ${record.recordId}:`, e.message);
        }
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} records.`);
    process.exit(0);
}

migrate();
