/**
 * Organization Controller
 */

const organizationService = require('../services/organizationService');

class OrganizationController {
    // Get organization details
    async getOrgDetails(req, res) {
        try {
            const { orgName } = req.query;
            if (!orgName) {
                return res.status(400).json({ success: false, error: 'orgName is required' });
            }
            const org = await organizationService.getDetails(orgName);
            const staff = await organizationService.listOrgStaff(orgName);
            return res.json({
                success: true,
                data: {
                    org,
                    staff
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    // Add new department
    async addOrgDepartment(req, res) {
        try {
            const { orgName, departmentName } = req.body;
            if (!orgName || !departmentName) {
                return res.status(400).json({ success: false, error: 'orgName and departmentName are required' });
            }
            const org = await organizationService.addDepartment(orgName, departmentName);
            return res.json({ success: true, data: org });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    // Update role access control list
    async updateAccessRules(req, res) {
        try {
            const { orgName, role, permissions } = req.body;
            if (!orgName || !role || !permissions) {
                return res.status(400).json({ success: false, error: 'orgName, role, and permissions are required' });
            }
            const org = await organizationService.updateAccessRules(orgName, role, permissions);
            return res.json({ success: true, data: org });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new OrganizationController();
