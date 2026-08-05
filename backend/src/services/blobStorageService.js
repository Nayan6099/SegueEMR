const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');
require('dotenv').config();
const logger = require('../utils/logger');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'medical-records';

let containerClient = null;

if (connectionString) {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString, {
      retryOptions: { maxTries: 1, tryTimeoutInMs: 1000 },
    });
    containerClient = blobServiceClient.getContainerClient(containerName);
  } catch (error) {
    logger.error('[blobStorage:init]', { error: error.message });
  }
}

const fs = require('fs');
const path = require('path');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Uploads a file buffer to Azure Blob Storage
 * 
 * @param {string} blobName - Unique name for the blob
 * @param {Buffer} buffer - File contents
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - The URL of the uploaded blob
 */
async function uploadBlob(blobName, buffer, mimeType) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!containerClient) {
    console.warn('[DEMO FALLBACK] Azure Blob Storage client not initialized. Saving locally.');
    fs.writeFileSync(path.join(UPLOADS_DIR, blobName), buffer);
    return `http://localhost:5000/uploads/${blobName}`;
  }

  try {
    // Ensure container exists
    await containerClient.createIfNotExists({ access: 'blob' });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
    });

    return blockBlobClient.url;
  } catch (err) {
    logger.error('[blobStorage:uploadBlob]', { error: err.message, blobName });
    logger.warn(`[DEMO FALLBACK] Blob upload failed (${err.code}). Saving locally.`);
    fs.writeFileSync(path.join(UPLOADS_DIR, blobName), buffer);
    return `http://localhost:5000/uploads/${blobName}`;
  }
}

/**
 * Downloads a file from Azure Blob Storage as a Buffer
 * 
 * @param {string} blobName - Name of the blob to download
 * @returns {Promise<Buffer>} - The downloaded file content
 */
async function downloadBlob(blobName) {
  const localPath = path.join(UPLOADS_DIR, blobName);
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }

  if (!containerClient) {
    console.warn('[DEMO FALLBACK] Azure Blob Storage client not initialized. Returning mock buffer.');
    return Buffer.from("Demo Fallback: File content could not be retrieved from Azure Blob Storage because the emulator is not running.");
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download(0);
    
    return new Promise((resolve, reject) => {
      const chunks = [];
      const readableStream = downloadResponse.readableStreamBody;
      
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      readableStream.on('error', reject);
    });
  } catch (err) {
    logger.error('[blobStorage:downloadBlob]', { error: err.message, blobName });
    logger.warn(`[DEMO FALLBACK] Blob download failed (${err.code}). Returning mock buffer.`);
    return Buffer.from("Demo Fallback: File content could not be retrieved from Azure Blob Storage because the emulator is not running.");
  }
}

/**
 * Deletes a file from Azure Blob Storage
 * 
 * @param {string} blobName - Name of the blob to delete
 * @returns {Promise<boolean>}
 */
async function deleteBlob(blobName) {
  if (!containerClient) {
    throw new Error('Azure Blob Storage client is not initialized');
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.deleteIfExists();
    return response.succeeded;
  } catch (err) {
    logger.error('[blobStorage:deleteBlob]', { error: err.message, blobName });
    throw err;
  }
}

async function generateSasUrl(blobName, expiresInMinutes = 5) {
  const localPath = path.join(UPLOADS_DIR, blobName);
  if (fs.existsSync(localPath)) {
    return `http://localhost:5000/uploads/${blobName}`;
  }

  if (!containerClient) {
    console.warn('[DEMO FALLBACK] Azure Blob Storage client not initialized. Returning mock SAS URL.');
    return `http://localhost:5000/uploads/${blobName}`;
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    // generateSasUrl is available on the client when created from a connection string
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: expiresOn
    });
    
    return sasUrl;
  } catch (err) {
    logger.error('[blobStorage:generateSasUrl]', { error: err.message, blobName });
    logger.warn(`[DEMO FALLBACK] SAS URL generation failed (${err.code}). Returning mock URL.`);
    return `http://localhost:5000/uploads/${blobName}`;
  }
}

module.exports = {
  uploadBlob,
  downloadBlob,
  deleteBlob,
  generateSasUrl,
};
