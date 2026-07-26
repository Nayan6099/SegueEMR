const express = require('express');
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// @route   POST /api/clinical-notes
// @desc    Create or update SOAP clinical note (Doctor)
router.post('/', requireRole('doctor'), clinicalNoteController.createClinicalNote);

// @route   GET /api/clinical-notes/appointment/:appointmentId
// @desc    Get clinical note details by appointmentId
router.get('/appointment/:appointmentId', requireRole('doctor', 'patient', 'nurse'), clinicalNoteController.getNoteByAppointment);

// @route   GET /api/clinical-notes
// @desc    List clinical notes, optionally filter by patientId
router.get('/', requireRole('doctor', 'patient', 'nurse'), clinicalNoteController.listClinicalNotes);

module.exports = router;
