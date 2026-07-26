const express = require('express');
const intakeController = require('../controllers/intakeController');

const router = express.Router();

// Patient sub-resource routes (must come before /:id param routes)
router.post('/patients/register', intakeController.registerPatient);
router.get('/patients/search', intakeController.searchPatients);

router.post('/', intakeController.createIntake);
router.get('/', intakeController.getIntakes);
router.put('/:id', intakeController.updateIntake);
router.put('/:id/status', intakeController.updateIntakeStatus);
router.get('/:id/history', intakeController.getAuditHistory);

module.exports = router;

