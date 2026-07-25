const express = require('express');
const multer = require('multer');
const patientController = require('../controllers/patientPortalController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Allergies ---
router.get('/allergies', patientController.getAllergies);
router.post('/allergies', patientController.addAllergy);

// --- Problems ---
router.get('/problems', patientController.getProblems);
router.post('/problems', patientController.addProblem);

// --- Refills ---
router.get('/refills', patientController.listRefillRequests);
router.post('/refills', patientController.requestRefill);

// --- Dynamic intake forms ---
router.get('/forms', patientController.getPatientForms);
router.post('/forms', patientController.submitPatientForm);

// --- Messaging ---
router.get('/messages', patientController.getMessages);
router.post('/messages', patientController.sendMessage);

// --- API Keys ---
router.get('/api-keys', patientController.getApiKeys);
router.post('/api-keys', patientController.generateApiKey);

// --- CCDA import/export ---
router.get('/ccda/export/:patientId', patientController.exportCCDA);
router.post('/ccda/import', upload.single('file'), patientController.importCCDA);

module.exports = router;
