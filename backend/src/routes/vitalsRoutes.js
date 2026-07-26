/**
 * Vitals Routes
 */

const express = require('express');
const vitalsController = require('../controllers/vitalsController');

const router = express.Router();

// @route   POST /api/vitals
// @desc    Record patient vitals (Nurse / Clinical staff)
router.post('/', vitalsController.createVitals);

// @route   GET /api/vitals
// @desc    List vitals, optionally filter by patientId
router.get('/', vitalsController.listVitals);

module.exports = router;
