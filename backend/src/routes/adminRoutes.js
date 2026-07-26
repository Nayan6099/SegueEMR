/**
 * Admin Routes
 */

const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/analytics', adminController.getUsageAnalytics);
router.get('/system/health', adminController.getSystemHealth);

// Activity Logs
router.get('/activity-logs', adminController.getActivityLogs);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/status', adminController.updateUserStatus);

// Record Management
router.get('/records', adminController.getAllRecords);
router.delete('/records/:recordId', adminController.deleteRecord);

// Permission Management
router.post('/permissions/revoke', adminController.forceRevokeAccess);

// Bulk Export CSV
router.get('/export/:resource', adminController.exportCSV);

// Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSetting);

module.exports = router;