import axios from 'axios';

const API_ROOT = 'http://localhost:3000/api';
const API_BASE_URL = `${API_ROOT}/ehr`;

export interface User {
  userId: string;
  role: string;
  orgName: string;
  name?: string;
  status?: string;
}

export interface EMRRecord {
  recordId: string;
  patientId: string;
  patientName: string;
  ipfsHash?: string;
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
  status: 'scheduled' | 'check-in' | 'completed' | 'cancelled';
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

  createAppointment: async (payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const response = await axios.post(`${API_ROOT}/appointments`, payload);
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
    return response.data;
  },

  createPrescription: async (payload: Partial<Prescription>): Promise<ApiResponse<Prescription>> => {
    const response = await axios.post(`${API_ROOT}/prescriptions`, payload);
    return response.data;
  },

  dispensePrescription: async (prescriptionId: string, dispensedBy: string): Promise<ApiResponse<Prescription>> => {
    const response = await axios.put(`${API_ROOT}/prescriptions/${prescriptionId}/dispense`, { dispensedBy });
    return response.data;
  },

  // Lab
  listLabOrders: async (params: any = {}): Promise<ApiResponse<LabOrder[]>> => {
    const response = await axios.get(`${API_ROOT}/lab/orders`, { params });
    return response.data;
  },

  createLabOrder: async (payload: Partial<LabOrder>): Promise<ApiResponse<LabOrder>> => {
    const response = await axios.post(`${API_ROOT}/lab/orders`, payload);
    return response.data;
  },

  updateLabOrderStatus: async (labOrderId: string, status: string, processedBy: string): Promise<ApiResponse<LabOrder>> => {
    const response = await axios.put(`${API_ROOT}/lab/orders/${labOrderId}/status`, { status, processedBy });
    return response.data;
  },

  uploadLabResult: async (labOrderId: string, payload: any): Promise<ApiResponse<LabOrder>> => {
    const response = await axios.put(`${API_ROOT}/lab/orders/${labOrderId}/result`, payload);
    return response.data;
  },

  // Billing
  listInvoices: async (params: any = {}): Promise<ApiResponse<Invoice[]>> => {
    const response = await axios.get(`${API_ROOT}/billing/invoices`, { params });
    return response.data;
  },

  createInvoice: async (payload: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const response = await axios.post(`${API_ROOT}/billing/invoices`, payload);
    return response.data;
  },

  markInvoicePaid: async (invoiceId: string, updatedBy: string): Promise<ApiResponse<Invoice>> => {
    const response = await axios.put(`${API_ROOT}/billing/invoices/${invoiceId}/pay`, { updatedBy });
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
  }
};

type EMMRRecord = EMRRecord; // Alias correction
export default api;
