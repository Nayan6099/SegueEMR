const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const ehrController = require('../controllers/ehrController');
const prisma = require('../config/prisma');
const dataverseService = require('../services/dataverseService');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

router.post('/upload', requireAuth, requireRole('doctor', 'patient'), upload.single('file'), ehrController.uploadEHR);
router.get('/view', requireAuth, ehrController.viewEHR);
router.get('/details', requireAuth, ehrController.getRecordDetails);
router.post('/grant-access', requireAuth, requireRole('patient'), ehrController.grantAccess);
router.post('/revoke-access', requireAuth, requireRole('patient'), ehrController.revokeAccess);
router.get('/history', requireAuth, requireRole('admin_staff', 'admin', 'patient'), ehrController.getAccessHistory);
router.get('/patient-records', requireAuth, requireRole('patient', 'doctor'), ehrController.listPatientRecords);

router.post('/register-user', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { userId, name, orgName, role, password, metadata } = req.body;

    if (!userId || !name || !orgName || !role || !password) {
      return res.status(400).json({ error: 'userId, name, orgName, role, and password are required' });
    }

    const existingLocal = await prisma.user.findUnique({ where: { id: userId } });
    if (existingLocal) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: userId,
        username: userId,
        passwordHash: passwordHash,
        email: `${userId}@example.com`,
        role: role,
        fullName: name,
        status: 'active'
      }
    });

    let patient = null;
    let doctor = null;

    if (role === 'patient') {
      patient = await prisma.patient.create({
        data: {
          id: userId,
          userId: userId,
          name: name,
          dateOfBirth: new Date(metadata?.dateOfBirth || '1990-01-01'),
          gender: metadata?.gender || 'Other',
          phone: metadata?.phone || null,
          address: metadata?.address || null
        }
      });
    } else if (role === 'doctor') {
      doctor = await prisma.doctor.create({
        data: {
          id: userId,
          userId: userId,
          name: name,
          specialization: metadata?.specialization || 'General Medicine',
          licenseNumber: metadata?.licenseNumber || `LIC-${userId}`
        }
      });
    }

    // Sync to Dataverse asynchronously (fire-and-forget)
    dataverseService.syncUserToDataverse(user).catch(e => console.error('Dataverse user sync failed:', e.message));
    if (patient) {
      dataverseService.syncPatientToDataverse(patient).catch(e => console.error('Dataverse patient sync failed:', e.message));
    }
    if (doctor) {
      dataverseService.syncDoctorToDataverse(doctor).catch(e => console.error('Dataverse doctor sync failed:', e.message));
    }

    res.status(201).json({ message: 'User registered successfully', user: { userId, name, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete/:recordId', requireAuth, requireRole('doctor', 'patient', 'admin'), async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const record = await prisma.eHRMetadata.findUnique({
      where: { recordId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Ownership check
    let isOwner = false;
    if (role === 'admin') {
      isOwner = true;
    } else if (role === 'patient') {
      isOwner = (record.patientId === userId);
    } else if (role === 'doctor') {
      isOwner = (record.doctorId === userId);
    }

    if (!isOwner) {
      return res.status(403).json({ error: 'Access Denied: You do not own this record' });
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
