const prisma = require('../config/prisma');

class ReportController {
  // GET /reports/:id/print - returns completed lab order details for printing
  async getPrintReport(req, res) {
    try {
      const { id } = req.params;
      const labOrder = await prisma.labOrder.findUnique({
        where: { id },
        include: { doctor: true, patient: true }
      });
      if (!labOrder) {
        return res.status(404).json({ success: false, error: 'Lab order not found' });
      }
      if (labOrder.status !== 'completed') {
        return res.status(400).json({ success: false, error: 'Lab order must be completed' });
      }
      const data = {
        id: labOrder.id,
        testName: labOrder.testName,
        resultSummary: labOrder.resultSummary,
        patientName: labOrder.patientName,
        doctorName: labOrder.doctorName,
        createdAt: labOrder.createdAt,
        updatedAt: labOrder.updatedAt
      };
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new ReportController();
