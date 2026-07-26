const express = require('express');
const medicineController = require('../controllers/medicineController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// @route   POST /api/medicines
// @desc    Add or update medicine in inventory
router.post('/', requireRole('pharmacist', 'admin_staff', 'admin'), medicineController.createOrUpdateMedicine);

// @route   GET /api/medicines
// @desc    List all medicines
router.get('/', requireRole('pharmacist', 'doctor', 'nurse', 'receptionist', 'admin_staff', 'admin'), medicineController.listMedicines);

module.exports = router;
