const express = require('express');
const vitalsController = require('../controllers/vitalsController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// @route   POST /api/vitals
// @desc    Record patient vitals (Nurse / Doctor)
router.post('/', requireRole('nurse', 'doctor'), vitalsController.createVitals);

// @route   GET /api/vitals
// @desc    List vitals, optionally filter by patientId
router.get('/', requireRole('nurse', 'doctor', 'patient'), vitalsController.listVitals);

module.exports = router;
