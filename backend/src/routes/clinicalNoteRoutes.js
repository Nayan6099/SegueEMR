/**
 * ClinicalNote Routes
 */

const express = require('express');
const clinicalNoteController = require('../controllers/clinicalNoteController');

const router = express.Router();

// @route   POST /api/clinical-notes
// @desc    Create or update SOAP clinical note (Doctor)
router.post('/', clinicalNoteController.createClinicalNote);

// @route   GET /api/clinical-notes/appointment/:appointmentId
// @desc    Get clinical note details by appointmentId
router.get('/appointment/:appointmentId', clinicalNoteController.getNoteByAppointment);

// @route   GET /api/clinical-notes
// @desc    List clinical notes, optionally filter by patientId
router.get('/', clinicalNoteController.listClinicalNotes);

module.exports = router;
