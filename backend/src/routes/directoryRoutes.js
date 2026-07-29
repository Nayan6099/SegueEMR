const express = require('express');
const prisma = require('../config/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/providers', requireAuth, async (req, res) => {
    try {
        const { role } = req.query;

        // If a role filter is provided, validate it. Otherwise fetch labs and pharmacies.
        const validRoles = ['lab_technician', 'pharmacist', 'doctor'];
        let rolesToFetch = validRoles;
        if (role && validRoles.includes(role)) {
            rolesToFetch = [role];
        } else if (role) {
            return res.status(400).json({ success: false, error: 'Invalid provider role specified.' });
        }

        const providers = await prisma.user.findMany({
            where: {
                role: {
                    in: rolesToFetch
                },
                status: 'active'
            },
            select: {
                id: true,
                fullName: true,
                role: true,
                email: true
            },
            orderBy: {
                fullName: 'asc'
            }
        });

        return res.json({
            success: true,
            data: providers
        });
    } catch (error) {
        console.error('Error fetching providers:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch providers.' });
    }
});

module.exports = router;
