/**
 * Authentication Routes
 *
 * POST /api/auth/login  — Authenticate and return JWT
 *
 * Security notes:
 * - Demo bypass is ONLY available when DEMO_MODE=true in environment (never in production)
 * - Debug console.log statements removed — use logger instead
 * - Raw error messages never sent to client
 * - JWT_SECRET length enforced at server startup (server.js)
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const prisma  = require('../config/prisma');
const logger  = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../utils/errors');
const { assertRequired } = require('../utils/validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const DEMO_MODE  = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

if (DEMO_MODE) {
  logger.warn('[AUTH] DEMO_MODE is enabled — bypass login is active. Disable for production.');
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public (rate-limited by authLimiter in server.js)
 */
router.post('/login', async (req, res, next) => {
  try {
    const { userId, email, password, role } = req.body;
    const loginIdentifier = (userId || email || '').trim();

    // ── DEMO BYPASS ─────────────────────────────────────────────────────────
    // Only active when DEMO_MODE=true is set AND we are NOT in production.
    if (DEMO_MODE && password === 'demo') {
      const bypassRole = role || 'receptionist';

      // Resolve against real DB records when possible for FK safety
      let demoPatientId = null;
      let demoDoctorId  = null;

      if (bypassRole === 'patient') {
        let pat = await prisma.patient.findUnique({ where: { id: loginIdentifier } })
          || await prisma.patient.findFirst({ where: { userId: loginIdentifier } })
          || await prisma.patient.findFirst({ where: { name: { equals: loginIdentifier, mode: 'insensitive' } } });
        
        // If patient record found but userId not linked, link it now if the user exists
        if (pat && !pat.userId) {
          try {
            const userExists = await prisma.user.findUnique({ where: { id: loginIdentifier } });
            if (userExists) {
              await prisma.patient.update({ where: { id: pat.id }, data: { userId: loginIdentifier } });
              logger.info('[AUTH] Linked patient record to userId', { patientId: pat.id, userId: loginIdentifier });
            }
          } catch (e) {
            logger.warn('[AUTH] Could not link patient userId', { error: e.message });
          }
        }
        demoPatientId = pat?.id || loginIdentifier;
      } else if (bypassRole === 'doctor') {
        const doc = await prisma.doctor.findUnique({ where: { id: loginIdentifier } })
          || await prisma.doctor.findUnique({ where: { userId: loginIdentifier } })
          || await prisma.doctor.findFirst({ where: { name: { equals: loginIdentifier, mode: 'insensitive' } } });
        demoDoctorId = doc?.id || null;
      }

      const demoUser = {
        userId:    loginIdentifier || 'demo_user',
        username:  loginIdentifier || 'demo_user',
        email:     `${loginIdentifier || 'demo'}@segueemr.local`,
        role:      bypassRole,
        fullName:  `Demo ${bypassRole.charAt(0).toUpperCase() + bypassRole.slice(1)}`,
        patientId: demoPatientId,
        doctorId:  demoDoctorId,
        orgName:   bypassRole === 'patient' ? 'patient' : 'hospital',
      };

      logger.info('[AUTH] Demo login', { userId: demoUser.userId, role: demoUser.role });

      const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, message: 'Demo login successful', token, user: demoUser });
    }
    // ── END DEMO BYPASS ──────────────────────────────────────────────────────

    // Validate required fields
    assertRequired(['password'], req.body);
    if (!loginIdentifier) {
      throw new AppError(ERROR_CODES.MISSING_FIELDS, 'Username or email is required');
    }

    // Look up user (by id, username, or email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id:       loginIdentifier },
          { username: loginIdentifier },
          { email:    loginIdentifier },
          { fullName: { equals: loginIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      // Use same message for "not found" and "wrong password" to prevent user enumeration
      throw new AppError(ERROR_CODES.AUTH_FAILED, `User not found: ${loginIdentifier}`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(ERROR_CODES.AUTH_FAILED, `Bad password for user: ${user.id}`);
    }

    // Resolve FK identifiers for the JWT payload
    let patientId = null;
    let doctorId  = null;

    if (user.role === 'patient') {
      let patient = await prisma.patient.findFirst({ where: { userId: user.id } })
        || await prisma.patient.findUnique({ where: { id: user.id } });
      // If patient found but userId not linked, link it now
      if (patient && !patient.userId) {
        try {
          await prisma.patient.update({ where: { id: patient.id }, data: { userId: user.id } });
          logger.info('[AUTH] Linked patient record to userId on login', { patientId: patient.id, userId: user.id });
        } catch (e) {
          logger.warn('[AUTH] Could not link patient userId on login', { error: e.message });
        }
      }
      patientId = patient?.id || null;
    } else if (user.role === 'doctor') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
      doctorId = doctor?.id || null;
    }

    const payload = {
      userId:   user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
      fullName: user.fullName,
      status:   user.status,
      patientId,
      doctorId,
      orgName:  user.role === 'patient' ? 'patient' : 'hospital',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    logger.info('[AUTH] Login successful', { userId: user.id, role: user.role });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: payload,
    });

  } catch (err) {
    next(err); // Delegates to global errorHandler
  }
});

module.exports = router;