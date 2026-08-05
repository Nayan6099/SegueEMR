const express = require('express');
const recallController = require('../controllers/recallController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Create a new recall (doctor only)
router.post('/', requireRole('doctor'), recallController.createRecall);

// List recalls — doctor sees own, receptionist/admin can query by doctorId
router.get('/', requireRole('doctor', 'receptionist', 'admin_staff', 'admin'), recallController.listRecalls);

// Update recall status
router.put('/:id/status', requireRole('doctor', 'receptionist', 'admin_staff', 'admin'), recallController.updateRecallStatus);

module.exports = router;
