const prisma = require('../config/prisma');

/**
 * Validate user credentials
 * For demo: just check if userId and orgName are provided
 * Auto-populates PostgreSQL User/Patient/Doctor mock records if missing.
 */
const validateUser = async (req, res, next) => {
    const { userId, orgName } = req.body.userId 
        ? req.body 
        : req.query;

    if (!userId || !orgName) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'userId and orgName must be provided'
        });
    }

    // Validate orgName
    if (!['patient', 'hospital'].includes(orgName)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid organization',
            message: 'orgName must be either "patient" or "hospital"'
        });
    }

    // In production, we reject requests with unrecognized IDs to prevent silent database pollution.
    // In non-production (development/test/CI) environments, we dynamically auto-populate mock
    // User, Patient, and Doctor records to facilitate direct dashboard access without pre-seeding.
    if (process.env.NODE_ENV !== 'production') {
        try {
            const existing = await prisma.user.findUnique({ where: { id: userId } });
            if (!existing) {
                console.log(`[Auth] Auto-populating mock user for ${userId} (${orgName})`);
                const targetRole = orgName === 'patient' 
                    ? 'patient' 
                    : (req.body.role || req.query.role || 'doctor');

                await prisma.user.create({
                    data: {
                        id: userId,
                        username: userId,
                        passwordHash: 'mock_password_hash',
                        email: `${userId}@example.com`,
                        role: targetRole,
                        fullName: userId,
                        status: 'active'
                    }
                });

                if (targetRole === 'patient') {
                    await prisma.patient.create({
                        data: {
                            id: userId,
                            userId: userId,
                            name: userId,
                            dateOfBirth: new Date('1990-01-01'),
                            gender: 'Other'
                        }
                    });
                } else if (targetRole === 'doctor') {
                    await prisma.doctor.create({
                        data: {
                            id: userId,
                            userId: userId,
                            name: userId,
                            specialization: 'General Medicine',
                            licenseNumber: `LIC-${userId}`
                        }
                    });
                }
            } else {
                const targetRole = existing.role;
                if (targetRole === 'patient') {
                    const patExists = await prisma.patient.findUnique({ where: { id: userId } });
                    if (!patExists) {
                        await prisma.patient.create({
                            data: {
                                id: userId,
                                userId: userId,
                                name: userId,
                                dateOfBirth: new Date('1990-01-01'),
                                gender: 'Other'
                            }
                        });
                    }
                } else if (targetRole === 'doctor') {
                    const docExists = await prisma.doctor.findUnique({ where: { id: userId } });
                    if (!docExists) {
                        await prisma.doctor.create({
                            data: {
                                id: userId,
                                userId: userId,
                                name: userId,
                                specialization: 'General Medicine',
                                licenseNumber: `LIC-${userId}`
                            }
                        });
                    }
                }
            }
        } catch (dbErr) {
            console.error('[Auth] Error checking or creating mock user:', dbErr.message);
        }
    } else {
        // Enforce strict check in production: reject unrecognized IDs
        try {
            const existing = await prisma.user.findUnique({ where: { id: userId } });
            if (!existing) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication failed',
                    message: 'User does not exist in the database'
                });
            }
        } catch (dbErr) {
            return res.status(500).json({
                success: false,
                error: 'Internal authentication error',
                message: dbErr.message
            });
        }
    }

    // Attach user info to request
    req.user = {
        userId,
        orgName
    };

    next();
};

/**
 * Check if user is a patient
 */
const isPatient = (req, res, next) => {
    if (req.user.orgName !== 'patient') {
        return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'This action requires patient role'
        });
    }
    next();
};

/**
 * Check if user is a doctor
 */
const isDoctor = (req, res, next) => {
    if (req.user.orgName !== 'hospital') {
        return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'This action requires doctor/hospital role'
        });
    }
    next();
};

/**
 * Generic role guard.
 * Usage: requireRole('doctor', 'nurse')
 * Reads role from req.body.role / req.query.role since PostgreSQL User.role
 * carries the fine-grained staff role (directory sets are mapped from Dataverse).
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    const role = req.body.role || req.query.role || (req.user && req.user.role);
    if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        });
    }
    if (req.user) req.user.role = role;
    next();
};

/**
 * Log all requests (optional)
 */
const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - User: ${req.user?.userId || 'Anonymous'}`);
    next();
};

/**
 * Error handler for authentication errors
 */
const handleAuthError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed',
            message: err.message
        });
    }
    next(err);
};

module.exports = {
    validateUser,
    isPatient,
    isDoctor,
    requireRole,
    logRequest,
    handleAuthError
};