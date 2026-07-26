const crypto = require('crypto');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

const genId = () => `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapInvoice = (inv) => {
    if (!inv) return null;
    return {
        id: inv.id,
        invoiceId: inv.id,
        patientId: inv.patientId,
        patientName: inv.patientName,
        totalAmount: inv.totalAmount,
        amount: inv.totalAmount,
        status: inv.status,
        createdBy: inv.createdBy,
        paidAt: inv.paidAt,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        items: (inv.items || []).map(item => ({
            description: item.description,
            amount: item.amount
        }))
    };
};

class BillingController {
    async createInvoice(req, res) {
        try {
            const { patientId, patientName, items, amount } = req.body;
            const createdBy = req.user.userId;

            const itemsArray = items || (amount ? [{ description: 'General Consultation', amount: Number(amount) }] : []);

            if (!patientId || !patientName || !itemsArray.length) {
                return res.status(400).json({
                    success: false,
                    error: 'patientId, patientName, and items are required'
                });
            }

            const totalAmount = itemsArray.reduce((sum, item) => sum + Number(item.amount || 0), 0);

            const invoice = await prisma.invoice.create({
                data: {
                    id: genId(),
                    patientId,
                    patientName,
                    totalAmount,
                    createdBy,
                    status: 'unpaid',
                    items: {
                        create: itemsArray.map(item => ({
                            description: item.description,
                            amount: Number(item.amount || 0)
                        }))
                    }
                },
                include: { items: true }
            });

            await logActivity('INVOICE_CREATED', createdBy, { invoiceId: invoice.id, patientId, totalAmount });

            return res.status(201).json({ success: true, data: mapInvoice(invoice) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async markPaid(req, res) {
        try {
            const { invoiceId } = req.params;
            const updatedBy = req.user.userId;

            const checkInvoice = await prisma.invoice.findUnique({
                where: { id: invoiceId }
            });

            if (!checkInvoice) {
                return res.status(404).json({ success: false, error: 'Invoice not found' });
            }

            const invoice = await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'paid', paidAt: new Date() },
                include: { items: true }
            });

            await logActivity('INVOICE_PAID', updatedBy || 'unknown', { invoiceId });

            return res.json({ success: true, data: mapInvoice(invoice) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listInvoices(req, res) {
        try {
            const { patientId, status } = req.query;
            const where = {};
            let finalPatientId = patientId;

            if (req.user.role === 'patient') {
                finalPatientId = req.user.patientId;
            }

            if (finalPatientId) where.patientId = finalPatientId;
            if (status) where.status = status;

            const invoices = await prisma.invoice.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, data: invoices.map(mapInvoice) });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new BillingController();
