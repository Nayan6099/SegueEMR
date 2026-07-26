const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

class MedicineController {
    async createOrUpdateMedicine(req, res) {
        try {
            const { name, stock, reorderThreshold, expiryDate, updatedBy } = req.body;

            if (!name || stock === undefined || !expiryDate) {
                return res.status(400).json({
                    success: false,
                    error: 'name, stock, and expiryDate are required'
                });
            }

            let medicine = await prisma.medicine.findUnique({
                where: { name }
            });

            if (medicine) {
                medicine = await prisma.medicine.update({
                    where: { name },
                    data: {
                        stock: Number(stock),
                        reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : medicine.reorderThreshold,
                        expiryDate: new Date(expiryDate)
                    }
                });
                await logActivity('MEDICINE_INVENTORY_UPDATED', updatedBy || 'unknown', { name, stock });
            } else {
                medicine = await prisma.medicine.create({
                    data: {
                        name,
                        stock: Number(stock),
                        reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : 10,
                        expiryDate: new Date(expiryDate)
                    }
                });
                await logActivity('MEDICINE_INVENTORY_CREATED', updatedBy || 'unknown', { name, stock });
            }

            return res.json({ success: true, data: medicine });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    async listMedicines(req, res) {
        try {
            const medicines = await prisma.medicine.findMany({
                orderBy: { name: 'asc' }
            });
            return res.json({ success: true, data: medicines });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new MedicineController();
