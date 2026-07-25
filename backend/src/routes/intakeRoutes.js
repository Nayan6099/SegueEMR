const express = require('express');
const intakeController = require('../controllers/intakeController');

const router = express.Router();

router.post('/', intakeController.createIntake);
router.get('/', intakeController.getIntakes);
router.put('/:id', intakeController.updateIntake);
router.put('/:id/status', intakeController.updateIntakeStatus);
router.get('/:id/history', intakeController.getAuditHistory);

module.exports = router;
