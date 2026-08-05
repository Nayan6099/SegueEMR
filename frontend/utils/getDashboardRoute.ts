export function getDashboardRoute(role: string): string {
  const roleMap: Record<string, string> = {
    patient: 'patient',
    doctor: 'doctor',
    nurse: 'nurse',
    receptionist: 'receptionist',
    lab_technician: 'lab_technician',
    pharmacist: 'pharmacist',
    admin_staff: 'admin',
    management: 'management'
  };
  
  return roleMap[role] || 'overview'; // Fallback for unknown roles
}
