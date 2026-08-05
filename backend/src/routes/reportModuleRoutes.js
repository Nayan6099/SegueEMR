const express = require('express');
const router = express.Router();
const reportModuleController = require('../controllers/reportModuleController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/patients', requireAuth, requireRole('doctor', 'admin'), reportModuleController.getPatientReport);
router.get('/clinical-summary', requireAuth, requireRole('doctor', 'admin'), reportModuleController.getClinicalSummary);

module.exports = router;
