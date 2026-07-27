/**
 * Backend Server - Express.js API server
 */

require('dotenv').config();

// Fail fast if required environment variables are missing
const requiredEnv = [
  'DATABASE_URL',
  'DATAVERSE_ENVIRONMENT_URL',
  'DATAVERSE_CLIENT_ID',
  'DATAVERSE_CLIENT_SECRET',
  'DATAVERSE_TENANT_ID'
];

requiredEnv.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`CRITICAL CONFIG ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Process-level crash handlers
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const activityLoggerMiddleware = require('./src/middleware/activityLogger');
const ehrRoutes = require('./src/routes/ehrRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const labRoutes = require('./src/routes/labRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const patientPortalRoutes = require('./src/routes/patientPortalRoutes');
const intakeRoutes = require('./src/routes/intakeRoutes');
const vitalsRoutes = require('./src/routes/vitalsRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const organizationRoutes = require('./src/routes/organizationRoutes');
const authRoutes = require('./src/routes/authRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const db = require('./src/config/db');

// Test database connection on startup
db.query('SELECT NOW()')
  .then(() => console.log('✓ Connected to PostgreSQL database successfully.'))
  .catch(err => console.error('✗ Failed to connect to PostgreSQL database:', err.message));

const PORT = process.env.PORT || 5000;

// CORS origin checking from env
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(activityLoggerMiddleware);

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint (load-balancer check)
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        return res.json({
            status: 'UP',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: 'DOWN',
            database: 'disconnected',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes
app.use('/api/ehr', ehrRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/patient', patientPortalRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/clinical-notes', clinicalNoteRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/webhooks', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'POST /api/ehr/upload',
            'POST /api/ehr/register-user',
            'GET /api/ehr/view',
            'GET /api/ehr/details',
            'POST /api/ehr/grant-access',
            'POST /api/ehr/revoke-access',
            'GET /api/ehr/history',
            'GET /api/ehr/patient-records'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   SegueEMR Backend Server                              ║
║   Status: RUNNING                                 ║
║   Port: ${PORT}                                      ║
║   API Base: http://localhost:${PORT}/api/ehr         ║
╚═══════════════════════════════════════════════════╝
    `);
});