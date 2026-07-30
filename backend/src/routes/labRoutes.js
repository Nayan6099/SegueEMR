const express = require('express');
const multer = require('multer');
const labController = require('../controllers/labController');
const reportController = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

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

// @route   POST /api/lab/orders/:orderId/notify
// @desc    Notify doctor or patient about a completed lab order
router.post('/orders/:orderId/notify', requireAuth, requireRole('lab_technician', 'doctor'), labController.notifyLabOrderLegacy);
// New FHIR‑based notification endpoint
router.post('/orders/:orderId/notify-fhir', requireAuth, requireRole('lab_technician', 'doctor'), labController.notifyLabOrderFhir);
// @route   POST /api/lab/orders/:orderId/undo
// @desc    Undo completed status back to processing (Lab Technician)
router.post('/orders/:orderId/undo', requireAuth, requireRole('lab_technician'), labController.undoComplete);

router.get('/orders/doctor/reports', requireAuth, requireRole('doctor'), labController.getDoctorLabReports);
router.get('/reports/:id/print', requireAuth, requireRole('doctor', 'lab_technician', 'patient'), reportController.getPrintReport);

// New endpoints for PDF workflow
router.post('/orders/:id/report', requireAuth, requireRole('lab_technician', 'doctor'), upload.single('file'), labController.uploadPdfReport);
router.post('/orders/:id/send', requireAuth, requireRole('lab_technician', 'doctor'), labController.sendLabReport);
router.get('/reports/:id/download', requireAuth, requireRole('doctor', 'patient', 'lab_technician'), labController.downloadSecureReport);

module.exports = router;
