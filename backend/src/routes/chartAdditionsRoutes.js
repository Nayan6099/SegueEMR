const express = require('express');
const router = express.Router();
const chartAdditionsController = require('../controllers/chartAdditionsController');

router.get('/office-notes/:patientId', chartAdditionsController.getOfficeNotes);
router.post('/office-notes/:patientId', chartAdditionsController.addOfficeNote);

router.get('/education/:patientId', chartAdditionsController.getPatientEducation);
router.post('/education/:patientId', chartAdditionsController.addPatientEducation);

router.get('/authorizations/:patientId', chartAdditionsController.getAuthorizations);
router.post('/authorizations/:patientId', chartAdditionsController.addAuthorization);

module.exports = router;
