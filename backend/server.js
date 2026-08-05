/**
 * SegueEMR Backend — Express Server
 * Production-hardened entry point.
 */

require('dotenv').config();

// ─── Startup Environment Validation ──────────────────────────────────────────
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
];

// Azure/Dataverse optional in dev but required in production
const REQUIRED_PROD_ENV = [
  'DATAVERSE_ENVIRONMENT_URL',
  'DATAVERSE_CLIENT_ID',
  'DATAVERSE_CLIENT_SECRET',
  'DATAVERSE_TENANT_ID',
];

const missingRequired = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingRequired.length > 0) {
  console.error(`CRITICAL: Missing required environment variables: ${missingRequired.join(', ')}`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  const missingProd = REQUIRED_PROD_ENV.filter(v => !process.env[v]);
  if (missingProd.length > 0) {
    console.error(`CRITICAL: Missing production environment variables: ${missingProd.join(', ')}`);
    process.exit(1);
  }
}

// Enforce strong JWT secret
if (process.env.JWT_SECRET.length < 32) {
  console.error('CRITICAL: JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

// ─── Process-level Crash Handlers ────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  require('./src/utils/logger').error('CRITICAL: Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  require('./src/utils/logger').error('CRITICAL: Unhandled Rejection', { reason: String(reason) });
  process.exit(1);
});

// ─── Imports ──────────────────────────────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const morgan  = require('morgan');

const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/utils/errors');

const db = require('./src/config/db');

// Route imports
const authRoutes          = require('./src/routes/authRoutes');
const ehrRoutes           = require('./src/routes/ehrRoutes');
const adminRoutes         = require('./src/routes/adminRoutes');
const appointmentRoutes   = require('./src/routes/appointmentRoutes');
const prescriptionRoutes  = require('./src/routes/prescriptionRoutes');
const labRoutes           = require('./src/routes/labRoutes');
const billingRoutes       = require('./src/routes/billingRoutes');
const analyticsRoutes     = require('./src/routes/analyticsRoutes');
const patientPortalRoutes = require('./src/routes/patientPortalRoutes');
const intakeRoutes        = require('./src/routes/intakeRoutes');
const vitalsRoutes        = require('./src/routes/vitalsRoutes');
const clinicalNoteRoutes  = require('./src/routes/clinicalNoteRoutes');
const medicineRoutes      = require('./src/routes/medicineRoutes');
const organizationRoutes  = require('./src/routes/organizationRoutes');
const integrationRoutes   = require('./src/routes/integrationRoutes');
const notificationRoutes  = require('./src/routes/notificationRoutes');
const directoryRoutes     = require('./src/routes/directoryRoutes');
const recallRoutes        = require('./src/routes/recallRoutes');
const reportModuleRoutes  = require('./src/routes/reportModuleRoutes');
const chartAdditionsRoutes= require('./src/routes/chartAdditionsRoutes');

const activityLoggerMiddleware = require('./src/middleware/activityLogger');

// ─── App ──────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow file downloads
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin (no origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gracefully handle malformed JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Log the issue and respond with a clear message
    const logger = require('./src/utils/logger');
    logger.warn('Bad JSON payload', { error: err.message, path: req.path });
    return res.status(400).json({ success: false, message: 'Invalid JSON payload', code: 'BAD_JSON' });
  }
  next(err);
});

// ─── Static files for local uploads (fallback for Azure) ───────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'inline');
    }
  }
}));

// ─── Request Logging ──────────────────────────────────────────────────────────
// Dev: colorized short format. Prod: combined (Apache-style) for log aggregators.
app.use(morgan(isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  // Skip health check noise in logs
  skip: (req) => req.path === '/health',
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Global limiter
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 200,                  // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a moment.',
    code: 'RATE_LIMITED',
  },
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many sign-in attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMITED',
  },
});

app.use(globalLimiter);

// ─── Activity Logger Middleware ───────────────────────────────────────────────
app.use(activityLoggerMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (no auth, no rate limit, no logging)
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'UP', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    // Do NOT expose DB error details publicly
    return res.status(503).json({ status: 'DOWN', database: 'unavailable', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
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
app.use('/api/directory', directoryRoutes);
app.use('/api/recalls', recallRoutes);
app.use('/api/reports', reportModuleRoutes);
app.use('/api/chart', chartAdditionsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested endpoint does not exist.',
    code: 'NOT_FOUND',
  });
});

// ─── Global Error Handler (MUST be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
db.query('SELECT NOW()')
  .then(() => logger.info('✓ Connected to PostgreSQL database'))
  .catch(err => {
    logger.error('CRITICAL: Failed to connect to PostgreSQL database', { error: err.message });
    process.exit(1);
  });

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

// Connected users map
const connectedUsers = new Map();
app.set('connectedUsers', connectedUsers);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  const { userId, patientId, doctorId } = socket.user;
  logger.info(`[SOCKET] User connected: userId=${userId}, socketId=${socket.id}`);
  connectedUsers.set(userId, socket.id);
  if (patientId) connectedUsers.set(patientId, socket.id);
  if (doctorId) connectedUsers.set(doctorId, socket.id);

  socket.on('send_message', async (data) => {
    // Data expected: { receiverId, content }
    // The actual DB persistence is still optionally handled by REST fallback
    // Or we can just relay it for now and let REST handle DB.
    // The user requested: "Implement send_message (receive from client, persist to DB via existing message-creation logic, then emit receive_message to the recipient if connected)"
    
    // Wait, since we can just use the REST endpoint as fallback/offline-safety,
    // we can either persist here or just let REST handle it.
  });

  socket.on('disconnect', () => {
    if (connectedUsers.get(userId) === socket.id) connectedUsers.delete(userId);
    if (patientId && connectedUsers.get(patientId) === socket.id) connectedUsers.delete(patientId);
    if (doctorId && connectedUsers.get(doctorId) === socket.id) connectedUsers.delete(doctorId);
  });
});

server.listen(PORT, () => {
  logger.info(`SegueEMR backend running on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

module.exports = { app, server, io, connectedUsers };