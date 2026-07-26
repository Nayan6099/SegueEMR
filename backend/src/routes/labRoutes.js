const express = require('express');
const labController = require('../controllers/labController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/lab/orders
// @desc    Order a lab test (Doctor)
router.post('/orders', requireAuth, requireRole('doctor'), labController.createLabOrder);

// @route   GET /api/lab/orders
// @desc    List lab orders, filter by patientId/doctorId/status
router.get('/orders', requireAuth, requireRole('doctor', 'lab_technician', 'patient', 'nurse'), labController.listLabOrders);

// @route   PUT /api/lab/orders/:labOrderId/status
// @desc    Update sample/test status (Lab Technician)
router.put('/orders/:labOrderId/status', requireAuth, requireRole('lab_technician'), labController.updateLabOrderStatus);

// @route   PUT /api/lab/orders/:labOrderId/result
// @desc    Upload result and mark completed (Lab Technician)
router.put('/orders/:labOrderId/result', requireAuth, requireRole('lab_technician'), labController.uploadResult);

module.exports = router;
