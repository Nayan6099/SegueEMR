const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Schedule a new appointment (Receptionist / Doctor / Patient)
router.post('/', requireAuth, requireRole('receptionist', 'doctor', 'patient'), appointmentController.createAppointment);

// @route   GET /api/appointments
// @desc    List appointments, filter by doctorId/patientId/status/from/to
router.get('/', requireAuth, appointmentController.listAppointments);

// @route   GET /api/appointments/available-slots
// @desc    Get available slots for a doctor on a specific date
router.get('/available-slots', requireAuth, appointmentController.getAvailableSlots);

// @route   PUT /api/appointments/:appointmentId
// @desc    Reschedule / update status / add notes
router.put('/:appointmentId', requireAuth, requireRole('receptionist', 'doctor', 'nurse'), appointmentController.updateAppointment);

// @route   DELETE /api/appointments/:appointmentId
// @desc    Cancel an appointment
router.delete('/:appointmentId', requireAuth, requireRole('receptionist', 'doctor', 'patient'), appointmentController.cancelAppointment);

module.exports = router;
