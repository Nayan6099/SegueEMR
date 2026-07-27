import axios from 'axios';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = `${API_ROOT}/ehr`;
const AUTH_BASE_URL = `${API_ROOT}/auth`;

// Configure Axios request interceptor to attach JWT token
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('segue_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  userId: string;
  role: string;
  orgName: string;
  name?: string;
  fullName?: string;
  status?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  existing?: boolean;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  message: string;
  recordType: string;
  recordId: string;
  read: boolean;
  createdAt: string;
}

export interface EMRRecord {
  recordId: string;
  patientId: string;
  patientName: string;
  ipfsHash?: string; // Leftover for legacy compatibility
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
  emrRecordId?: string;
  medicationDetails: string;
  dosage: string;
  duration: string;
  status: 'pending' | 'dispensed';
  dispensedBy?: string;
  createdAt: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  emrRecordId?: string;
  testName: string;
  notes?: string;
  status: 'ordered' | 'processing' | 'completed';
  resultsUrl?: string;
  processedBy?: string;
  createdAt: string;
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
  formData: any;
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
  createdAt?: string;
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
  value: any;
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
  count?: number;
}

const api = {
  // EHR records
  uploadEHR: async (formData: FormData): Promise<ApiResponse<EMRRecord>> => {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  viewEHR: async (recordId: string, userId: string, orgName: string): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/view`, {
      params: { recordId, userId, orgName },
      responseType: 'blob'
    });
    return response.data;
  },

  getRecordDetails: async (recordId: string, userId: string, orgName: string): Promise<ApiResponse<{ blockchain: any, metadata: EMRRecord }>> => {
    const response = await axios.get(`${API_BASE_URL}/details`, {
      params: { recordId, userId, orgName }
    });
    return response.data;
  },

  grantAccess: async (recordId: string, patientId: string, doctorId: string): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/grant-access`, {
      recordId,
      patientId,
      doctorId
    });
    return response.data;
  },

  revokeAccess: async (recordId: string, patientId: string, doctorId: string): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_BASE_URL}/revoke-access`, {
      recordId,
      patientId,
      doctorId
    });
    return response.data;
  },

  getAccessHistory: async (recordId: string, userId: string, orgName: string): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_BASE_URL}/history`, {
      params: { recordId, userId, orgName }
    });
    return response.data;
  },

  getPatientRecords: async (patientId: string, userId: string, orgName: string): Promise<ApiResponse<EMMRRecord[]>> => {
    const response = await axios.get(`${API_BASE_URL}/patient-records`, {
      params: { patientId, userId, orgName }
    });
    return response.data;
  },

  registerUser: async (userId: string, orgName: string, role: string): Promise<ApiResponse<User>> => {
    const response = await axios.post(`${API_BASE_URL}/register-user`, {
      userId,
      orgName,
      role
    });
    return response.data;
  },

  // Appointments
  listAppointments: async (params: any = {}): Promise<ApiResponse<Appointment[]>> => {
    const response = await axios.get(`${API_ROOT}/appointments`, { params });
    return response.data;
  },

  getAvailableSlots: async (doctorId: string, date?: string): Promise<ApiResponse<string[]>> => {
    const response = await axios.get(`${API_ROOT}/appointments/available-slots`, { params: { doctorId, date } });
    return response.data;
  },

  createAppointment: async (payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const { scheduledTime, ...rest } = payload;
    const backendPayload = {
      ...rest,
      scheduledAt: scheduledTime,
      createdBy: payload.patientId || 'patient'
    };
    const response = await axios.post(`${API_ROOT}/appointments`, backendPayload);
    return response.data;
  },

  updateAppointment: async (appointmentId: string, payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const response = await axios.put(`${API_ROOT}/appointments/${appointmentId}`, payload);
    return response.data;
  },

  cancelAppointment: async (appointmentId: string, cancelledBy: string): Promise<ApiResponse<any>> => {
    const response = await axios.delete(`${API_ROOT}/appointments/${appointmentId}`, { data: { cancelledBy } });
    return response.data;
  },

  // Prescriptions
  listPrescriptions: async (params: any = {}): Promise<ApiResponse<Prescription[]>> => {
    const response = await axios.get(`${API_ROOT}/prescriptions`, { params });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((rx: any) => {
        let medDetails = '';
        if (Array.isArray(rx.medications) && rx.medications.length > 0) {
          medDetails = rx.medications.map((m: any) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`).join(', ');
        }
        return {
          ...rx,
          id: rx.prescriptionId || rx.id || rx._id,
          medicationDetails: medDetails || rx.medicationDetails || ''
        };
      });
    }
    return response.data;
  },

  createPrescription: async (payload: Partial<Prescription>): Promise<ApiResponse<Prescription>> => {
    let medications = [];
    if (payload.medicationDetails) {
      const parts = payload.medicationDetails.split(' | ');
      if (parts.length >= 4) {
        medications.push({
          name: parts[0],
          dosage: parts[1],
          frequency: parts[2],
          duration: parts[3]
        });
      } else {
        medications.push({
          name: payload.medicationDetails,
          dosage: payload.dosage || '',
          frequency: '',
          duration: payload.duration || ''
        });
      }
    }
    const backendPayload = {
      ...payload,
      medications
    };
    const response = await axios.post(`${API_ROOT}/prescriptions`, backendPayload);
    if (response.data && response.data.success && response.data.data) {
      const rx = response.data.data;
      let medDetails = '';
      if (Array.isArray(rx.medications) && rx.medications.length > 0) {
        medDetails = rx.medications.map((m: any) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`).join(', ');
      }
      response.data.data = {
        ...rx,
        id: rx.prescriptionId || rx.id || rx._id,
        medicationDetails: medDetails || rx.medicationDetails || ''
      };
    }
    return response.data;
  },

  dispensePrescription: async (prescriptionId: string, dispensedBy: string): Promise<ApiResponse<Prescription>> => {
    const response = await axios.put(`${API_ROOT}/prescriptions/${prescriptionId}/dispense`, { dispensedBy });
    if (response.data && response.data.success && response.data.data) {
      const rx = response.data.data;
      let medDetails = '';
      if (Array.isArray(rx.medications) && rx.medications.length > 0) {
        medDetails = rx.medications.map((m: any) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`).join(', ');
      }
      response.data.data = {
        ...rx,
        id: rx.prescriptionId || rx.id || rx._id,
        medicationDetails: medDetails || rx.medicationDetails || ''
      };
    }
    return response.data;
  },

  // Lab
  listLabOrders: async (params: any = {}): Promise<ApiResponse<LabOrder[]>> => {
    const response = await axios.get(`${API_ROOT}/lab/orders`, { params });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((lab: any) => ({
        ...lab,
        id: lab.labOrderId || lab.id || lab._id,
        testName: lab.testType || lab.testName || ''
      }));
    }
    return response.data;
  },

  createLabOrder: async (payload: Partial<LabOrder>): Promise<ApiResponse<LabOrder>> => {
    const backendPayload = {
      ...payload,
      testType: payload.testName || ''
    };
    const response = await axios.post(`${API_ROOT}/lab/orders`, backendPayload);
    if (response.data && response.data.success && response.data.data) {
      const lab = response.data.data;
      response.data.data = {
        ...lab,
        id: lab.labOrderId || lab.id || lab._id,
        testName: lab.testType || lab.testName || ''
      };
    }
    return response.data;
  },

  updateLabOrderStatus: async (labOrderId: string, status: string, processedBy: string): Promise<ApiResponse<LabOrder>> => {
    const response = await axios.put(`${API_ROOT}/lab/orders/${labOrderId}/status`, { status, processedBy });
    if (response.data && response.data.success && response.data.data) {
      const lab = response.data.data;
      response.data.data = {
        ...lab,
        id: lab.labOrderId || lab.id || lab._id,
        testName: lab.testType || lab.testName || ''
      };
    }
    return response.data;
  },

  uploadLabResult: async (labOrderId: string, payload: any): Promise<ApiResponse<LabOrder>> => {
    const response = await axios.put(`${API_ROOT}/lab/orders/${labOrderId}/result`, payload);
    if (response.data && response.data.success && response.data.data) {
      const lab = response.data.data;
      response.data.data = {
        ...lab,
        id: lab.labOrderId || lab.id || lab._id,
        testName: lab.testType || lab.testName || ''
      };
    }
    return response.data;
  },

  // Billing
  listInvoices: async (params: any = {}): Promise<ApiResponse<Invoice[]>> => {
    const response = await axios.get(`${API_ROOT}/billing/invoices`, { params });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((inv: any) => ({
        ...inv,
        id: inv.invoiceId || inv.id || inv._id,
        amount: inv.totalAmount !== undefined ? inv.totalAmount : inv.amount
      }));
    }
    return response.data;
  },

  createInvoice: async (payload: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const response = await axios.post(`${API_ROOT}/billing/invoices`, payload);
    if (response.data && response.data.success && response.data.data) {
      const inv = response.data.data;
      response.data.data = {
        ...inv,
        id: inv.invoiceId || inv.id || inv._id,
        amount: inv.totalAmount !== undefined ? inv.totalAmount : inv.amount
      };
    }
    return response.data;
  },

  markInvoicePaid: async (invoiceId: string, updatedBy: string): Promise<ApiResponse<Invoice>> => {
    const response = await axios.put(`${API_ROOT}/billing/invoices/${invoiceId}/pay`, { updatedBy });
    if (response.data && response.data.success && response.data.data) {
      const inv = response.data.data;
      response.data.data = {
        ...inv,
        id: inv.invoiceId || inv.id || inv._id,
        amount: inv.totalAmount !== undefined ? inv.totalAmount : inv.amount
      };
    }
    return response.data;
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<ApiResponse<any>> => {
    const response = await axios.get(`${API_ROOT}/analytics/overview`);
    return response.data;
  },

  // --- Patient Portal Additions ---
  getAllergies: async (patientId: string): Promise<ApiResponse<Allergy[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/allergies`, { params: { patientId } });
    return response.data;
  },

  addAllergy: async (payload: { patientId: string; allergen: string; severity: string; reaction: string }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/allergies`, payload);
    return response.data;
  },

  getProblems: async (patientId: string): Promise<ApiResponse<Problem[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/problems`, { params: { patientId } });
    return response.data;
  },

  addProblem: async (payload: { patientId: string; code: string; description: string; onsetDate: string }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/problems`, payload);
    return response.data;
  },

  listRefillRequests: async (patientId: string): Promise<ApiResponse<RefillRequest[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/refills`, { params: { patientId } });
    return response.data;
  },

  requestRefill: async (payload: { prescriptionId: string; notes: string }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/refills`, payload);
    return response.data;
  },

  getPatientForms: async (patientId: string): Promise<ApiResponse<PatientForm[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/forms`, { params: { patientId } });
    return response.data;
  },

  submitPatientForm: async (payload: { patientId: string; formType: string; formData: any }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/forms`, payload);
    return response.data;
  },

  getMessages: async (userId: string, otherId: string): Promise<ApiResponse<Message[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/messages`, { params: { userId, otherId } });
    return response.data;
  },

  sendMessage: async (payload: { senderId: string; receiverId: string; content: string }): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/messages`, payload);
    return response.data;
  },

  getApiKeys: async (patientId: string): Promise<ApiResponse<PatientApiKey[]>> => {
    const response = await axios.get(`${API_ROOT}/patient/api-keys`, { params: { patientId } });
    return response.data;
  },

  generateApiKey: async (payload: { patientId: string; keyName: string; durationDays: number }): Promise<ApiResponse<{ apiKey: string; expiresAt: string; message: string }>> => {
    const response = await axios.post(`${API_ROOT}/patient/api-keys`, payload);
    return response.data;
  },

  exportCCDA: async (patientId: string): Promise<string> => {
    return `${API_ROOT}/patient/ccda/export/${patientId}`;
  },

  importCCDA: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/patient/ccda/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // --- Intake Workflow ---
  createIntake: async (payload: Partial<PatientIntake>): Promise<ApiResponse<any>> => {
    const response = await axios.post(`${API_ROOT}/intake`, payload);
    return response.data;
  },

  listIntakes: async (params: any = {}): Promise<ApiResponse<PatientIntake[]>> => {
    const response = await axios.get(`${API_ROOT}/intake`, { params });
    return response.data;
  },

  updateIntake: async (id: string, payload: Partial<PatientIntake> & { changedBy: string }): Promise<ApiResponse<any>> => {
    const response = await axios.put(`${API_ROOT}/intake/${id}`, payload);
    return response.data;
  },

  updateIntakeStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    const response = await axios.put(`${API_ROOT}/intake/${id}/status`, { status });
    return response.data;
  },

  getIntakeAuditHistory: async (id: string): Promise<ApiResponse<any[]>> => {
    const response = await axios.get(`${API_ROOT}/intake/${id}/history`);
    return response.data;
  },

  // --- Vitals & SOAP Notes ---
  listVitals: async (patientId: string): Promise<ApiResponse<Vitals[]>> => {
    const response = await axios.get(`${API_ROOT}/vitals`, { params: { patientId } });
    return response.data;
  },

  addVitals: async (payload: Partial<Vitals>): Promise<ApiResponse<Vitals>> => {
    const response = await axios.post(`${API_ROOT}/vitals`, payload);
    return response.data;
  },

  getClinicalNote: async (appointmentId: string): Promise<ApiResponse<ClinicalNote>> => {
    const response = await axios.get(`${API_ROOT}/clinical-notes/appointment/${appointmentId}`);
    return response.data;
  },

  createClinicalNote: async (payload: Partial<ClinicalNote>): Promise<ApiResponse<ClinicalNote>> => {
    const response = await axios.post(`${API_ROOT}/clinical-notes`, payload);
    return response.data;
  },

  // --- Medicine Inventory ---
  listMedicines: async (): Promise<ApiResponse<Medicine[]>> => {
    const response = await axios.get(`${API_ROOT}/medicines`);
    return response.data;
  },

  addOrUpdateMedicine: async (payload: Partial<Medicine> & { updatedBy: string }): Promise<ApiResponse<Medicine>> => {
    const response = await axios.post(`${API_ROOT}/medicines`, payload);
    return response.data;
  },

  // --- Settings ---
  getSettings: async (): Promise<ApiResponse<Setting[]>> => {
    const response = await axios.get(`${API_ROOT}/admin/settings`);
    return response.data;
  },

  updateSetting: async (key: string, value: any): Promise<ApiResponse<Setting>> => {
    const response = await axios.post(`${API_ROOT}/admin/settings`, { key, value });
    return response.data;
  },

  exportCSVUrl: (resource: string): string => {
    return `${API_ROOT}/admin/export/${resource}`;
  },

  // --- Organization Owner ---
  getOrganizationDetails: async (orgName: string): Promise<ApiResponse<{ org: Organization; staff: User[] }>> => {
    const response = await axios.get(`${API_ROOT}/organization`, { params: { orgName } });
    return response.data;
  },

  addOrgDepartment: async (orgName: string, departmentName: string): Promise<ApiResponse<Organization>> => {
    const response = await axios.post(`${API_ROOT}/organization/department`, { orgName, departmentName });
    return response.data;
  },

  updateAccessRules: async (payload: { orgName: string; role: string; permissions: string[] }): Promise<ApiResponse<Organization>> => {
    const response = await axios.post(`${API_ROOT}/organization/access-rules`, payload);
    return response.data;
  },

  // --- Patient Registry ---
  registerPatient: async (payload: { name: string; dateOfBirth?: string; gender?: string; contactPhone?: string; contactEmail?: string }): Promise<{ success: boolean; existing: boolean; data: PatientRecord }> => {
    const response = await axios.post(`${API_ROOT}/intake/patients/register`, payload);
    return response.data;
  },

  searchPatients: async (q: string): Promise<{ success: boolean; data: PatientRecord[] }> => {
    const response = await axios.get(`${API_ROOT}/intake/patients/search`, { params: { q } });
    return response.data;
  },

  // --- Auth ---
  login: async (
    userId: string,
    orgName: string,
    role: string,
    password?: string
  ): Promise<ApiResponse<{
    token: string;
    user: User & { patientId?: string; doctorId?: string }
  }>> => {

    const response = await axios.post(`${AUTH_BASE_URL}/login`, {
      userId,
      orgName,
      role,
      password
    });

    return response.data;
  },

  // --- Notifications ---
  listNotifications: async (): Promise<ApiResponse<AppNotification[]>> => {
    const response = await axios.get(`${API_ROOT}/notifications`);
    return response.data;
  },

  markNotificationRead: async (id: string): Promise<ApiResponse<AppNotification>> => {
    const response = await axios.put(`${API_ROOT}/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
    const response = await axios.put(`${API_ROOT}/notifications/read-all`);
    return response.data;
  },
};

type EMMRRecord = EMRRecord; // Alias correction
export default api;
