const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/prescriptions
// @desc    Issue a new prescription (Doctor)
router.post('/', requireAuth, requireRole('doctor'), prescriptionController.createPrescription);

// @route   GET /api/prescriptions
// @desc    List prescriptions, filter by patientId/doctorId/status
router.get('/', requireAuth, requireRole('doctor', 'patient', 'pharmacist', 'nurse'), prescriptionController.listPrescriptions);

// @route   PUT /api/prescriptions/:prescriptionId/dispense
// @desc    Mark a prescription as dispensed (Pharmacist)
router.put('/:prescriptionId/dispense', requireAuth, requireRole('pharmacist'), prescriptionController.dispensePrescription);

module.exports = router;
