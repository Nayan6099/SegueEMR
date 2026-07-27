const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 */
router.post('/login', async (req, res) => {
  try {
    console.log('[Auth Debug] Login request received body:', req.body);
    // Note: extracted `role` to support the frontend dropdown selection
    const { userId, email, password, role } = req.body;
    const loginIdentifier = (userId || email || '').trim();

    // --- DEMO BYPASS START ---
    if (password === 'demo') {
      const bypassRole = role || 'receptionist'; // Fallback if missing

      const demoUser = {
        userId: loginIdentifier || 'demo_user',
        username: loginIdentifier || 'demo_user',
        email: `${loginIdentifier || 'demo'}@segueemr.local`,
        role: bypassRole,
        fullName: `Demo ${bypassRole.toUpperCase()}`,
        patientId: bypassRole === 'patient' ? `PT-${loginIdentifier.replace(/\s+/g, '').toLowerCase()}` : null,
        doctorId: bypassRole === 'doctor' ? `DR-${loginIdentifier.replace(/\s+/g, '').toLowerCase()}` : null,
        orgName: bypassRole === 'patient' ? 'patient' : 'hospital'
      };

      console.log(`[DEMO MODE] Bypassing auth for ${demoUser.username} as ${demoUser.role}`);

      const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '24h' });

      return res.json({
        success: true,
        message: 'Demo login successful',
        token,
        user: demoUser
      });
    }
    // --- DEMO BYPASS END ---

    if (!loginIdentifier || !password) {
      console.log('[Auth Debug] Missing credentials:', { loginIdentifier, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Username/Email and Password are required'
      });
    }

    // Lookup user in DB
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: loginIdentifier },
          { username: loginIdentifier },
          { email: loginIdentifier }
        ]
      }
    });

    if (!user) {
      console.log('[Auth Debug] User lookup failed for:', loginIdentifier);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username/email or password'
      });
    }

    console.log('[Auth Debug] User found in DB:', { id: user.id, username: user.username, role: user.role });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('[Auth Debug] Bcrypt password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username/email or password'
      });
    }

    // Fetch related identifiers for authorization convenience
    let patientId = null;
    let doctorId = null;

    if (user.role === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id }
      });
      if (patient) {
        patientId = patient.id;
      }
    } else if (user.role === 'doctor') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user.id }
      });
      if (doctor) {
        doctorId = doctor.id;
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        patientId,
        doctorId,
        orgName: user.role === 'patient' ? 'patient' : 'hospital'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        patientId,
        doctorId,
        orgName: user.role === 'patient' ? 'patient' : 'hospital'
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message
    });
  }
});

module.exports = router;