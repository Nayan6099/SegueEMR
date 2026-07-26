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
    const { userId, email, password } = req.body;
    const loginIdentifier = userId || email;

    if (!loginIdentifier || !password) {
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
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid username/email or password'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
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
