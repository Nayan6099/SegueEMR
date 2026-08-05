const prisma = require('../config/prisma');

class ReportModuleController {
  async getPatientReport(req, res, next) {
    try {
      const { providerId, from, to } = req.query;
      const where = {};

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      // If provider is specified, only include patients who have had an appointment with them
      if (providerId) {
        where.appointments = {
          some: { doctorId: providerId }
        };
      }

      const patients = await prisma.patient.findMany({
        where,
        include: {
          appointments: {
            orderBy: { scheduledTime: 'desc' },
            take: 1,
            select: { scheduledTime: true, doctorName: true, doctorId: true, status: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      const mapped = patients.map(p => ({
        id: p.id,
        name: p.name,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        contactPhone: p.phone,
        createdAt: p.createdAt,
        lastVisit: p.appointments.length > 0 ? p.appointments[0] : null
      }));

      return res.json({ success: true, data: mapped });
    } catch (err) {
      next(err);
    }
  }

  async getClinicalSummary(req, res, next) {
    try {
      const { providerId, from, to } = req.query;

      // Filter for lab orders and prescriptions based on provider
      const clinicalWhere = {};
      if (providerId) clinicalWhere.doctorId = providerId;
      if (from || to) {
        clinicalWhere.createdAt = {};
        if (from) clinicalWhere.createdAt.gte = new Date(from);
        if (to) clinicalWhere.createdAt.lte = new Date(to);
      }

      // For Problems and Allergies, there is no doctorId in the schema directly.
      // We will aggregate globally unless we want to filter by patients tied to this provider.
      // For a basic first pass, we will just use the global counts, or filter if they are attached to appointments.
      // The schema for Problem/Allergy just has patientId.
      let patientIds = null;
      if (providerId) {
        const apts = await prisma.appointment.findMany({
          where: { doctorId: providerId },
          select: { patientId: true },
          distinct: ['patientId']
        });
        patientIds = apts.map(a => a.patientId);
      }

      const problemWhere = patientIds ? { patientId: { in: patientIds } } : {};
      const allergyWhere = patientIds ? { patientId: { in: patientIds } } : {};

      const [
        totalProblems,
        totalAllergies,
        pendingPrescriptions,
        dispensedPrescriptions,
        labOrdersRaw
      ] = await Promise.all([
        prisma.problem.count({ where: problemWhere }),
        prisma.allergy.count({ where: allergyWhere }),
        prisma.prescription.count({ where: { ...clinicalWhere, status: 'pending' } }),
        prisma.prescription.count({ where: { ...clinicalWhere, status: 'dispensed' } }),
        prisma.labOrder.groupBy({
          by: ['status'],
          where: clinicalWhere,
          _count: { _all: true }
        })
      ]);

      const labOrdersByStatus = labOrdersRaw.map(g => ({ status: g.status, count: g._count._all }));
      const totalLabOrders = labOrdersByStatus.reduce((acc, curr) => acc + curr.count, 0);

      const aptWhere = providerId ? { doctorId: providerId } : {};
      const totalVisitsCount = await prisma.appointment.count({ where: aptWhere });
      
      const aptsWithNotes = await prisma.appointment.findMany({
        where: aptWhere,
        include: { clinicalNote: true }
      });
      const visitsWithNotesCount = aptsWithNotes.filter(a => a.clinicalNote).length;

      const totalUniquePatients = patientIds ? patientIds.length : await prisma.patient.count();
      
      const patientsWithProblems = await prisma.problem.findMany({
        where: problemWhere,
        select: { patientId: true },
        distinct: ['patientId']
      });
      
      const patientsWithAllergies = await prisma.allergy.findMany({
        where: allergyWhere,
        select: { patientId: true },
        distinct: ['patientId']
      });

      return res.json({
        success: true,
        data: {
          totalProblems,
          totalAllergies,
          prescriptions: {
            total: pendingPrescriptions + dispensedPrescriptions,
            pending: pendingPrescriptions,
            dispensed: dispensedPrescriptions
          },
          labs: {
            total: totalLabOrders,
            byStatus: labOrdersByStatus
          },
          amc: {
            totalUniquePatients,
            patientsWithProblems: patientsWithProblems.length,
            patientsWithAllergies: patientsWithAllergies.length,
            totalVisits: totalVisitsCount,
            visitsWithNotes: visitsWithNotesCount
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportModuleController();
