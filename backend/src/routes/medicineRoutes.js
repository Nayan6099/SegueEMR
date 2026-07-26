/**
 * Medicine Routes
 */

const express = require('express');
const medicineController = require('../controllers/medicineController');

const router = express.Router();

// @route   POST /api/medicines
// @desc    Add or update medicine in inventory
router.post('/', medicineController.createOrUpdateMedicine);

// @route   GET /api/medicines
// @desc    List all medicines
router.get('/', medicineController.listMedicines);

module.exports = router;
