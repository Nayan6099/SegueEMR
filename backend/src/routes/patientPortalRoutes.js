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

// --- Messaging ---
router.get('/messages', patientController.getMessages);
router.post('/messages', requireRole('patient', 'doctor', 'nurse', 'receptionist'), patientController.sendMessage);

// --- API Keys ---
router.get('/api-keys', patientController.getApiKeys);
router.post('/api-keys', requireRole('patient'), patientController.generateApiKey);

// --- CCDA import/export ---
router.get('/ccda/export/:patientId', requireRole('doctor', 'patient'), patientController.exportCCDA);
router.post('/ccda/import', requireRole('doctor', 'patient'), upload.single('file'), patientController.importCCDA);

module.exports = router;
