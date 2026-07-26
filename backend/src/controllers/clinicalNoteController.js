const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

const genId = () => `CN-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapClinicalNote = (note) => {
    if (!note) return null;
    return {
        id: note.id,
        clinicalNoteId: note.id,
        appointmentId: note.appointmentId,
        patientId: note.patientId,
        doctorId: note.doctorId,
        soapSubjective: note.soapSubjective,
        soapObjective: note.soapObjective,
        soapAssessment: note.soapAssessment,
        soapPlan: note.soapPlan,
        recordedBy: note.recordedBy,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
    };
};

class ClinicalNoteController {
    async createClinicalNote(req, res) {
        try {
            const { appointmentId, patientId, doctorId, soapSubjective, soapObjective, soapAssessment, soapPlan, recordedBy } = req.body;

            if (!appointmentId || !patientId || !doctorId || !recordedBy) {
                return res.status(400).json({
                    success: false,
                    error: 'appointmentId, patientId, doctorId, and recordedBy are required'
                });
            }

            let note = await prisma.clinicalNote.findUnique({
                where: { appointmentId }
            });

            if (note) {
                note = await prisma.clinicalNote.update({
                    where: { appointmentId },
                    data: {
                        soapSubjective: soapSubjective !== undefined ? soapSubjective : note.soapSubjective,
                        soapObjective: soapObjective !== undefined ? soapObjective : note.soapObjective,
                        soapAssessment: soapAssessment !== undefined ? soapAssessment : note.soapAssessment,
                        soapPlan: soapPlan !== undefined ? soapPlan : note.soapPlan,
                        recordedBy
                    }
                });
                await logActivity('CLINICAL_NOTE_UPDATED', recordedBy, { clinicalNoteId: note.id, appointmentId });
            } else {
                note = await prisma.clinicalNote.create({
                    data: {
                        id: genId(),
                        appointmentId,
                        patientId,
                        doctorId,
                        soapSubjective: soapSubjective || '',
                        soapObjective: soapObjective || '',
                        soapAssessment: soapAssessment || '',
                        soapPlan: soapPlan || '',
                        recordedBy
                    }
                });
                await logActivity('CLINICAL_NOTE_CREATED', recordedBy, { clinicalNoteId: note.id, appointmentId });
            }

            return res.json({ success: true, data: mapClinicalNote(note) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async getNoteByAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const note = await prisma.clinicalNote.findUnique({
                where: { appointmentId }
            });
            if (!note) {
                return res.status(404).json({ success: false, error: 'Clinical note not found for this appointment' });
            }
            return res.json({ success: true, data: mapClinicalNote(note) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listClinicalNotes(req, res) {
        try {
            const { patientId } = req.query;
            const where = {};
            if (patientId) where.patientId = patientId;

            const notes = await prisma.clinicalNote.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: notes.map(mapClinicalNote) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new ClinicalNoteController();
