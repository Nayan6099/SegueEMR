/**
 * Recall Controller
 * Manages follow-up recalls — patients needing contact/appointment
 * but where no appointment has been scheduled yet.
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const VALID_RECALL_STATUSES = new Set(['pending', 'contacted', 'completed', 'cancelled']);

class RecallController {
  /**
   * POST /api/recalls
   * Create a new recall. Doctor only.
   */
  async createRecall(req, res) {
    try {
      const { patientId, patientName, reason, dueDate, notes } = req.body;

      if (!patientId || !patientName || !reason || !dueDate) {
        return res.status(400).json({ success: false, error: 'patientId, patientName, reason, and dueDate are required.' });
      }

      const doctorId = req.user.doctorId || req.user.userId;

      const recall = await prisma.recall.create({
        data: {
          id:          crypto.randomUUID(),
          patientId,
          patientName,
          doctorId,
          reason,
          dueDate:     new Date(dueDate),
          notes:       notes || null,
          status:      'pending',
        },
      });

      return res.status(201).json({ success: true, data: recall });
    } catch (err) {
      console.error('[RecallController.createRecall]', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create recall.' });
    }
  }

  /**
   * GET /api/recalls
   * List recalls, filtered by doctorId, status, and optional date range.
   * Query params: doctorId?, status?, from?, to?
   */
  async listRecalls(req, res) {
    try {
      const { doctorId, status, from, to } = req.query;

      const where = {};

      // Doctors can only see their own recalls; staff can see any
      if (req.user.role === 'doctor') {
        where.doctorId = req.user.doctorId || req.user.userId;
      } else if (doctorId) {
        where.doctorId = doctorId;
      }

      if (status && VALID_RECALL_STATUSES.has(status)) {
        where.status = status;
      }

      if (from || to) {
        where.dueDate = {};
        if (from) where.dueDate.gte = new Date(from);
        if (to)   where.dueDate.lte = new Date(to);
      }

      const recalls = await prisma.recall.findMany({
        where,
        orderBy: { dueDate: 'asc' },
      });

      return res.json({ success: true, data: recalls, count: recalls.length });
    } catch (err) {
      console.error('[RecallController.listRecalls]', err.message);
      return res.status(500).json({ success: false, error: 'Failed to list recalls.' });
    }
  }

  /**
   * PUT /api/recalls/:id/status
   * Update the status of a recall.
   * Body: { status: 'pending' | 'contacted' | 'completed' | 'cancelled', notes? }
   */
  async updateRecallStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status || !VALID_RECALL_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${[...VALID_RECALL_STATUSES].join(', ')}.`,
        });
      }

      const existing = await prisma.recall.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Recall not found.' });
      }

      // Doctors can only update their own recalls
      if (req.user.role === 'doctor') {
        const ownerId = req.user.doctorId || req.user.userId;
        if (existing.doctorId !== ownerId) {
          return res.status(403).json({ success: false, error: 'You can only update your own recalls.' });
        }
      }

      const updated = await prisma.recall.update({
        where: { id },
        data: {
          status,
          ...(notes !== undefined && { notes }),
        },
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[RecallController.updateRecallStatus]', err.message);
      return res.status(500).json({ success: false, error: 'Failed to update recall.' });
    }
  }
}

module.exports = new RecallController();
