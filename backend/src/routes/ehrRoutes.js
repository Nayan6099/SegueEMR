const express = require('express');
const multer = require('multer');
const ehrController = require('../controllers/ehrController');
const prisma = require('../config/prisma');
const dataverseService = require('../services/dataverseService');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

router.post('/upload', upload.single('file'), ehrController.uploadEHR);
router.get('/view', ehrController.viewEHR);
router.get('/details', ehrController.getRecordDetails);
router.post('/grant-access', ehrController.grantAccess);
router.post('/revoke-access', ehrController.revokeAccess);
router.get('/history', ehrController.getAccessHistory);
router.get('/patient-records', ehrController.listPatientRecords);

router.post('/register-user', async (req, res) => {
  try {
    const { userId, name, orgName, role, metadata } = req.body;

    if (!userId || !name || !orgName || !role) {
      return res.status(400).json({ error: 'userId, name, orgName, and role are required' });
    }

    const existing = await dataverseService.findUser(userId);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = await dataverseService.createUser({
      userId,
      name,
      orgName,
      role,
      status: 'active',
      metadata: metadata || {}
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { userId, orgName } = req.query;

    if (!userId || !orgName) {
      return res.status(400).json({ error: 'userId and orgName are required' });
    }

    const record = await prisma.eHRMetadata.findUnique({
      where: { recordId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    await prisma.eHRMetadata.update({
      where: { recordId },
      data: {
        metadata: JSON.stringify({ status: 'deleted', deletedAt: new Date(), deletedBy: userId })
      }
    });

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
