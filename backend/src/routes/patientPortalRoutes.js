const express = require('express');
const multer = require('multer');
const patientController = require('../controllers/patientPortalController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply requireAuth to all endpoints in this router
router.use(requireAuth);

// --- Allergies ---
router.get('/allergies', patientController.getAllergies);
router.post('/allergies', requireRole('patient', 'doctor'), patientController.addAllergy);

// --- Problems ---
router.get('/problems', patientController.getProblems);
router.post('/problems', requireRole('patient', 'doctor'), patientController.addProblem);

// --- Refills ---
router.get('/refills', patientController.listRefillRequests);
router.post('/refills', requireRole('patient'), patientController.requestRefill);

// --- Dynamic intake forms ---
router.get('/forms', patientController.getPatientForms);
router.post('/forms', requireRole('patient'), patientController.submitPatientForm);
router.patch('/forms/:id/status', requireRole('doctor', 'receptionist', 'admin_staff', 'admin'), patientController.updateFormStatus);

// --- Messaging ---
router.get('/messages', patientController.getMessages);
router.post('/messages', requireRole('patient', 'doctor', 'nurse', 'receptionist'), patientController.sendMessage);
router.post('/messages/read', requireRole('patient', 'doctor', 'nurse', 'receptionist'), patientController.readMessages);

// --- API Keys ---
router.get('/api-keys', patientController.getApiKeys);
router.post('/api-keys', requireRole('patient'), patientController.generateApiKey);

// --- CCDA import/export ---
router.get('/ccda/export/:patientId', requireRole('doctor', 'patient'), patientController.exportCCDA);
router.post('/ccda/import', requireRole('doctor', 'patient'), upload.single('file'), patientController.importCCDA);

// --- Portal Permission Settings ---
// GET: patient reads their own allow_self_entry flag
router.get('/settings', requireRole('patient'), patientController.getPortalSettings);
// PATCH: staff (doctor / receptionist / admin) toggles a patient's allow_self_entry
router.patch('/settings', requireRole('doctor', 'receptionist', 'admin_staff'), patientController.updatePortalSettings);

module.exports = router;
