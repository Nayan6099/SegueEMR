const express = require('express');
const intakeController = require('../controllers/intakeController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// Patient sub-resource routes
router.post('/patients/register', requireRole('receptionist', 'nurse', 'doctor'), intakeController.registerPatient);
router.get('/patients/search', requireRole('receptionist', 'nurse', 'doctor'), intakeController.searchPatients);

router.post('/', requireRole('receptionist', 'nurse', 'doctor', 'patient'), intakeController.createIntake);
router.get('/', requireRole('receptionist', 'nurse', 'doctor'), intakeController.getIntakes);
router.put('/:id', requireRole('receptionist', 'nurse', 'doctor'), intakeController.updateIntake);
router.put('/:id/status', requireRole('receptionist', 'nurse', 'doctor'), intakeController.updateIntakeStatus);
router.get('/:id/history', requireRole('admin_staff', 'admin'), intakeController.getAuditHistory);

module.exports = router;

