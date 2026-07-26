/**
 * Organization Routes
 */

const express = require('express');
const organizationController = require('../controllers/organizationController');

const router = express.Router();

// @route   GET /api/organization
router.get('/', organizationController.getOrgDetails);

// @route   POST /api/organization/department
router.post('/department', organizationController.addOrgDepartment);

// @route   POST /api/organization/access-rules
router.post('/access-rules', organizationController.updateAccessRules);

module.exports = router;
