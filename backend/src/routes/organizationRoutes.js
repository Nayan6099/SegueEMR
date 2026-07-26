const express = require('express');
const organizationController = require('../controllers/organizationController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// @route   GET /api/organization
router.get('/', organizationController.getOrgDetails);

// @route   POST /api/organization/department
router.post('/department', requireRole('management', 'admin'), organizationController.addOrgDepartment);

// @route   POST /api/organization/access-rules
router.post('/access-rules', requireRole('management', 'admin'), organizationController.updateAccessRules);

module.exports = router;
