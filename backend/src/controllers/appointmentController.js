/**
 * Appointment Controller — Production hardened
 *
 * Fixes:
 * - Uses resolveDoctorId() to safely resolve FK before DB insert
 * - Uses assertRequired() for input validation
 * - Never exposes raw error messages to clients (delegates to errorHandler via next())
 * - activityLogger now receives role
 */

const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');
const fhirService = require('../services/fhirService');
const logger = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../utils/errors');
const { resolveDoctorId, resolvePatientId } = require('../utils/resolvers');
const { assertRequired } = require('../utils/validators');

const genId = () => `APT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

/**
 * Accepted appointment statuses. Add new values here to allow them
 * system-wide — the DB column is a plain String so this is the single
 * enforcement point in the API layer.
 */
const VALID_STATUSES = new Set([
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',    // Patient did not attend; added per OpenEMR parity
  'rescheduled',
]);

const mapAppointment = (apt) => {
  if (!apt) return null;
  return {
    id:            apt.id,
    appointmentId: apt.id,
    patientId:     apt.patientId,
    patientName:   apt.patientName,
    doctorId:      apt.doctorId,
    doctorName:    apt.doctorName,
    scheduledAt:   apt.scheduledTime,
    scheduledTime: apt.scheduledTime,
    status:        apt.status,
    reason:        apt.notes,
    notes:         apt.notes,
    hasClinicalNote: !!apt.clinicalNote,
    createdAt:     apt.createdAt,
    updatedAt:     apt.updatedAt,
  };
};

class AppointmentController {
  async createAppointment(req, res, next) {
    try {
      const {
        patientId, patientName,
        doctorId, doctorName,
        scheduledAt, scheduledTime,
        notes, status,
      } = req.body;

      assertRequired(['patientName'], req.body);

      const targetTime = scheduledAt || scheduledTime;
      if (!targetTime) {
        throw new AppError(ERROR_CODES.MISSING_FIELDS, 'scheduledTime is required');
      }

      // Determine effective patientId
      let finalPatientId = patientId;
      if (req.user?.role === 'patient') {
        finalPatientId = req.user.patientId || req.user.userId;
      }
      if (!finalPatientId) {
        throw new AppError(ERROR_CODES.MISSING_FIELDS, 'patientId is required');
      }

      // Determine effective doctorId — always resolve via DB to guarantee FK validity
      const rawDoctorId = (req.user?.role === 'doctor')
        ? (req.user.doctorId || req.user.userId)
        : (doctorId || 'DR-dr.smith');

      const doctorRecord = await resolveDoctorId(rawDoctorId);
      const patientRecord = await resolvePatientId(finalPatientId);

      const appointment = await prisma.appointment.create({
        data: {
          id:            genId(),
          patientId:     patientRecord.id,
          patientName:   patientRecord.name || patientName,
          doctorId:      doctorRecord.id,
          doctorName:    doctorName || doctorRecord.name || '',
          scheduledTime: new Date(targetTime),
          status:        status || 'scheduled',
          notes:         notes || '',
        },
      });

      logActivity('APPOINTMENT_CREATED', req.user?.userId, {
        appointmentId: appointment.id,
        patientId: finalPatientId,
        doctorId: doctorRecord.id,
      }, req.user?.role).catch(() => {});

      // FHIR sync — fire-and-forget, non-blocking
      fhirService.syncAppointment(appointment)
        .then(fhirRes => {
          if (fhirRes?.id) {
            prisma.appointment.update({
              where: { id: appointment.id },
              data: { fhirResourceId: fhirRes.id },
            }).catch(e => logger.error('[FHIR] Appointment fhirResourceId save failed', { error: e.message }));
          }
        })
        .catch(err => logger.error('[FHIR] Appointment sync failed', { error: err.message }));

      return res.status(201).json({ success: true, data: mapAppointment(appointment) });
    } catch (err) {
      next(err);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { scheduledAt, scheduledTime, status, notes } = req.body;

      const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
      if (!existing) {
        throw new AppError(ERROR_CODES.RECORD_NOT_FOUND, `Appointment ${appointmentId} not found`);
      }

      const data = {};
      if (status) {
        if (!VALID_STATUSES.has(status)) {
          throw new AppError(
            ERROR_CODES.VALIDATION_ERROR || 'VALIDATION_ERROR',
            `Invalid status '${status}'. Accepted values: ${[...VALID_STATUSES].join(', ')}`,
          );
        }
        data.status = status;
      }
      if (notes !== undefined)         data.notes  = notes;
      if (scheduledAt || scheduledTime) {
        data.scheduledTime = new Date(scheduledAt || scheduledTime);
      }

      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data,
      });

      logActivity('APPOINTMENT_UPDATED', req.user?.userId, { appointmentId, status }, req.user?.role).catch(() => {});

      return res.json({ success: true, data: mapAppointment(appointment) });
    } catch (err) {
      next(err);
    }
  }

  async listAppointments(req, res, next) {
    try {
      const { doctorId, patientId, status, from, to, search } = req.query;
      const where = {};

      if (req.user?.role === 'patient') {
        where.patientId = req.user.patientId || req.user.userId;
      } else if (req.user?.role === 'doctor') {
        where.doctorId = req.user.doctorId || req.user.userId;
      } else {
        if (doctorId)  where.doctorId  = doctorId;
        if (patientId) where.patientId = patientId;
      }

      if (status) where.status = status;
      if (from || to) {
        where.scheduledTime = {};
        if (from) where.scheduledTime.gte = new Date(from);
        if (to)   where.scheduledTime.lte = new Date(to);
      }
      if (search) {
        where.OR = [
          { patientName: { contains: search, mode: 'insensitive' } },
          { doctorName:  { contains: search, mode: 'insensitive' } },
          { notes:       { contains: search, mode: 'insensitive' } },
        ];
      }

      const appointments = await prisma.appointment.findMany({
        where,
        include: { clinicalNote: { select: { id: true } } },
        orderBy: { scheduledTime: 'asc' },
      });

      return res.json({ success: true, data: appointments.map(mapAppointment) });
    } catch (err) {
      next(err);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;

      const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
      if (!existing) {
        throw new AppError(ERROR_CODES.RECORD_NOT_FOUND, `Appointment ${appointmentId} not found`);
      }

      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data:  { status: 'cancelled' },
      });

      logActivity('APPOINTMENT_CANCELLED', req.user?.userId, { appointmentId }, req.user?.role).catch(() => {});

      return res.json({ success: true, data: mapAppointment(appointment) });
    } catch (err) {
      next(err);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) {
        throw new AppError(ERROR_CODES.MISSING_FIELDS, 'doctorId and date are required');
      }

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const booked = await prisma.appointment.findMany({
        where: {
          doctorId,
          scheduledTime: { gte: start, lte: end },
          // Exclude terminal statuses — the slot is occupied for any non-terminal status.
          // 'no-show' still counts as occupied (the original slot was taken).
          status: { notIn: ['cancelled'] },
        },
        select: { scheduledTime: true },
      });

      const bookedHours = new Set(booked.map(a => new Date(a.scheduledTime).getHours()));

      // Generate hourly slots 8am-5pm
      const slots = [];
      for (let h = 8; h < 17; h++) {
        if (!bookedHours.has(h)) {
          const slot = new Date(date);
          slot.setHours(h, 0, 0, 0);
          slots.push(slot.toISOString());
        }
      }

      return res.json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AppointmentController();