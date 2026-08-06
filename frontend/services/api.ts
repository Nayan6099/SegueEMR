/**
 * SegueEMR API Service Layer
 *
 * All HTTP calls go through apiClient (centralized error handling, JWT auth, 401 redirect).
 * No raw axios import — this eliminates duplicate interceptor registration.
 *
 * Fixes from original:
 * - Removed module-level useRouter() (React hook rule violation / build crash)
 * - Fixed EMMRRecord typo -> EMRRecord
 * - Normalized 32-level indentation to flat structure
 * - Removed per-method data normalization duplication (handled in components)
 * - All methods use apiClient instance (not global axios)
 */

import apiClient from './apiClient';

// ─── Type Exports ─────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  role: string;
  orgName: string;
  name?: string;
  fullName?: string;
  status?: string;
  patientId?: string;
  doctorId?: string;
}

export interface PatientRecord {
  id: string;
  userId?: string;
  name: string;
  existing?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceType: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export interface EMRRecord {
  recordId: string;
  patientId: string;
  patientName: string;
  blobReference?: string;
  fileUrl?: string;
  recordType: string;
  description: string;
  fileSize: number;
  uploadedBy: string;
  uploadDate: string;
  createdAt?: string;
  authorizedUsers?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  scheduledTime: string;
  status: 'scheduled' | 'check-in' | 'completed' | 'cancelled' | 'waitlisted';
  notes?: string;
  createdAt?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  medicationDetails: string;
  dosage: string;
  duration: string;
  assignedPharmacyId?: string;
  status: 'pending' | 'dispensed';
  dispensedBy?: string;
  createdAt: string;
  medications?: Array<{ name: string; dosage?: string; frequency?: string; duration?: string }>;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialization?: string;
  testName: string;
  status: string;
  notes?: string;
  resultSummary?: string;
  critical: boolean;
  resultFields?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  doctorNotifiedAt?: string;
  patientNotifiedAt?: string;
  pdfBlobName?: string;
  pdfBlobUrl?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName?: string;
  amount: number;
  status: 'unpaid' | 'paid';
  generatedBy?: string;
  paidAt?: string;
  createdAt: string;
  items?: {
    cptCode?: string;
    icd10Code?: string;
    modifiers?: string;
    description: string;
    quantity?: number;
    amount: number;
  }[];
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Problem {
  id: string;
  patientId: string;
  code?: string;
  description: string;
  status: 'active' | 'resolved';
  onsetDate?: string;
  createdAt?: string;
}

export interface RefillRequest {
  id: string;
  prescriptionId: string;
  medicationDetails?: string;
  requestDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  processedBy?: string;
  processedAt?: string;
}

export interface PatientForm {
  id: string;
  patientId: string;
  formType: string;
  formData: unknown;
  status: 'draft' | 'submitted';
  submittedAt?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt?: string;
}

export interface PatientApiKey {
  id: string;
  patientId: string;
  name: string;
  status: 'active' | 'revoked';
  expiresAt?: string;
  createdAt?: string;
}

export interface PatientIntake {
  id: string;
  patientId: string;
  patientName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  contactPhone?: string;
  contactEmail?: string;
  emergencyContact?: string;
  employerDetails?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  preferredLanguage?: string;
  ethnicity?: string;
  hipaaConsent?: boolean;
  doctorId?: string;
  doctorName?: string;
  reasonForVisit: string;
  symptoms?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    height?: number;
    weight?: number;
    bmi?: number;
    spo2?: number;
  };
  status: 'checked_in' | 'in_consultation' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Vitals {
  id: string;
  patientId: string;
  appointmentId?: string;
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  spo2?: number;
  recordedBy: string;
  recordedAt: string;
  createdAt?: string;
}

export interface ClinicalNote {
  clinicalNoteId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  soapSubjective?: string;
  soapObjective?: string;
  soapAssessment?: string;
  soapPlan?: string;
  recordedBy: string;
}

export interface OfficeNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface PatientEducation {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Authorization {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  requestedItem: string;
  payer: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface Medicine {
  id?: string;
  name: string;
  stock: number;
  reorderThreshold: number;
  expiryDate: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface Organization {
  orgName: string;
  departments: string[];
  accessRules: { role: string; permissions: string[] }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  count?: number;
}

// ─── Helper: normalize prescription data ──────────────────────────────────────
function normalizePrescription(rx: Record<string, unknown>): Prescription {
  const medications = (rx.medications as Array<Record<string, string>> || []);
  const medDetails = medications.length
    ? medications.map(m => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`).join(', ')
    : (rx.medicationDetails as string || '');
  return {
    ...(rx as unknown as Prescription),
    id: (rx.prescriptionId || rx.id || rx._id) as string,
    medicationDetails: medDetails,
  };
}

// ─── Helper: normalize lab order data ────────────────────────────────────────
function normalizeLabOrder(lab: Record<string, unknown>): LabOrder {
  return {
    ...(lab as unknown as LabOrder),
    id: (lab.labOrderId || lab.id || lab._id) as string,
    testName: (lab.testName || lab.testType || '') as string,
  };
}

// ─── Helper: normalize invoice data ──────────────────────────────────────────
function normalizeInvoice(inv: Record<string, unknown>): Invoice {
  return {
    ...(inv as unknown as Invoice),
    id: (inv.invoiceId || inv.id || inv._id) as string,
    amount: (inv.totalAmount !== undefined ? inv.totalAmount : inv.amount) as number,
  };
}

// ─── API Methods ──────────────────────────────────────────────────────────────
const api = {

  // ── EHR Records ────────────────────────────────────────────────────────────
  uploadEHR: async (formData: FormData): Promise<ApiResponse<EMRRecord>> => {
    const { data } = await apiClient.post('/ehr/upload', formData);
    return data;
  },

  viewEHR: async (recordId: string, userId: string, orgName: string): Promise<Blob> => {
    const { data } = await apiClient.get('/ehr/view', {
      params: { recordId, userId, orgName },
      responseType: 'blob',
    });
    return data;
  },

  bulkExportEHR: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/ehr/export-zip', {
      responseType: 'blob',
    });
    return data;
  },

  getRecordDetails: async (recordId: string, userId: string, orgName: string): Promise<ApiResponse<{ metadata: EMRRecord }>> => {
    const { data } = await apiClient.get('/ehr/details', { params: { recordId, userId, orgName } });
    return data;
  },

  grantAccess: async (recordId: string, patientId: string, doctorId: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/ehr/grant-access', { recordId, patientId, doctorId });
    return data;
  },

  revokeAccess: async (recordId: string, patientId: string, doctorId: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/ehr/revoke-access', { recordId, patientId, doctorId });
    return data;
  },

  getAccessHistory: async (recordId: string, userId: string, orgName: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.get('/ehr/history', { params: { recordId, userId, orgName } });
    return data;
  },

  getPatientRecords: async (patientId: string, userId: string, orgName: string): Promise<ApiResponse<EMRRecord[]>> => {
    const { data } = await apiClient.get('/ehr/patient-records', { params: { patientId, userId, orgName } });
    return data;
  },

  registerUser: async (userId: string, orgName: string, role: string): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.post('/ehr/register-user', { userId, orgName, role });
    return data;
  },

  // ── Appointments ───────────────────────────────────────────────────────────
  listAppointments: async (params: Record<string, string> = {}): Promise<ApiResponse<Appointment[]>> => {
    const { data } = await apiClient.get('/appointments', { params });
    return data;
  },

  getAvailableSlots: async (doctorId: string, date?: string): Promise<ApiResponse<string[]>> => {
    const { data } = await apiClient.get('/appointments/available-slots', { params: { doctorId, date } });
    return data;
  },

  createAppointment: async (payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const { scheduledTime, ...rest } = payload;
    const { data } = await apiClient.post('/appointments', {
      ...rest,
      scheduledAt: scheduledTime,
    });
    return data;
  },

  updateAppointment: async (appointmentId: string, payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const { data } = await apiClient.put(`/appointments/${appointmentId}`, payload);
    return data;
  },

  cancelAppointment: async (appointmentId: string, cancelledBy: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.delete(`/appointments/${appointmentId}`, { data: { cancelledBy } });
    return data;
  },

  // ── Prescriptions ──────────────────────────────────────────────────────────
  listPrescriptions: async (params: Record<string, string> = {}): Promise<ApiResponse<Prescription[]>> => {
    const { data } = await apiClient.get('/prescriptions', { params });
    if (data?.success && Array.isArray(data.data)) {
      data.data = data.data.map(normalizePrescription);
    }
    return data;
  },

  createPrescription: async (payload: Partial<Prescription>): Promise<ApiResponse<Prescription>> => {
    // Build medications array from legacy medicationDetails string if needed
    let medications = (payload as Record<string, unknown>).medications as unknown[] || [];
    if (!medications.length && payload.medicationDetails) {
      const parts = payload.medicationDetails.split(' | ');
      medications = [{
        name:      parts[0] || payload.medicationDetails,
        dosage:    parts[1] || payload.dosage || '',
        frequency: parts[2] || '',
        duration:  parts[3] || payload.duration || '',
      }];
    }
    const { data } = await apiClient.post('/prescriptions', { ...payload, medications });
    if (data?.success && data.data) data.data = normalizePrescription(data.data);
    return data;
  },

  dispensePrescription: async (prescriptionId: string, dispensedBy: string): Promise<ApiResponse<Prescription>> => {
    const { data } = await apiClient.put(`/prescriptions/${prescriptionId}/dispense`, { dispensedBy });
    if (data?.success && data.data) data.data = normalizePrescription(data.data);
    return data;
  },

  cancelPrescription: async (prescriptionId: string): Promise<ApiResponse<Prescription>> => {
    const { data } = await apiClient.put(`/prescriptions/${prescriptionId}/cancel`);
    if (data?.success && data.data) data.data = normalizePrescription(data.data);
    return data;
  },

  undoPrescription: async (prescriptionId: string): Promise<ApiResponse<Prescription>> => {
    const { data } = await apiClient.put(`/prescriptions/${prescriptionId}/undo`);
    if (data?.success && data.data) data.data = normalizePrescription(data.data);
    return data;
  },

  // ── Lab Orders ────────────────────────────────────────────────────────────
  listLabOrders: async (params: Record<string, string> = {}): Promise<ApiResponse<LabOrder[]>> => {
    const { data } = await apiClient.get('/lab/orders', { params: { ...params, _t: Date.now().toString() } });
    if (data?.success && Array.isArray(data.data)) {
      data.data = data.data.map(normalizeLabOrder);
    }
    return data;
  },

  createLabOrder: async (payload: Partial<LabOrder>): Promise<ApiResponse<LabOrder>> => {
    const { data } = await apiClient.post('/lab/orders', {
      ...payload,
      testType: payload.testName || '',
    });
    if (data?.success && data.data) data.data = normalizeLabOrder(data.data);
    return data;
  },

  updateLabOrderStatus: async (labOrderId: string, status: string, processedBy: string): Promise<ApiResponse<LabOrder>> => {
    const { data } = await apiClient.put(`/lab/orders/${labOrderId}/status`, { status, processedBy });
    if (data?.success && data.data) data.data = normalizeLabOrder(data.data);
    return data;
  },

  uploadLabResult: async (labOrderId: string, payload: Record<string, unknown>): Promise<ApiResponse<LabOrder>> => {
    const { data } = await apiClient.put(`/lab/orders/${labOrderId}/result`, payload);
    if (data?.success && data.data) data.data = normalizeLabOrder(data.data);
    return data;
  },

  batchUploadLabResults: async (results: { labOrderId: string, resultSummary?: string, resultFields?: Record<string, string> }[]): Promise<ApiResponse<LabOrder[]>> => {
    const { data } = await apiClient.post(`/lab/orders/batch-result`, { results });
    return data;
  },

  notifyLabOrder: async (orderId: string, target: 'doctor' | 'patient' | 'both'): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post(`/lab/orders/${orderId}/notify`, { target });
    return data;
  },

  uploadLabPdfReport: async (orderId: string, file: File): Promise<ApiResponse<LabOrder>> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/lab/orders/${orderId}/report`, formData);
    if (data?.success && data.data) data.data = normalizeLabOrder(data.data);
    return data;
  },

  sendLabReport: async (orderId: string, recipient: 'doctor' | 'patient' | 'both'): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post(`/lab/orders/${orderId}/send`, { recipient });
    return data;
  },

  downloadLabReport: async (orderId: string): Promise<ApiResponse<{ sasUrl: string }>> => {
    const { data } = await apiClient.get(`/lab/reports/${orderId}/download`);
    return data;
  },

  undoLabOrderComplete: async (orderId: string): Promise<ApiResponse<LabOrder>> => {
    const { data } = await apiClient.post(`/lab/orders/${orderId}/undo`);
    return data;
  },

  fetchDoctorLabReports: async (): Promise<ApiResponse<LabOrder[]>> => {
    const { data } = await apiClient.get('/lab/orders/doctor/reports');
    return data;
  },

  fetchPatientLabReports: async (): Promise<ApiResponse<LabOrder[]>> => {
    const { data } = await apiClient.get('/lab/orders', { params: { status: 'completed' } });
    return data;
  },

  fetchPrintReport: async (reportId: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.get(`/lab/reports/${reportId}/print`);
    return data;
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  listInvoices: async (params: Record<string, string> = {}): Promise<ApiResponse<Invoice[]>> => {
    const { data } = await apiClient.get('/billing/invoices', { params });
    if (data?.success && Array.isArray(data.data)) {
      data.data = data.data.map(normalizeInvoice);
    }
    return data;
  },

  createInvoice: async (payload: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const { data } = await apiClient.post('/billing/invoices', payload);
    if (data?.success && data.data) data.data = normalizeInvoice(data.data);
    return data;
  },

  updateInvoice: async (invoiceId: string, payload: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const { data } = await apiClient.put(`/billing/invoices/${invoiceId}`, payload);
    if (data?.success && data.data) data.data = normalizeInvoice(data.data);
    return data;
  },

  getInvoiceByAppointment: async (appointmentId: string): Promise<ApiResponse<Invoice>> => {
    const { data } = await apiClient.get(`/billing/invoices/appointment/${appointmentId}`);
    if (data?.success && data.data) data.data = normalizeInvoice(data.data);
    return data;
  },

  markInvoicePaid: async (invoiceId: string, updatedBy: string): Promise<ApiResponse<Invoice>> => {
    const { data } = await apiClient.put(`/billing/invoices/${invoiceId}/pay`, { updatedBy });
    if (data?.success && data.data) data.data = normalizeInvoice(data.data);
    return data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsOverview: async (): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.get('/analytics/overview');
    return data;
  },

  // ── Patient Portal ────────────────────────────────────────────────────────
  getAllergies: async (patientId: string): Promise<ApiResponse<Allergy[]>> => {
    const { data } = await apiClient.get('/patient/allergies', { params: { patientId } });
    return data;
  },

  addAllergy: async (payload: { patientId: string; allergen: string; severity: string; reaction: string }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/patient/allergies', payload);
    return data;
  },

  getProblems: async (patientId: string): Promise<ApiResponse<Problem[]>> => {
    const { data } = await apiClient.get('/patient/problems', { params: { patientId } });
    return data;
  },

  addProblem: async (payload: { patientId: string; code: string; description: string; onsetDate: string }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/patient/problems', payload);
    return data;
  },

  listRefillRequests: async (patientId: string): Promise<ApiResponse<RefillRequest[]>> => {
    const { data } = await apiClient.get('/patient/refills', { params: { patientId } });
    return data;
  },

  requestRefill: async (payload: { prescriptionId: string; notes: string }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/patient/refills', payload);
    return data;
  },

  getPatientForms: async (patientId: string): Promise<ApiResponse<PatientForm[]>> => {
    const { data } = await apiClient.get('/patient/forms', { params: { patientId } });
    return data;
  },

  submitPatientForm: async (payload: { patientId: string; formType: string; formData: unknown }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/patient/forms', payload);
    return data;
  },

  getMessages: async (userId: string, otherId: string): Promise<ApiResponse<Message[]>> => {
    const { data } = await apiClient.get('/patient/messages', { params: { userId, otherId } });
    return data;
  },

  sendMessage: async (payload: { senderId: string; receiverId: string; content: string }): Promise<ApiResponse<unknown>> => {
    const res = await apiClient.post('/patient/messages', payload);
    return res.data;
  },
  readMessages: async (otherId: string): Promise<ApiResponse<unknown>> => {
    const res = await apiClient.post('/patient/messages/read', { otherId });
    return res.data;
  },

  getApiKeys: async (patientId: string): Promise<ApiResponse<PatientApiKey[]>> => {
    const { data } = await apiClient.get('/patient/api-keys', { params: { patientId } });
    return data;
  },

  generateApiKey: async (payload: { patientId: string; keyName: string; durationDays: number }): Promise<ApiResponse<{ apiKey: string; expiresAt: string; message: string }>> => {
    const { data } = await apiClient.post('/patient/api-keys', payload);
    return data;
  },

  exportCCDA: (patientId: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/patient/ccda/export/${patientId}`;
  },

  importCCDA: async (formData: FormData): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/patient/ccda/import', formData);
    return data;
  },

  // ── Intake Workflow ───────────────────────────────────────────────────────
  createIntake: async (payload: Partial<PatientIntake>): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/intake', payload);
    return data;
  },

  listIntakes: async (params: Record<string, string> = {}): Promise<ApiResponse<PatientIntake[]>> => {
    const { data } = await apiClient.get('/intake', { params });
    return data;
  },

  updateIntake: async (id: string, payload: Partial<PatientIntake> & { changedBy: string }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.put(`/intake/${id}`, payload);
    return data;
  },

  updateIntakeStatus: async (id: string, status: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.put(`/intake/${id}/status`, { status });
    return data;
  },

  getIntakeAuditHistory: async (id: string): Promise<ApiResponse<unknown[]>> => {
    const { data } = await apiClient.get(`/intake/${id}/history`);
    return data;
  },

  // ── Vitals & Clinical Notes ───────────────────────────────────────────────
  listVitals: async (patientId: string): Promise<ApiResponse<Vitals[]>> => {
    const { data } = await apiClient.get('/vitals', { params: { patientId } });
    return data;
  },

  addVitals: async (payload: Partial<Vitals>): Promise<ApiResponse<Vitals>> => {
    const { data } = await apiClient.post('/vitals', payload);
    return data;
  },

  getClinicalNote: async (appointmentId: string): Promise<ApiResponse<ClinicalNote>> => {
    try {
      const { data } = await apiClient.get(`/clinical-notes/appointment/${appointmentId}`);
      return data;
    } catch (err: any) {
      // A 404 simply means no SOAP note has been written for this appointment yet — not an error
      if (err?.message?.includes('could not be found') || err?.response?.status === 404) {
        return { success: false, data: null as any };
      }
      throw err;
    }
  },

  createClinicalNote: async (payload: Partial<ClinicalNote>): Promise<ApiResponse<ClinicalNote>> => {
    const { data } = await apiClient.post('/clinical-notes', payload);
    return data;
  },

  // ── Medicine Inventory ────────────────────────────────────────────────────
  listMedicines: async (): Promise<ApiResponse<Medicine[]>> => {
    const { data } = await apiClient.get('/medicines');
    return data;
  },

  addOrUpdateMedicine: async (payload: Partial<Medicine> & { updatedBy: string }): Promise<ApiResponse<Medicine>> => {
    const { data } = await apiClient.post('/medicines', payload);
    return data;
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings: async (): Promise<ApiResponse<Setting[]>> => {
    const { data } = await apiClient.get('/admin/settings');
    return data;
  },

  updateSetting: async (key: string, value: unknown): Promise<ApiResponse<Setting>> => {
    const { data } = await apiClient.post('/admin/settings', { key, value });
    return data;
  },

  exportCSV: async (resource: string): Promise<void> => {
    const { data } = await apiClient.get(`/admin/export/${resource}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource}-export.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // ── Reports ───────────────────────────────────────────────────────────────
  getPatientReport: async (params?: any): Promise<ApiResponse<any[]>> => {
    const { data } = await apiClient.get('/reports/patients', { params });
    return data;
  },

  getClinicalSummaryReport: async (params?: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get('/reports/clinical-summary', { params });
    return data;
  },

  // ── Organization ──────────────────────────────────────────────────────────
  getOrganizationDetails: async (orgName: string): Promise<ApiResponse<{ org: Organization; staff: User[] }>> => {
    const { data } = await apiClient.get('/organization', { params: { orgName } });
    return data;
  },

  addOrgDepartment: async (orgName: string, departmentName: string): Promise<ApiResponse<Organization>> => {
    const { data } = await apiClient.post('/organization/department', { orgName, departmentName });
    return data;
  },

  updateAccessRules: async (payload: { orgName: string; role: string; permissions: string[] }): Promise<ApiResponse<Organization>> => {
    const { data } = await apiClient.post('/organization/access-rules', payload);
    return data;
  },

  // ── Patient Registry ──────────────────────────────────────────────────────
  registerPatient: async (payload: {
    name: string;
    dateOfBirth?: string;
    gender?: string;
    contactPhone?: string;
    contactEmail?: string;
  }): Promise<{ success: boolean; existing: boolean; data: PatientRecord }> => {
    const { data } = await apiClient.post('/intake/patients/register', payload);
    return data;
  },

  searchPatients: async (q: string, doctorId?: string): Promise<{ success: boolean; data: PatientRecord[] }> => {
    const { data } = await apiClient.get('/intake/patients/search', { params: { q, doctorId } });
    return data;
  },

  getEligibilityChecks: async (params?: any): Promise<ApiResponse<any[]>> => {
    const { data } = await apiClient.get('/intake/eligibility', { params });
    return data;
  },

  addEligibilityCheck: async (payload: { patientId: string; patientName: string; payer: string; status?: string }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/intake/eligibility', payload);
    return data;
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  login: async (payload: {
    userId?: string;
    email?: string;
    orgName?: string;
    role?: string;
    password?: string;
  }): Promise<ApiResponse<{ token: string; user: User & { patientId?: string; doctorId?: string } }>> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  listNotifications: async (): Promise<ApiResponse<AppNotification[]>> => {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  getUnreadNotificationCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },

  markNotificationRead: async (id: string): Promise<ApiResponse<AppNotification>> => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },

  markAllNotificationsRead: async (): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },

  // ── Directory / Providers ─────────────────────────────────────────────────
  getProviders: async (role?: string): Promise<ApiResponse<unknown[]>> => {
    const { data } = await apiClient.get('/directory/providers', { params: role ? { role } : {} });
    return data;
  },

  // ── Recalls ───────────────────────────────────────────────────────────────
  createRecall: async (payload: { patientId: string; patientName: string; reason: string; dueDate: string; notes?: string }): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.post('/recalls', payload);
    return data;
  },

  listRecalls: async (params: Record<string, string> = {}): Promise<ApiResponse<unknown[]>> => {
    const { data } = await apiClient.get('/recalls', { params });
    return data;
  },

  updateRecallStatus: async (recallId: string, status: string, notes?: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.put(`/recalls/${recallId}/status`, { status, notes });
    return data;
  },

  // ── Form status (record requests) ────────────────────────────────────────
  updateFormStatus: async (formId: string, status: string): Promise<ApiResponse<unknown>> => {
    const { data } = await apiClient.patch(`/patient/forms/${formId}/status`, { status });
    return data;
  },

  // ── Chart Additions (Office Notes, Education, Authorizations) ─────────────
  getOfficeNotes: async (patientId: string): Promise<ApiResponse<OfficeNote[]>> => {
    const { data } = await apiClient.get(`/chart/office-notes/${patientId}`);
    return data;
  },

  addOfficeNote: async (patientId: string, payload: { authorId: string; authorName: string; content: string }): Promise<ApiResponse<OfficeNote>> => {
    const { data } = await apiClient.post(`/chart/office-notes/${patientId}`, payload);
    return data;
  },

  getPatientEducation: async (patientId: string): Promise<ApiResponse<PatientEducation[]>> => {
    const { data } = await apiClient.get(`/chart/education/${patientId}`);
    return data;
  },

  addPatientEducation: async (patientId: string, payload: { authorId: string; authorName: string; title: string; content: string }): Promise<ApiResponse<PatientEducation>> => {
    const { data } = await apiClient.post(`/chart/education/${patientId}`, payload);
    return data;
  },

  getAuthorizations: async (patientId: string): Promise<ApiResponse<Authorization[]>> => {
    const { data } = await apiClient.get(`/chart/authorizations/${patientId}`);
    return data;
  },

  addAuthorization: async (patientId: string, payload: { authorId: string; authorName: string; requestedItem: string; payer: string; status: string }): Promise<ApiResponse<Authorization>> => {
    const { data } = await apiClient.post(`/chart/authorizations/${patientId}`, payload);
    return data;
  },
};

export default api;
