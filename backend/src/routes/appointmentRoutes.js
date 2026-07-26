/**
 * Appointment Routes
 */

const express = require('express');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Schedule a new appointment (Receptionist)
router.post('/', appointmentController.createAppointment);

// @route   GET /api/appointments
// @desc    List appointments, filter by doctorId/patientId/status/from/to
router.get('/', appointmentController.listAppointments);

// @route   GET /api/appointments/available-slots
// @desc    Get available slots for a doctor on a specific date
router.get('/available-slots', appointmentController.getAvailableSlots);

// @route   PUT /api/appointments/:appointmentId
// @desc    Reschedule / update status / add notes
router.put('/:appointmentId', appointmentController.updateAppointment);

// @route   DELETE /api/appointments/:appointmentId
// @desc    Cancel an appointment
router.delete('/:appointmentId', appointmentController.cancelAppointment);

module.exports = router;
