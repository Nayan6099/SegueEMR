const dataverseService = require('./dataverseService');

class OrganizationService {
    async getDetails(orgName) {
        let org = await dataverseService.findOrganization(orgName);
        if (!org) {
            org = await dataverseService.createOrganization({
                orgName,
                departments: ['Cardiology', 'Pediatrics', 'General Medicine'],
                accessRules: [
                    { role: 'doctor', permissions: ['read_ehr', 'write_ehr', 'prescribe_meds'] },
                    { role: 'nurse', permissions: ['read_ehr', 'log_vitals'] }
                ]
            });
        }
        return org;
    }

    async addDepartment(orgName, departmentName) {
        const org = await this.getDetails(orgName);
        if (!org.departments.includes(departmentName)) {
            org.departments.push(departmentName);
            await dataverseService.updateOrganization(orgName, {
                departments: org.departments
            });
        }
        return org;
    }

    async listOrgStaff(orgName) {
        return await dataverseService.listStaff(orgName);
    }

    async updateAccessRules(orgName, role, permissions) {
        const org = await this.getDetails(orgName);
        const rules = org.accessRules || [];
        const ruleIndex = rules.findIndex(r => r.role === role);
        if (ruleIndex >= 0) {
            rules[ruleIndex].permissions = permissions;
        } else {
            rules.push({ role, permissions });
        }
        await dataverseService.updateOrganization(orgName, {
            accessRules: rules
        });
        return org;
    }
}

module.exports = new OrganizationService();
