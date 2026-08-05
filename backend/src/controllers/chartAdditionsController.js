const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class ChartAdditionsController {
  // --- Office Notes ---
  async getOfficeNotes(req, res, next) {
    try {
      const { patientId } = req.params;
      const notes = await prisma.officeNote.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: notes });
    } catch (error) {
      next(error);
    }
  }

  async addOfficeNote(req, res, next) {
    try {
      const { patientId } = req.params;
      const { authorId, authorName, content } = req.body;
      const note = await prisma.officeNote.create({
        data: { id: crypto.randomUUID(), patientId, authorId, authorName, content }
      });
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  // --- Patient Education ---
  async getPatientEducation(req, res, next) {
    try {
      const { patientId } = req.params;
      const edu = await prisma.patientEducation.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: edu });
    } catch (error) {
      next(error);
    }
  }

  async addPatientEducation(req, res, next) {
    try {
      const { patientId } = req.params;
      const { authorId, authorName, title, content } = req.body;
      const edu = await prisma.patientEducation.create({
        data: { id: crypto.randomUUID(), patientId, authorId, authorName, title, content }
      });
      res.status(201).json({ success: true, data: edu });
    } catch (error) {
      next(error);
    }
  }

  // --- Authorizations ---
  async getAuthorizations(req, res, next) {
    try {
      const { patientId } = req.params;
      const auths = await prisma.authorization.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: auths });
    } catch (error) {
      next(error);
    }
  }

  async addAuthorization(req, res, next) {
    try {
      const { patientId } = req.params;
      const { authorId, authorName, requestedItem, payer } = req.body;
      const auth = await prisma.authorization.create({
        data: { id: crypto.randomUUID(), patientId, authorId, authorName, requestedItem, payer }
      });
      res.status(201).json({ success: true, data: auth });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChartAdditionsController();
