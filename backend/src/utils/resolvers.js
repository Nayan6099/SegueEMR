/**
 * Shared FK resolvers — used by appointment, prescription, lab, and clinical note controllers.
 *
 * These guarantee the correct database primary key is used for foreign-key fields
 * regardless of whether the caller sends a userId ('dr.smith') or a doctorId ('DR-dr.smith').
 *
 * Throws AppError (NOT_FOUND) if the record cannot be resolved, preventing silent FK violations.
 */

const prisma = require('../config/prisma');
const { AppError, ERROR_CODES } = require('./errors');

/**
 * Resolve a Doctor PK from either a Doctor.id or a User.id (userId).
 * @param {string} idOrUserId
 * @returns {Promise<{id: string, name: string, specialization: string}>}
 * @throws {AppError} DOCTOR_NOT_FOUND
 */
async function resolveDoctorId(idOrUserId) {
  if (!idOrUserId) {
    throw new AppError(ERROR_CODES.DOCTOR_NOT_FOUND, 'No doctorId provided');
  }

  // Try direct PK lookup first
  let doctor = await prisma.doctor.findUnique({ where: { id: idOrUserId } });

  // Fall back to userId lookup
  if (!doctor) {
    doctor = await prisma.doctor.findUnique({ where: { userId: idOrUserId } });
  }

  if (!doctor) {
    throw new AppError(
      ERROR_CODES.DOCTOR_NOT_FOUND,
      `Doctor not found for identifier: ${idOrUserId}`
    );
  }

  return doctor;
}

/**
 * Resolve a Patient PK from either a Patient.id or a User.id (userId).
 * @param {string} idOrUserId
 * @returns {Promise<{id: string, name: string}>}
 * @throws {AppError} PATIENT_NOT_FOUND
 */
async function resolvePatientId(idOrUserId) {
  if (!idOrUserId) {
    throw new AppError(ERROR_CODES.PATIENT_NOT_FOUND, 'No patientId provided');
  }

  // Try direct PK lookup first
  let patient = await prisma.patient.findUnique({ where: { id: idOrUserId } });

  // Fall back to userId lookup
  if (!patient) {
    patient = await prisma.patient.findUnique({ where: { userId: idOrUserId } });
  }

  if (!patient) {
    throw new AppError(
      ERROR_CODES.PATIENT_NOT_FOUND,
      `Patient not found for identifier: ${idOrUserId}`
    );
  }

  return patient;
}

module.exports = { resolveDoctorId, resolvePatientId };
