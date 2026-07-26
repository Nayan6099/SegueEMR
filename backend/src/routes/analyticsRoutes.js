const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// @route   GET /api/analytics/overview
// @desc    Organization-wide operational metrics (Healthcare Management Teams)
router.get('/overview', requireRole('management', 'admin'), analyticsController.getOverview);

module.exports = router;
