'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  User as UserIcon,
  Users,
  Calendar,
  FileText,
  FilePlus,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  LogOut,
  Search,
  Plus,
  Lock,
  Unlock,
  Download,
  Trash2,
  DollarSign,
  PieChart,
  TrendingUp,
  AlertCircle,
  FlaskConical,
  Pill,
  Bell,
  Activity as LogActivityIcon
} from 'lucide-react';
import api, { User, EMRRecord, Appointment, Prescription, LabOrder, Invoice, Vitals, Medicine, Setting, Organization, PatientRecord, AppNotification } from '../services/api';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  lab_technician: 'Laboratory Technician',
  pharmacist: 'Pharmacist',
  admin_staff: 'Administrative Staff',
  management: 'Healthcare Management',
  admin: 'Admin'
};

interface PatientPickerValue {
  isNew: boolean;
  patientId: string;
  patientName: string;
  dateOfBirth?: string;
  gender?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface PatientPickerProps {
  value: PatientPickerValue;
  onChange: (val: PatientPickerValue) => void;
  showDetailsFields?: boolean;
  existingOnly?: boolean;
}

function PatientPicker({ value, onChange, showDetailsFields = false, existingOnly = false }: PatientPickerProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(existingOnly ? 'existing' : (value.isNew ? 'new' : 'existing'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (existingOnly && activeTab !== 'existing') {
      setActiveTab('existing');
    }
  }, [existingOnly, activeTab]);

  useEffect(() => {
    if (activeTab !== 'existing' || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await api.searchPatients(searchQuery);
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  const handleTabChange = (tab: 'existing' | 'new') => {
    setActiveTab(tab);
    onChange({
      isNew: tab === 'new',
      patientId: '',
      patientName: '',
      dateOfBirth: '',
      gender: 'Male',
      contactPhone: '',
      contactEmail: ''
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectExisting = (patient: PatientRecord) => {
    onChange({
      isNew: false,
      patientId: patient.id,
      patientName: patient.name
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      {!existingOnly && (
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => handleTabChange('existing')}
            className={`flex-1 py-1 text-xs font-semibold rounded ${activeTab === 'existing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-200'}`}
          >
            Existing Patient
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('new')}
            className={`flex-1 py-1 text-xs font-semibold rounded ${activeTab === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-200'}`}
          >
            New Patient
          </button>
        </div>
      )}

      {existingOnly || activeTab === 'existing' ? (
        <div className="space-y-2">
          {value.patientId ? (
            <div className="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded">
              <div>
                <span className="block text-xs font-semibold text-indigo-900">{value.patientName}</span>
                <span className="block text-[10px] text-indigo-700 font-mono select-all">ID: {value.patientId}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange({ isNew: false, patientId: '', patientName: '' })}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600">Search Patient Name</label>
              <div className="flex items-center mt-1 relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900 pr-8"
                />
                {loadingSearch && (
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">...</span>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectExisting(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 border-b border-slate-100 last:border-0 block"
                    >
                      <span className="font-semibold block text-slate-800">{p.name}</span>
                      <span className="text-[10px] block text-slate-500 font-mono">{p.id}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && !loadingSearch && searchResults.length === 0 && (
                <p className="text-[10px] text-slate-500 mt-1 italic">No matches found.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Full Name</label>
            <input
              type="text"
              required
              value={value.patientName}
              onChange={(e) => onChange({ ...value, patientName: e.target.value })}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
            />
          </div>
          {showDetailsFields && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={value.dateOfBirth || ''}
                    onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Gender</label>
                  <select
                    value={value.gender || 'Male'}
                    onChange={(e) => onChange({ ...value, gender: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs bg-white text-slate-900 font-medium"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Phone</label>
                  <input
                    type="text"
                    value={value.contactPhone || ''}
                    onChange={(e) => onChange({ ...value, contactPhone: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    value={value.contactEmail || ''}
                    onChange={(e) => onChange({ ...value, contactEmail: e.target.value })}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-500 font-semibold italic bg-amber-50 border border-amber-100 p-1.5 rounded">
            ID will be automatically generated by the server on submission.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ userId: '', role: '', password: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('segue_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('segue_user');
          localStorage.removeItem('segue_token');
        }
      }
    }
  }, []);

  // States for data
  const [records, setRecords] = useState<EMRRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);

  // Patient Portal Specific Data States
  const [allergiesList, setAllergiesList] = useState<any[]>([]);
  const [problemsList, setProblemsList] = useState<any[]>([]);
  const [refillRequests, setRefillRequests] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [apiKeysList, setApiKeysList] = useState<any[]>([]);

  // Patient Intake States
  const [intakesList, setIntakesList] = useState<any[]>([]);
  const [selectedIntake, setSelectedIntake] = useState<any | null>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  // Forms
  const [uploadForm, setUploadForm] = useState({ patientId: '', patientName: '', recordType: 'Report', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCCDAFile, setSelectedCCDAFile] = useState<File | null>(null);
  const [grantAccessForm, setGrantAccessForm] = useState({ recordId: '', doctorId: '' });
  const [appointmentForm, setAppointmentForm] = useState({ patientId: '', patientName: '', doctorId: 'DR-dr.smith', doctorName: 'Dr. Smith', scheduledTime: '', notes: '', status: 'scheduled' });
  const [rxForm, setRxForm] = useState({ patientId: '', patientName: '', medName: '', dosage: '', frequency: '', duration: '' });
  const [vitalsHistory, setVitalsHistory] = useState<Vitals[]>([]);
  const [vitalsForm, setVitalsForm] = useState({ temperature: '', bloodPressure: '', pulse: '', spo2: '' });
  const [selectedAptForVitals, setSelectedAptForVitals] = useState<any | null>(null);

  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [selectedAptForNote, setSelectedAptForNote] = useState<any | null>(null);
  const [soapNote, setSoapNote] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [patientVitals, setPatientVitals] = useState<Vitals[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medForm, setMedForm] = useState({ name: '', stock: '', reorderThreshold: '10', expiryDate: '' });
  const [systemSettings, setSystemSettings] = useState<Setting[]>([]);
  const [newSettingForm, setNewSettingForm] = useState({ key: '', value: '' });
  const [selectedLabForResults, setSelectedLabForResults] = useState<any | null>(null);
  const [labResultsForm, setLabResultsForm] = useState({ resultSummary: '', cholesterol: '', hemoglobin: '', glucose: '' });
  const [orgDetails, setOrgDetails] = useState<any | null>(null);
  const [orgStaff, setOrgStaff] = useState<User[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingRolePermissions, setEditingRolePermissions] = useState({ role: 'doctor', permissions: '' });
  const [labForm, setLabForm] = useState({ patientId: '', patientName: '', testName: '', notes: '' });
  const [invoiceForm, setInvoiceForm] = useState({ patientId: '', patientName: '', amount: '' });

  // Patient Picker State hooks
  const [appointmentPicker, setAppointmentPicker] = useState<PatientPickerValue>({
    isNew: false,
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactPhone: '',
    contactEmail: ''
  });

  const [invoicePicker, setInvoicePicker] = useState<PatientPickerValue>({
    isNew: false,
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactPhone: '',
    contactEmail: ''
  });

  const [rxPicker, setRxPicker] = useState<PatientPickerValue>({
    isNew: false,
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactPhone: '',
    contactEmail: ''
  });

  const [labPicker, setLabPicker] = useState<PatientPickerValue>({
    isNew: false,
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactPhone: '',
    contactEmail: ''
  });

  const [isRxPrefilled, setIsRxPrefilled] = useState(false);
  const [isLabPrefilled, setIsLabPrefilled] = useState(false);

  // Intake Form
  const [intakeForm, setIntakeForm] = useState({
    patientId: '',
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    maritalStatus: 'Single',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    employerDetails: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    preferredLanguage: 'English',
    ethnicity: '',
    hipaaConsent: false,
    doctorId: '',
    reasonForVisit: '',
    symptoms: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    vitals: {
      bloodPressure: '',
      pulse: 72,
      temperature: 98.6,
      height: 170,
      weight: 70,
      bmi: 24.2,
      spo2: 98
    }
  });

  // Patient Portal Forms
  const [allergyForm, setAllergyForm] = useState({ allergen: '', severity: 'mild', reaction: '' });
  const [problemForm, setProblemForm] = useState({ code: '', description: '', onsetDate: '' });
  const [refillForm, setRefillForm] = useState({ prescriptionId: '', notes: '' });
  const [keyForm, setKeyForm] = useState({ name: '', durationDays: 30 });
  const [chatInput, setChatInput] = useState('');
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('1. Login handler function triggered');
    const trimmedUserId = (loginForm.userId || '').trim();
    if (trimmedUserId && loginForm.role && loginForm.password) {
      setLoading(true);
      try {
        const orgName = loginForm.role === 'patient' ? 'patient' : 'hospital';
        const res = await api.login(trimmedUserId, orgName, loginForm.role, loginForm.password) as any;
        console.log('2. Axios API response received:', res);

        // The backend returns success, token, and user at the top level, but the 
        // original code expected them inside a `data` object (res.data).
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user;

        if (res.success && token && user) {
          localStorage.setItem('segue_token', token);
          localStorage.setItem('segue_user', JSON.stringify(user));
          console.log('3. Token localStorage storage successful:', { tokenSet: !!token });

          console.log('4/5/6/7. Dashboard rendering approach:');
          console.log('- No next/router or next/navigation router.push is executed.');
          console.log('- App Router (app/page.tsx) is being used as a Single Page Application (SPA).');
          console.log('- There is no separate /dashboard route.');
          console.log('- Role-based conditions and dashboard UI are handled via state (currentUser).');

          setCurrentUser(user);
          showToast(`Logged in successfully as ${user.fullName || user.userId}`);
        } else {
          console.log('Login failed: Response missing success, token, or user', res);
          showToast(res.error || 'Login failed', true);
        }
      } catch (err: any) {
        console.error('Login error', err);
        const errMsg = err.response?.data?.error || err.message || 'Login failed';
        showToast(errMsg, true);
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Please fill in all fields including password', true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('segue_token');
    localStorage.removeItem('segue_user');
    setCurrentUser(null);
    setLoginForm({ userId: '', role: '', password: '' });
    // Reset data
    setRecords([]);
    setAppointments([]);
    setPrescriptions([]);
    setLabOrders([]);
    setInvoices([]);
    setUsers([]);
    setAnalytics(null);
    setNotifications([]);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  // Data Fetchers
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { role, userId, orgName } = currentUser;

      if (role === 'patient') {
        const [recRes, aptsRes, rxRes, labsRes, invRes, algRes, prbRes, rflRes, msgRes, keysRes, notifRes] = await Promise.all([
          api.getPatientRecords(userId, userId, orgName),
          api.listAppointments({ patientId: userId }),
          api.listPrescriptions({ patientId: userId }),
          api.listLabOrders({ patientId: userId }),
          api.listInvoices({ patientId: userId }),
          api.getAllergies(userId),
          api.getProblems(userId),
          api.listRefillRequests(userId),
          api.getMessages(userId, 'dr.smith'),
          api.getApiKeys(userId),
          api.listNotifications()
        ]);
        setRecords(recRes.data || []);
        setAppointments(aptsRes.data || []);
        setPrescriptions(rxRes.data || []);
        setLabOrders(labsRes.data || []);
        setInvoices(invRes.data || []);
        setAllergiesList(algRes.data || []);
        setProblemsList(prbRes.data || []);
        setRefillRequests(rflRes.data || []);
        setChatMessages(msgRes.data || []);
        setApiKeysList(keysRes.data || []);
        setNotifications(notifRes.data || []);
      } else if (role === 'doctor') {
        const [recordsRes, aptsRes, rxRes, labsRes, intakeRes, notifRes] = await Promise.all([
          api.getPatientRecords(userId, userId, orgName),
          api.listAppointments({ doctorId: userId }),
          api.listPrescriptions({ doctorId: userId }),
          api.listLabOrders({ doctorId: userId }),
          api.listIntakes({ doctorId: userId }),
          api.listNotifications()
        ]);
        setRecords(recordsRes.data || []);
        setAppointments(aptsRes.data || []);
        setPrescriptions(rxRes.data || []);
        setLabOrders(labsRes.data || []);
        setIntakesList(intakeRes.data || []);
        setNotifications(notifRes.data || []);
      } else if (role === 'nurse') {
        const aptsRes = await api.listAppointments();
        setAppointments(aptsRes.data || []);
      } else if (role === 'receptionist') {
        const [aptsRes, invRes, intakeRes] = await Promise.all([
          api.listAppointments(),
          api.listInvoices(),
          api.listIntakes()
        ]);
        setAppointments(aptsRes.data || []);
        setInvoices(invRes.data || []);
        setIntakesList(intakeRes.data || []);
      } else if (role === 'lab_technician') {
        const labsRes = await api.listLabOrders();
        setLabOrders(labsRes.data || []);
      } else if (role === 'pharmacist') {
        const rxRes = await api.listPrescriptions();
        setPrescriptions(rxRes.data || []);
      } else if (role === 'admin_staff' || role === 'admin') {
        // Admin user list mock/fetch
        setUsers([
          { userId: 'dr.smith', role: 'doctor', orgName: 'hospital', status: 'active' },
          { userId: 'patient123', role: 'patient', orgName: 'patient', status: 'active' },
          { userId: 'nurse.jones', role: 'nurse', orgName: 'hospital', status: 'active' },
          { userId: 'lab.tech', role: 'lab_technician', orgName: 'hospital', status: 'active' }
        ]);
      } else if (role === 'management') {
        const res = await api.getAnalyticsOverview();
        setAnalytics(res.data || {
          totalRecords: 12,
          totalAppointments: 24,
          totalPrescriptions: 18,
          totalLabOrders: 9,
          totalRevenue: 2450.00
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch dashboard data', true);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Operations
  const handleUploadEHR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) {
      showToast('Please select a file to upload', true);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patientId', uploadForm.patientId || currentUser.userId);
    formData.append('patientName', uploadForm.patientName);
    formData.append('recordType', uploadForm.recordType);
    formData.append('description', uploadForm.description);

    try {
      setLoading(true);
      await api.uploadEHR(formData);
      showToast('EMR Record uploaded and securely stored on Azure Blob Storage');
      setUploadForm({ patientId: '', patientName: '', recordType: 'Report', description: '' });
      setSelectedFile(null);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Upload failed', true);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.grantAccess(grantAccessForm.recordId, currentUser.userId, grantAccessForm.doctorId);
      showToast(`Access granted to Dr. ${grantAccessForm.doctorId}`);
      setGrantAccessForm({ recordId: '', doctorId: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.addAllergy({ patientId: currentUser.userId, ...allergyForm });
      showToast('Allergy added successfully');
      setAllergyForm({ allergen: '', severity: 'mild', reaction: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.addProblem({ patientId: currentUser.userId, ...problemForm });
      showToast('Problem condition added successfully');
      setProblemForm({ code: '', description: '', onsetDate: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalPatientId = intakeForm.patientId;
      let finalPatientName = intakeForm.name;

      if (!finalPatientId) {
        if (!finalPatientName.trim()) {
          showToast('Patient Name is required for check-in', true);
          return;
        }
        const regRes = await api.registerPatient({
          name: finalPatientName,
          dateOfBirth: intakeForm.dateOfBirth || undefined,
          gender: intakeForm.gender || undefined,
          contactPhone: intakeForm.contactPhone || undefined,
          contactEmail: intakeForm.contactEmail || undefined
        });
        finalPatientId = regRes.data.id;
        finalPatientName = regRes.data.name;
      }

      const { name: _, ...intakePayload } = intakeForm;
      await api.createIntake({
        ...intakePayload,
        patientId: finalPatientId,
        patientName: finalPatientName
      });
      showToast('Patient Intake complete and checked in successfully.');
      setIntakeForm({
        patientId: '',
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        maritalStatus: 'Single',
        contactPhone: '',
        contactEmail: '',
        emergencyContact: '',
        employerDetails: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        preferredLanguage: 'English',
        ethnicity: '',
        hipaaConsent: false,
        doctorId: '',
        reasonForVisit: '',
        symptoms: '',
        medicalHistory: '',
        allergies: '',
        medications: '',
        vitals: {
          bloodPressure: '',
          pulse: 72,
          temperature: 98.6,
          height: 170,
          weight: 70,
          bmi: 24.2,
          spo2: 98
        }
      });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Check-in failed', true);
    }
  };

  const handleUpdateIntakeStatus = async (id: string, status: string) => {
    try {
      await api.updateIntakeStatus(id, status);
      showToast(`Patient status set to ${status}`);
      fetchData();
      if (selectedIntake && selectedIntake.id === id) {
        setSelectedIntake((prev: any) => ({ ...prev, status }));
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Status update failed', true);
    }
  };

  const handleUpdateIntakeDetails = async (id: string, fields: any) => {
    if (!currentUser) return;
    try {
      await api.updateIntake(id, { ...fields, changedBy: currentUser.userId });
      showToast('Intake record updated and changes audited');
      fetchData();

      // Reload audit history
      const historyRes = await api.getIntakeAuditHistory(id);
      setAuditHistory(historyRes.data || []);

      if (selectedIntake && selectedIntake.id === id) {
        setSelectedIntake((prev: any) => ({ ...prev, ...fields }));
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Update failed', true);
    }
  };

  const handleFetchAuditHistory = async (id: string) => {
    try {
      const res = await api.getIntakeAuditHistory(id);
      setAuditHistory(res.data || []);
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Failed to fetch history logs', true);
    }
  };

  const handleRequestRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requestRefill(refillForm);
      showToast('Refill request submitted');
      setRefillForm({ prescriptionId: '', notes: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !chatInput.trim()) return;
    try {
      await api.sendMessage({ senderId: currentUser.userId, receiverId: 'dr.smith', content: chatInput });
      setChatInput('');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await api.generateApiKey({ patientId: currentUser.userId, keyName: keyForm.name, durationDays: keyForm.durationDays });
      setGeneratedKeyResult(res.data?.apiKey || null);
      showToast('API Key generated successfully');
      setKeyForm({ name: '', durationDays: 30 });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleImportCCDA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedCCDAFile) {
      showToast('Please select a CCDA XML file', true);
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedCCDAFile);
    formData.append('patientId', currentUser.userId);

    try {
      setLoading(true);
      await api.importCCDA(formData);
      showToast('CCDA Document successfully imported and parsed.');
      setSelectedCCDAFile(null);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Import failed', true);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (recordId: string, doctorId: string) => {
    if (!currentUser) return;
    try {
      await api.revokeAccess(recordId, currentUser.userId, doctorId);
      showToast(`Access revoked from Dr. ${doctorId}`);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalPatientId = appointmentPicker.patientId;
      let finalPatientName = appointmentPicker.patientName;

      if (appointmentPicker.isNew) {
        if (!finalPatientName.trim()) {
          showToast('Patient Name is required for booking', true);
          return;
        }
        const regRes = await api.registerPatient({
          name: finalPatientName,
          dateOfBirth: appointmentPicker.dateOfBirth || undefined,
          gender: appointmentPicker.gender || undefined,
          contactPhone: appointmentPicker.contactPhone || undefined,
          contactEmail: appointmentPicker.contactEmail || undefined
        });
        finalPatientId = regRes.data.id;
        finalPatientName = regRes.data.name;
      } else {
        if (!finalPatientId) {
          showToast('Please select an existing patient or register a new one', true);
          return;
        }
      }

      await api.createAppointment({
        ...appointmentForm,
        patientId: finalPatientId,
        patientName: finalPatientName,
        status: appointmentForm.status as any
      });
      showToast('Appointment successfully scheduled');
      setAppointmentForm({ patientId: '', patientName: '', doctorId: 'DR-dr.smith', doctorName: 'Dr. Smith', scheduledTime: '', notes: '', status: 'scheduled' });
      setAppointmentPicker({
        isNew: false,
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: 'Male',
        contactPhone: '',
        contactEmail: ''
      });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleUpdateAptStatus = async (id: string, status: 'check-in' | 'completed' | 'cancelled' | 'scheduled' | 'waitlisted') => {
    try {
      await api.updateAppointment(id, { status });
      showToast(`Appointment status updated to ${status}`);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      let finalPatientId = rxPicker.patientId;
      let finalPatientName = rxPicker.patientName;

      if (rxPicker.isNew) {
        if (!finalPatientName.trim()) {
          showToast('Patient Name is required for prescription', true);
          return;
        }
        const regRes = await api.registerPatient({
          name: finalPatientName,
          dateOfBirth: rxPicker.dateOfBirth || undefined,
          gender: rxPicker.gender || undefined,
          contactPhone: rxPicker.contactPhone || undefined,
          contactEmail: rxPicker.contactEmail || undefined
        });
        finalPatientId = regRes.data.id;
        finalPatientName = regRes.data.name;
      } else {
        if (!finalPatientId) {
          showToast('Please select an existing patient or register a new one', true);
          return;
        }
      }

      await api.createPrescription({
        patientId: finalPatientId,
        patientName: finalPatientName,
        doctorId: currentUser.userId,
        medicationDetails: `${rxForm.medName} | ${rxForm.dosage} | ${rxForm.frequency} | ${rxForm.duration}`,
        dosage: rxForm.dosage,
        duration: rxForm.duration
      });
      showToast('Prescription successfully created');
      setRxForm({ patientId: '', patientName: '', medName: '', dosage: '', frequency: '', duration: '' });
      setRxPicker({
        isNew: false,
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: 'Male',
        contactPhone: '',
        contactEmail: ''
      });
      setIsRxPrefilled(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleDispensePrescription = async (id: string) => {
    if (!currentUser) return;
    try {
      await api.dispensePrescription(id, currentUser.userId);
      showToast('Prescription successfully marked as dispensed');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'doctor') {
      const delayDebounce = setTimeout(() => {
        api.listAppointments({ doctorId: currentUser.userId, search: doctorSearchQuery })
          .then(res => {
            if (res.success && res.data) {
              setAppointments(res.data);
            }
          })
          .catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [doctorSearchQuery, currentUser]);

  useEffect(() => {
    if (selectedAptForNote) {
      api.getClinicalNote(selectedAptForNote.id)
        .then(res => {
          if (res.success && res.data) {
            setSoapNote({
              subjective: res.data.soapSubjective || '',
              objective: res.data.soapObjective || '',
              assessment: res.data.soapAssessment || '',
              plan: res.data.soapPlan || ''
            });
          } else {
            setSoapNote({ subjective: '', objective: '', assessment: '', plan: '' });
          }
        })
        .catch(() => {
          setSoapNote({ subjective: '', objective: '', assessment: '', plan: '' });
        });

      api.listVitals(selectedAptForNote.patientId)
        .then(res => {
          if (res.success && res.data) {
            setPatientVitals(res.data);
          } else {
            setPatientVitals([]);
          }
        })
        .catch(() => setPatientVitals([]));
    }
  }, [selectedAptForNote]);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedAptForVitals) return;
    try {
      await api.addVitals({
        patientId: selectedAptForVitals.patientId,
        appointmentId: selectedAptForVitals.id,
        temperature: Number(vitalsForm.temperature) || undefined,
        bloodPressure: vitalsForm.bloodPressure,
        pulse: Number(vitalsForm.pulse) || undefined,
        spo2: Number(vitalsForm.spo2) || undefined,
        recordedBy: currentUser.userId
      });
      showToast('Vitals successfully recorded');
      setVitalsForm({ temperature: '', bloodPressure: '', pulse: '', spo2: '' });
      const res = await api.listVitals(selectedAptForVitals.patientId);
      if (res.success && res.data) {
        setVitalsHistory(res.data);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleSaveClinicalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedAptForNote) return;
    try {
      await api.createClinicalNote({
        appointmentId: selectedAptForNote.id,
        patientId: selectedAptForNote.patientId,
        doctorId: currentUser.userId,
        soapSubjective: soapNote.subjective,
        soapObjective: soapNote.objective,
        soapAssessment: soapNote.assessment,
        soapPlan: soapNote.plan,
        recordedBy: currentUser.userId
      });
      showToast('Clinical SOAP Note successfully saved');
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.addOrUpdateMedicine({
        ...medForm,
        stock: Number(medForm.stock),
        reorderThreshold: Number(medForm.reorderThreshold),
        updatedBy: currentUser.userId
      });
      showToast('Medicine inventory updated');
      setMedForm({ name: '', stock: '', reorderThreshold: '10', expiryDate: '' });
      const res = await api.listMedicines();
      if (res.success && res.data) {
        setMedicines(res.data);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSetting(newSettingForm.key, newSettingForm.value);
      showToast('Setting updated successfully');
      setNewSettingForm({ key: '', value: '' });
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSystemSettings(res.data);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newDepartmentName) return;
    try {
      await api.addOrgDepartment(currentUser.orgName, newDepartmentName);
      showToast('Department added successfully');
      setNewDepartmentName('');
      const orgRes = await api.getOrganizationDetails(currentUser.orgName);
      if (orgRes.success && orgRes.data) {
        setOrgDetails(orgRes.data.org);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const permsArray = editingRolePermissions.permissions.split(',').map(p => p.trim()).filter(Boolean);
      await api.updateAccessRules({
        orgName: currentUser.orgName,
        role: editingRolePermissions.role,
        permissions: permsArray
      });
      showToast(`Permissions updated for ${editingRolePermissions.role}`);
      setEditingRolePermissions({ role: 'doctor', permissions: '' });
      const orgRes = await api.getOrganizationDetails(currentUser.orgName);
      if (orgRes.success && orgRes.data) {
        setOrgDetails(orgRes.data.org);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleSaveLabResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedLabForResults) return;
    try {
      await api.uploadLabResult(selectedLabForResults.id, {
        resultSummary: labResultsForm.resultSummary,
        resultFields: {
          cholesterol: labResultsForm.cholesterol ? Number(labResultsForm.cholesterol) : undefined,
          hemoglobin: labResultsForm.hemoglobin ? Number(labResultsForm.hemoglobin) : undefined,
          glucose: labResultsForm.glucose ? Number(labResultsForm.glucose) : undefined
        },
        processedBy: currentUser.userId
      });
      showToast('Lab results successfully uploaded');
      setSelectedLabForResults(null);
      setLabResultsForm({ resultSummary: '', cholesterol: '', hemoglobin: '', glucose: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleCreateLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      let finalPatientId = labPicker.patientId;
      let finalPatientName = labPicker.patientName;

      if (labPicker.isNew) {
        if (!finalPatientName.trim()) {
          showToast('Patient Name is required for lab order', true);
          return;
        }
        const regRes = await api.registerPatient({
          name: finalPatientName,
          dateOfBirth: labPicker.dateOfBirth || undefined,
          gender: labPicker.gender || undefined,
          contactPhone: labPicker.contactPhone || undefined,
          contactEmail: labPicker.contactEmail || undefined
        });
        finalPatientId = regRes.data.id;
        finalPatientName = regRes.data.name;
      } else {
        if (!finalPatientId) {
          showToast('Please select an existing patient or register a new one', true);
          return;
        }
      }

      await api.createLabOrder({
        patientId: finalPatientId,
        patientName: finalPatientName,
        doctorId: currentUser.userId,
        testName: labForm.testName,
        notes: labForm.notes
      });
      showToast('Laboratory order submitted');
      setLabForm({ patientId: '', patientName: '', testName: '', notes: '' });
      setLabPicker({
        isNew: false,
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: 'Male',
        contactPhone: '',
        contactEmail: ''
      });
      setIsLabPrefilled(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleUpdateLabStatus = async (id: string, status: 'processing' | 'completed') => {
    if (!currentUser) return;
    try {
      await api.updateLabOrderStatus(id, status, currentUser.userId);
      showToast(`Lab order status updated to ${status}`);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      let finalPatientId = invoicePicker.patientId;
      let finalPatientName = invoicePicker.patientName;

      if (invoicePicker.isNew) {
        if (!finalPatientName.trim()) {
          showToast('Patient Name is required for invoice', true);
          return;
        }
        const regRes = await api.registerPatient({
          name: finalPatientName,
          dateOfBirth: invoicePicker.dateOfBirth || undefined,
          gender: invoicePicker.gender || undefined,
          contactPhone: invoicePicker.contactPhone || undefined,
          contactEmail: invoicePicker.contactEmail || undefined
        });
        finalPatientId = regRes.data.id;
        finalPatientName = regRes.data.name;
      } else {
        if (!finalPatientId) {
          showToast('Please select an existing patient or register a new one', true);
          return;
        }
      }

      await api.createInvoice({
        patientId: finalPatientId,
        patientName: finalPatientName,
        amount: parseFloat(invoiceForm.amount),
        status: 'unpaid'
      });
      showToast('Invoice generated successfully');
      setInvoiceForm({ patientId: '', patientName: '', amount: '' });
      setInvoicePicker({
        isNew: false,
        patientId: '',
        patientName: '',
        dateOfBirth: '',
        gender: 'Male',
        contactPhone: '',
        contactEmail: ''
      });
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handlePayInvoice = async (id: string) => {
    if (!currentUser) return;
    try {
      await api.markInvoicePaid(id, currentUser.userId);
      showToast('Invoice marked as paid');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleDownloadRecord = async (record: EMRRecord) => {
    if (!currentUser) return;
    try {
      const blob = await api.viewEHR(record.recordId, currentUser.userId, currentUser.orgName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.recordType}_${record.recordId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('File downloaded and decrypted successfully');
    } catch (error: any) {
      showToast('Download failed: ' + error.message, true);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.isError ? 'bg-red-600' : 'bg-emerald-600'}`}>
            {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        )}
        <div className="w-full max-w-md space-y-8 bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-2xl">
              🏥
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              SegueEMR
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Professional Practice Management &amp; Health Records
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                  User ID / Username
                </label>
                <input
                  id="userId"
                  type="text"
                  required
                  placeholder="e.g. patient123 or dr.smith"
                  value={loginForm.userId}
                  onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                  Select Role
                </label>
                <select
                  id="role"
                  required
                  value={loginForm.role}
                  onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                >
                  <option value="">-- Choose your role --</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab_technician">Laboratory Technician</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin_staff">Administrative Staff</option>
                  <option value="management">Healthcare Management</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
              >
                Sign In Securely
              </button>
            </div>
          </form>

          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Demo Accounts:</p>
            <p>• Patient ID: <code className="bg-slate-200 px-1 py-0.5 rounded">patient123</code></p>
            <p>• Doctor ID: <code className="bg-slate-200 px-1 py-0.5 rounded">dr.smith</code></p>
            <p>• Other roles: Any ID can be used to simulate staff profiles.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.isError ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-indigo-600">🏥</span> SegueEMR
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>{currentUser.userId}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 border border-slate-200">
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
              </div>

              {/* Notification Badge / Dropdown (Doctor & Patient only) */}
              {(currentUser.role === 'doctor' || currentUser.role === 'patient') && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="relative p-1 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none rounded-full"
                    title="In-app alerts"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </button>

                  {showNotificationsDropdown && (
                    <div className="absolute right-0 mt-2 w-80 rounded-md bg-white border border-slate-200 shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-700">
                          Notifications ({notifications.filter(n => !n.read).length} unread)
                        </span>
                        {notifications.some(n => !n.read) && (
                          <button
                            onClick={() => {
                              handleMarkAllNotificationsRead();
                              setShowNotificationsDropdown(false);
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-0 cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-xs text-slate-400 text-center">
                            No notifications
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                handleMarkNotificationRead(notif.id);
                                setShowNotificationsDropdown(false);
                                if (currentUser.role === 'doctor') {
                                  if (notif.recordType === 'LabOrder') {
                                    setActiveTab('labs');
                                  } else if (notif.recordType === 'Prescription') {
                                    setActiveTab('prescriptions');
                                  }
                                } else if (currentUser.role === 'patient') {
                                  if (notif.recordType === 'LabOrder' || notif.recordType === 'Prescription') {
                                    setActiveTab('clinical');
                                  }
                                }
                              }}
                              className={`px-4 py-3 border-b border-slate-50 text-xs text-left cursor-pointer hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/30 font-medium' : ''}`}
                            >
                              <div className="text-slate-700">{notif.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">

        {/* Patient Dashboard */}
        {currentUser.role === 'patient' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Welcome, {currentUser.userId}</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and access your medical record trail, physician consultations, payments, and integrations.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Overview &amp; EMRs
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'consultations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Consultations ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('clinical')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'clinical' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Clinical Health (Problems &amp; Allergies)
              </button>
              <button
                onClick={() => setActiveTab('refills')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'refills' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Medication Refills
              </button>
              <button
                onClick={() => setActiveTab('messaging')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'messaging' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Secure Messaging
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Payments &amp; Invoices
              </button>
              <button
                onClick={() => setActiveTab('integration')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'integration' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Developer Integration
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md"><FileText className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total EMR Records</p>
                      <p className="text-2xl font-semibold text-slate-900">{records.length}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-md"><AlertCircle className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Allergies</p>
                      <p className="text-2xl font-semibold text-slate-900">{allergiesList.length}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md"><Shield className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Clinical Conditions</p>
                      <p className="text-2xl font-semibold text-slate-900">{problemsList.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Upload EMR Form */}
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                      <FilePlus className="h-5 w-5 text-indigo-600" /> Upload Health Record
                    </h2>
                    <form onSubmit={handleUploadEHR} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Patient Name</label>
                        <input
                          type="text"
                          required
                          value={uploadForm.patientName}
                          onChange={(e) => setUploadForm({ ...uploadForm, patientName: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Record Type</label>
                        <select
                          value={uploadForm.recordType}
                          onChange={(e) => setUploadForm({ ...uploadForm, recordType: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                        >
                          <option value="Report">Report</option>
                          <option value="Prescription">Prescription</option>
                          <option value="X-Ray">X-Ray</option>
                          <option value="MRI">MRI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Description</label>
                        <textarea
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">File Attachment</label>
                        <input
                          type="file"
                          required
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300"
                      >
                        {loading ? 'Uploading...' : 'Store Securely'}
                      </button>
                    </form>
                  </div>

                  {/* EMR Records table */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-5 w-5 text-indigo-600" /> Electronic Records (Azure Blob Storage)
                    </h2>
                    {records.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">No EMR records uploaded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Record ID</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Uploaded</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {records.map((r) => (
                              <tr key={r.recordId}>
                                <td className="px-4 py-3 text-sm font-mono text-slate-700">{r.recordId.substring(0, 10)}...</td>
                                <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{r.recordType}</td>
                                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{r.description}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{new Date(r.uploadDate || '').toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right text-sm">
                                  <button
                                    onClick={() => handleDownloadRecord(r)}
                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-semibold"
                                  >
                                    <Download className="h-4 w-4" /> Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CONSULTATIONS TAB */}
            {activeTab === 'consultations' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="h-5 w-5 text-indigo-600" /> Book Appointment
                  </h2>
                  <form onSubmit={handleCreateAppointment} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Patient ID</label>
                      <input
                        type="text"
                        required
                        value={appointmentForm.patientId}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Patient Name</label>
                      <input
                        type="text"
                        required
                        value={appointmentForm.patientName}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Physician ID</label>
                      <input
                        type="text"
                        required
                        value={appointmentForm.doctorId}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Physician Name</label>
                      <input
                        type="text"
                        required
                        value={appointmentForm.doctorName}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Date/Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={appointmentForm.scheduledTime}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledTime: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Notes</label>
                      <textarea
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Book Consultation
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Consultation History</h2>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No appointments scheduled.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Physician</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Scheduled Time</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {appointments.map((apt) => (
                            <tr key={apt.id}>
                              <td className="px-4 py-3 text-sm text-slate-900 font-semibold">Dr. {apt.doctorName || apt.doctorId}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(apt.scheduledTime).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                      'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                  {apt.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {apt.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleUpdateAptStatus(apt.id, 'cancelled')}
                                    className="text-rose-600 hover:text-rose-900 font-semibold"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CLINICAL HEALTH TAB */}
            {activeTab === 'clinical' && (
              <div className="space-y-6">
                {/* CCDA Import/Export section */}
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">Export Health Summary (CCDA)</h3>
                    <p className="text-sm text-slate-500 mb-4">Download a standards-compliant CCDA XML document mapping your allergies, conditions, and demographic details.</p>
                    <a
                      href={`http://localhost:3000/api/patient/ccda/export/${currentUser.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-slate-900 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4" /> Export XML Summary
                    </a>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">Import Continuity Document (CCDA)</h3>
                    <p className="text-sm text-slate-500 mb-2">Upload a clinical XML document to automatically parse and synchronize allergy entries.</p>
                    <form onSubmit={handleImportCCDA} className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".xml"
                        required
                        onChange={(e) => setSelectedCCDAFile(e.target.files?.[0] || null)}
                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700"
                      >
                        Import XML
                      </button>
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Allergies panel */}
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><AlertCircle className="h-5 w-5 text-indigo-600" /> Clinical Allergies</h2>
                    </div>

                    <form onSubmit={handleAddAllergy} className="bg-slate-50 p-4 border border-slate-200 rounded-lg grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Allergen</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Penicillin"
                          value={allergyForm.allergen}
                          onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Severity</label>
                        <select
                          value={allergyForm.severity}
                          onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value as any })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-sm bg-white"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Reaction description..."
                          value={allergyForm.reaction}
                          onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-sm bg-white"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    {allergiesList.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">No documented allergies.</p>
                    ) : (
                      <div className="space-y-3">
                        {allergiesList.map((alg) => (
                          <div key={alg.id} className="border border-slate-200 p-3 rounded-lg flex items-center justify-between bg-slate-50/50">
                            <div>
                              <p className="font-semibold text-slate-800">{alg.allergen}</p>
                              {alg.reaction && <p className="text-xs text-slate-500 mt-0.5">Reaction: {alg.reaction}</p>}
                            </div>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${alg.severity === 'severe' ? 'bg-red-50 text-red-800 border-red-200' :
                                alg.severity === 'moderate' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-100 text-slate-800 border-slate-200'
                              }`}>
                              {alg.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conditions/Problems panel */}
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><Shield className="h-5 w-5 text-indigo-600" /> Active Medical Problems</h2>

                    <form onSubmit={handleAddProblem} className="bg-slate-50 p-4 border border-slate-200 rounded-lg grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">ICD-10 Code</label>
                        <input
                          type="text"
                          placeholder="e.g. I10"
                          value={problemForm.code}
                          onChange={(e) => setProblemForm({ ...problemForm, code: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Description</label>
                        <input
                          type="text"
                          required
                          placeholder="Condition..."
                          value={problemForm.description}
                          onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-sm bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          required
                          value={problemForm.onsetDate}
                          onChange={(e) => setProblemForm({ ...problemForm, onsetDate: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1 text-xs bg-white"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    {problemsList.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">No active conditions reported.</p>
                    ) : (
                      <div className="space-y-3">
                        {problemsList.map((prb) => (
                          <div key={prb.id} className="border border-slate-200 p-3 rounded-lg flex items-center justify-between bg-slate-50/50">
                            <div>
                              <p className="font-semibold text-slate-800">{prb.description}</p>
                              {prb.onset_date && <p className="text-xs text-slate-500 mt-0.5">Onset: {new Date(prb.onset_date).toLocaleDateString()}</p>}
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                              {prb.status || 'active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REFILLS TAB */}
            {activeTab === 'refills' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><Pill className="h-5 w-5 text-indigo-600" /> Request Med Refill</h2>
                  <form onSubmit={handleRequestRefill} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Select Prescription ID</label>
                      <input
                        type="text"
                        required
                        placeholder="Copy Prescription ID from EMR"
                        value={refillForm.prescriptionId}
                        onChange={(e) => setRefillForm({ ...refillForm, prescriptionId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Additional Notes / Refill Quantity</label>
                      <textarea
                        placeholder="Refill count details..."
                        value={refillForm.notes}
                        onChange={(e) => setRefillForm({ ...refillForm, notes: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-1"
                    >
                      Request Refill
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Refill Request History</h2>
                  {refillRequests.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No refill requests tracked.</p>
                  ) : (
                    <div className="space-y-4">
                      {refillRequests.map((req) => (
                        <div key={req.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">Prescription: {req.prescription_id}</p>
                            {req.notes && <p className="text-sm text-slate-500 mt-1">Notes: {req.notes}</p>}
                          </div>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              req.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECURE MESSAGING TAB */}
            {activeTab === 'messaging' && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                {/* Contacts pane */}
                <div className="border-r border-slate-200 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800">Support Contacts</h3>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3 cursor-pointer">
                    <span className="text-xl">👨‍⚕️</span>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Dr. smith</p>
                      <p className="text-xs text-indigo-500">Primary Physician</p>
                    </div>
                  </div>
                </div>

                {/* Chat window pane */}
                <div className="md:col-span-2 flex flex-col justify-between p-4">
                  <div className="space-y-4 overflow-y-auto max-h-[380px] p-2 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-400 text-center text-xs py-12">Send a message to start a conversation with Dr. smith.</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col max-w-xs p-3 rounded-lg ${msg.sender_id === currentUser.userId ? 'bg-indigo-600 text-white ml-auto' : 'bg-white border border-slate-200 text-slate-800'}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <span className="text-[10px] mt-1 text-right opacity-80">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a secure message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-indigo-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* BILLING AND PAYMENTS TAB */}
            {activeTab === 'billing' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Invoice Billings &amp; Payment Logs</h2>
                {invoices.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No bills recorded.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Billing ID</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Total Amount</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Transaction Date</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="px-4 py-3 text-sm font-mono text-slate-700">{inv.id.substring(0, 12)}...</td>
                            <td className="px-4 py-3 text-sm text-slate-900 font-semibold">${inv.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleString() : '-'}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              {inv.status === 'unpaid' ? (
                                <button
                                  onClick={() => handlePayInvoice(inv.id)}
                                  className="bg-indigo-600 text-white rounded px-3 py-1 text-xs font-semibold hover:bg-indigo-700"
                                >
                                  💳 Pay Now
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs font-semibold">Payment Received</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* INTEGRATION TAB */}
            {activeTab === 'integration' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><Lock className="h-5 w-5 text-indigo-600" /> Generate Third-Party API Key</h2>
                  <p className="text-xs text-slate-500">Provide developers or integrations with access to sync data via the portal SDK API.</p>

                  <form onSubmit={handleGenerateApiKey} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Application Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MyHealthApp"
                        value={keyForm.name}
                        onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Expiration (Days)</label>
                      <select
                        value={keyForm.durationDays}
                        onChange={(e) => setKeyForm({ ...keyForm, durationDays: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="365">1 Year</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Generate API Key
                    </button>
                  </form>

                  {generatedKeyResult && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-2 mt-4">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Unlock className="h-4 w-4" /> Save your API Key:</p>
                      <code className="block bg-white border border-emerald-100 p-2 rounded text-xs font-mono select-all text-slate-900 break-all">{generatedKeyResult}</code>
                      <p className="text-[10px] text-emerald-700">This key is hashed and cannot be retrieved again later.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Active API Integrations</h2>
                  {apiKeysList.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No third-party developer integrations configured.</p>
                  ) : (
                    <div className="space-y-4">
                      {apiKeysList.map((key) => (
                        <div key={key.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{key.name}</p>
                            {key.expiresAt && <p className="text-xs text-slate-500 mt-0.5">Expires: {new Date(key.expiresAt).toLocaleDateString()}</p>}
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                            {key.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Doctor Dashboard */}
        {currentUser.role === 'doctor' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Physician Dashboard — Dr. {currentUser.userId}</h1>
              <p className="text-sm text-slate-500 mt-1">Review diagnostic results, prescribe medications, and initiate lab workflows.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Clinical Records
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'appointments' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'prescriptions' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab('labs')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'labs' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Laboratory Orders
              </button>
              <button
                onClick={() => setActiveTab('intake_queue')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'intake_queue' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Intake Queue ({intakesList.length})
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
                  <FileText className="h-5 w-5 text-indigo-600" /> Accessible Patient Records
                </h2>
                {records.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No shared patient records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {records.map((r) => (
                          <tr key={r.recordId}>
                            <td className="px-4 py-3 text-sm text-slate-900 font-medium">{r.patientName}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 font-mono">{r.recordType}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 max-w-sm truncate">{r.description}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{new Date(r.uploadDate || '').toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              <button
                                onClick={() => handleDownloadRecord(r)}
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" /> Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Scheduled Consultations</h2>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No appointments found.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="border border-slate-200 p-4 rounded-lg flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 text-base">{apt.patientName || apt.patientId}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(apt.scheduledTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600 mt-3 italic">"{apt.notes || 'No doctor notes.'}"</p>
                          {apt.status !== 'cancelled' && (
                            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setRxPicker({
                                    isNew: false,
                                    patientId: apt.patientId,
                                    patientName: apt.patientName || ''
                                  });
                                  setIsRxPrefilled(true);
                                  setActiveTab('prescriptions');
                                }}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 flex items-center gap-0.5"
                              >
                                <Pill className="h-3 w-3" /> Prescribe
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLabPicker({
                                    isNew: false,
                                    patientId: apt.patientId,
                                    patientName: apt.patientName || ''
                                  });
                                  setIsLabPrefilled(true);
                                  setActiveTab('labs');
                                }}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-900 flex items-center gap-0.5"
                              >
                                <FlaskConical className="h-3 w-3" /> Order Lab
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                            {apt.status}
                          </span>
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                              className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><Pill className="h-5 w-5 text-indigo-600" /> Create Prescription</h2>
                  <form onSubmit={handleCreatePrescription} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                      {rxPicker.patientId && isRxPrefilled ? (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="block text-xs font-semibold text-indigo-900">{rxPicker.patientName}</span>
                            <span className="block text-[10px] text-indigo-700 font-mono">ID: {rxPicker.patientId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRxPicker({ isNew: false, patientId: '', patientName: '' });
                              setIsRxPrefilled(false);
                            }}
                            className="text-xs text-rose-600 hover:text-rose-900 font-semibold"
                          >
                            Clear Context
                          </button>
                        </div>
                      ) : (
                        <PatientPicker
                          value={rxPicker}
                          onChange={setRxPicker}
                          existingOnly={true}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Medication Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amoxicillin"
                        value={rxForm.medName}
                        onChange={(e) => setRxForm({ ...rxForm, medName: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Dosage</label>
                        <input
                          type="text"
                          placeholder="500mg"
                          value={rxForm.dosage}
                          onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Frequency</label>
                        <input
                          type="text"
                          placeholder="TID"
                          value={rxForm.frequency}
                          onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Duration</label>
                        <input
                          type="text"
                          placeholder="7d"
                          value={rxForm.duration}
                          onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Issue Prescription
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Prescriptions History</h2>
                  {prescriptions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No prescriptions issued yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((rx) => (
                        <div key={rx.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{rx.patientName}</p>
                            <p className="text-sm text-slate-600 mt-1">{rx.medicationDetails}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${rx.status === 'dispensed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                            {rx.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><FlaskConical className="h-5 w-5 text-indigo-600" /> Order Lab Test</h2>
                  <form onSubmit={handleCreateLabOrder} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                      {labPicker.patientId && isLabPrefilled ? (
                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="block text-xs font-semibold text-teal-900">{labPicker.patientName}</span>
                            <span className="block text-[10px] text-teal-700 font-mono">ID: {labPicker.patientId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLabPicker({ isNew: false, patientId: '', patientName: '' });
                              setIsLabPrefilled(false);
                            }}
                            className="text-xs text-rose-600 hover:text-rose-900 font-semibold"
                          >
                            Clear Context
                          </button>
                        </div>
                      ) : (
                        <PatientPicker
                          value={labPicker}
                          onChange={setLabPicker}
                          existingOnly={true}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Test Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Complete Blood Count (CBC)"
                        value={labForm.testName}
                        onChange={(e) => setLabForm({ ...labForm, testName: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Special Instructions</label>
                      <textarea
                        value={labForm.notes}
                        onChange={(e) => setLabForm({ ...labForm, notes: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Order Lab Test
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Laboratory Orders List</h2>
                  {labOrders.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No laboratory orders recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {labOrders.map((lab) => (
                        <div key={lab.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{lab.patientName}</p>
                            <p className="text-sm text-slate-600 mt-0.5">{lab.testName}</p>
                            {lab.notes && <p className="text-xs text-slate-500 mt-1 italic">"{lab.notes}"</p>}
                          </div>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            lab.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                            {lab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'intake_queue' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Checked-in Patient Queue</h2>
                  <p className="text-sm text-slate-500">Review patient-entered and receptionist-captured vitals, reasons for visit, and insurance coverage.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4">
                    <h3 className="text-md font-semibold text-slate-800">Checked-in Queue</h3>
                    {intakesList.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">No patients checked in currently.</p>
                    ) : (
                      <div className="space-y-3">
                        {intakesList.map((itk) => (
                          <div
                            key={itk.id}
                            onClick={() => {
                              setSelectedIntake(itk);
                              handleFetchAuditHistory(itk.id);
                            }}
                            className={`p-4 border rounded-lg cursor-pointer transition flex items-center justify-between ${selectedIntake?.id === itk.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{itk.patient_name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ID: {itk.patient_id}</p>
                              <p className="text-xs text-slate-400 mt-1 font-mono">{new Date(itk.created_at).toLocaleTimeString()}</p>
                            </div>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${itk.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                itk.status === 'in_consultation' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                              {itk.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {selectedIntake ? (
                      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">{selectedIntake.patient_name}</h2>
                            <p className="text-sm text-slate-500 mt-0.5">DOB: {new Date(selectedIntake.date_of_birth).toLocaleDateString()} | Gender: {selectedIntake.gender}</p>
                          </div>
                          <div className="flex gap-2">
                            {selectedIntake.status === 'checked_in' && (
                              <button
                                onClick={() => handleUpdateIntakeStatus(selectedIntake.id, 'in_consultation')}
                                className="bg-indigo-600 text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-indigo-700"
                              >
                                Start Consultation
                              </button>
                            )}
                            {selectedIntake.status === 'in_consultation' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRxPicker({
                                      isNew: false,
                                      patientId: selectedIntake.patient_id,
                                      patientName: selectedIntake.patient_name || ''
                                    });
                                    setIsRxPrefilled(true);
                                    setActiveTab('prescriptions');
                                  }}
                                  className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-3 py-1.5 text-sm font-semibold hover:bg-indigo-100 flex items-center gap-1"
                                >
                                  <Pill className="h-4 w-4" /> Prescribe
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLabPicker({
                                      isNew: false,
                                      patientId: selectedIntake.patient_id,
                                      patientName: selectedIntake.patient_name || ''
                                    });
                                    setIsLabPrefilled(true);
                                    setActiveTab('labs');
                                  }}
                                  className="bg-teal-50 text-teal-700 border border-teal-200 rounded px-3 py-1.5 text-sm font-semibold hover:bg-teal-100 flex items-center gap-1"
                                >
                                  <FlaskConical className="h-4 w-4" /> Order Lab
                                </button>
                                <button
                                  onClick={() => handleUpdateIntakeStatus(selectedIntake.id, 'completed')}
                                  className="bg-emerald-600 text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-emerald-700"
                                >
                                  Complete Visit
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Organized structured sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-1">Administrative &amp; Insurance</h3>
                            <div className="text-sm space-y-1.5">
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Preferred Language:</span> {selectedIntake.preferred_language || 'English'}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Marital Status:</span> {selectedIntake.marital_status || 'Single'}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Insurance Provider:</span> {selectedIntake.insurance_provider || 'Self Pay'}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Policy Number:</span> {selectedIntake.insurance_policy_number || '-'}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Emergency Contact:</span> {selectedIntake.emergency_contact || '-'}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">HIPAA Consent:</span> {selectedIntake.hipaa_consent ? '✓ Given' : '✗ Pending'}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-1">Encounter details</h3>
                            <div className="text-sm space-y-1.5">
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Reason for Visit:</span> {selectedIntake.reason_for_visit}</p>
                              <p className="text-slate-600"><span className="font-semibold text-slate-700">Symptoms:</span> {selectedIntake.symptoms || '-'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Vitals Summary Dashboard */}
                        <div className="space-y-4">
                          <h3 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-1">Intake Vitals</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500">Blood Pressure</p>
                              <p className="text-base font-semibold text-slate-800 mt-1">{selectedIntake.vitals?.bloodPressure || '-'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500">Pulse rate</p>
                              <p className="text-base font-semibold text-slate-800 mt-1">{selectedIntake.vitals?.pulse || '-'} bpm</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500">Temperature</p>
                              <p className="text-base font-semibold text-slate-800 mt-1">{selectedIntake.vitals?.temperature || '-'} °F</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500">SpO₂ Level</p>
                              <p className="text-base font-semibold text-slate-800 mt-1">{selectedIntake.vitals?.spo2 || '-'} %</p>
                            </div>
                          </div>
                        </div>

                        {/* Medical History */}
                        <div className="space-y-4">
                          <h3 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-1">Prior Medical Summary</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="font-semibold text-slate-700 mb-1">Allergies</p>
                              <p className="text-slate-600 whitespace-pre-line">{selectedIntake.allergies || 'No allergies reported.'}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="font-semibold text-slate-700 mb-1">Medications</p>
                              <p className="text-slate-600 whitespace-pre-line">{selectedIntake.medications || 'No current medications.'}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="font-semibold text-slate-700 mb-1">Medical History</p>
                              <p className="text-slate-600 whitespace-pre-line">{selectedIntake.medical_history || 'No medical history noted.'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Audit trail log */}
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                          <h3 className="text-md font-semibold text-slate-800">Edit Audit History</h3>
                          {auditHistory.length === 0 ? (
                            <p className="text-xs text-slate-400">No edits recorded for this record.</p>
                          ) : (
                            <div className="space-y-2">
                              {auditHistory.map((log) => (
                                <div key={log.id} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-slate-600 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-slate-800">Edited by: {log.changed_by}</span>
                                    <span>{new Date(log.changed_at).toLocaleString()}</span>
                                  </div>
                                  <p>Changes logged in system database.</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center text-slate-500">
                        Select a checked-in patient from the queue list to review intake information, demographics, and vitals.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nurse Dashboard */}
        {currentUser.role === 'nurse' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Clinical Nurse Station</h1>
              <p className="text-sm text-slate-500 mt-1">Manage check-in status, take vitals, and handle scheduled consultations.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Consultations &amp; Check-ins</h2>
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No appointments scheduled today.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Scheduled Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Change Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {appointments.map((apt) => (
                        <tr key={apt.id}>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">{apt.patientName || apt.patientId}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{new Date(apt.scheduledTime).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              apt.status === 'check-in' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                  'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm space-x-2">
                            {apt.status === 'scheduled' && (
                              <button
                                onClick={() => handleUpdateAptStatus(apt.id, 'check-in')}
                                className="bg-blue-600 text-white rounded px-2.5 py-1 text-xs hover:bg-blue-700"
                              >
                                Check In
                              </button>
                            )}
                            {apt.status === 'check-in' && (
                              <button
                                onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                                className="bg-emerald-600 text-white rounded px-2.5 py-1 text-xs hover:bg-emerald-700"
                              >
                                Vitals Logged
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receptionist Dashboard */}
        {currentUser.role === 'receptionist' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Administration &amp; Receptionist Desk</h1>
              <p className="text-sm text-slate-500 mt-1">Schedule new consultations, manage appointments, and issue billing invoices.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Scheduling (Appointments)
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Billing / Invoicing
              </button>
              <button
                onClick={() => setActiveTab('intake')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'intake' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Patient check-in &amp; Intake
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><Calendar className="h-5 w-5 text-indigo-600" /> Book Appointment</h2>
                  <form onSubmit={handleCreateAppointment} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                      <PatientPicker
                        value={appointmentPicker}
                        onChange={setAppointmentPicker}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Doctor Name</label>
                      <input
                        type="text"
                        required
                        value={appointmentForm.doctorName}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Schedule Date/Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={appointmentForm.scheduledTime}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledTime: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Consultation Notes</label>
                      <textarea
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Book Consultation
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Consultations Registry</h2>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No appointments scheduled.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {appointments.map((apt) => (
                            <tr key={apt.id}>
                              <td className="px-4 py-3 text-sm text-slate-900 font-medium">{apt.patientName || apt.patientId}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">Dr. {apt.doctorName || apt.doctorId}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(apt.scheduledTime).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  apt.status === 'check-in' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                    apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                      'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                  {apt.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {apt.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleUpdateAptStatus(apt.id, 'cancelled')}
                                    className="text-rose-600 hover:text-rose-900 font-medium"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><DollarSign className="h-5 w-5 text-indigo-600" /> Issue Invoice</h2>
                  <form onSubmit={handleCreateInvoice} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                      <PatientPicker
                        value={invoicePicker}
                        onChange={setInvoicePicker}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Billable Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                    >
                      Generate Invoice
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Invoice Log</h2>
                  {invoices.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No invoices generated yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {invoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="px-4 py-3 text-sm text-slate-900 font-medium">{inv.patientName || inv.patientId}</td>
                              <td className="px-4 py-3 text-sm text-slate-800 font-semibold">${inv.amount.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {inv.status === 'unpaid' && (
                                  <button
                                    onClick={() => handlePayInvoice(inv.id)}
                                    className="bg-emerald-600 text-white rounded px-2.5 py-1 text-xs font-semibold hover:bg-emerald-700"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'intake' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Register & Check-in form */}
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-4 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                      Check-in &amp; Demographics Intake
                    </h2>
                    <form onSubmit={handleCreateIntake} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                        <PatientPicker
                          value={{
                            isNew: !intakeForm.patientId,
                            patientId: intakeForm.patientId,
                            patientName: intakeForm.name,
                            dateOfBirth: intakeForm.dateOfBirth,
                            gender: intakeForm.gender,
                            contactPhone: intakeForm.contactPhone,
                            contactEmail: intakeForm.contactEmail
                          }}
                          onChange={(pickerVal) => {
                            setIntakeForm(prev => ({
                              ...prev,
                              patientId: pickerVal.patientId,
                              name: pickerVal.patientName,
                              dateOfBirth: pickerVal.dateOfBirth || prev.dateOfBirth,
                              gender: pickerVal.gender || prev.gender,
                              contactPhone: pickerVal.contactPhone || prev.contactPhone,
                              contactEmail: pickerVal.contactEmail || prev.contactEmail
                            }));
                          }}
                          showDetailsFields={true}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600">Emergency Contact (Name/Phone)</label>
                        <input
                          type="text"
                          placeholder="Contact Details"
                          value={intakeForm.emergencyContact}
                          onChange={(e) => setIntakeForm({ ...intakeForm, emergencyContact: e.target.value })}
                          className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Insurance Provider</label>
                          <input
                            type="text"
                            value={intakeForm.insuranceProvider}
                            onChange={(e) => setIntakeForm({ ...intakeForm, insuranceProvider: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Policy Number</label>
                          <input
                            type="text"
                            value={intakeForm.insurancePolicyNumber}
                            onChange={(e) => setIntakeForm({ ...intakeForm, insurancePolicyNumber: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Language</label>
                          <input
                            type="text"
                            value={intakeForm.preferredLanguage}
                            onChange={(e) => setIntakeForm({ ...intakeForm, preferredLanguage: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Ethnicity</label>
                          <input
                            type="text"
                            value={intakeForm.ethnicity}
                            onChange={(e) => setIntakeForm({ ...intakeForm, ethnicity: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={intakeForm.hipaaConsent}
                          onChange={(e) => setIntakeForm({ ...intakeForm, hipaaConsent: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs text-slate-600">Patient signed HIPAA consent form</span>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Assign Doctor &amp; Visit Details</h4>
                        <div className="mt-2">
                          <label className="block text-xs font-semibold text-slate-600">Reason for Visit</label>
                          <input
                            type="text"
                            required
                            value={intakeForm.reasonForVisit}
                            onChange={(e) => setIntakeForm({ ...intakeForm, reasonForVisit: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs font-semibold text-slate-600">Symptoms</label>
                          <textarea
                            value={intakeForm.symptoms}
                            onChange={(e) => setIntakeForm({ ...intakeForm, symptoms: e.target.value })}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Check-in Vitals</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-slate-500">Blood Pressure</label>
                            <input
                              type="text"
                              placeholder="120/80"
                              value={intakeForm.vitals.bloodPressure}
                              onChange={(e) => setIntakeForm({ ...intakeForm, vitals: { ...intakeForm.vitals, bloodPressure: e.target.value } })}
                              className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500">Pulse rate (bpm)</label>
                            <input
                              type="number"
                              value={intakeForm.vitals.pulse}
                              onChange={(e) => setIntakeForm({ ...intakeForm, vitals: { ...intakeForm.vitals, pulse: parseInt(e.target.value) } })}
                              className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500">Temp (°F)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={intakeForm.vitals.temperature}
                              onChange={(e) => setIntakeForm({ ...intakeForm, vitals: { ...intakeForm.vitals, temperature: parseFloat(e.target.value) } })}
                              className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500">SpO₂ (%)</label>
                            <input
                              type="number"
                              value={intakeForm.vitals.spo2}
                              onChange={(e) => setIntakeForm({ ...intakeForm, vitals: { ...intakeForm.vitals, spo2: parseInt(e.target.value) } })}
                              className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2"
                      >
                        Register &amp; Check In Patient
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of check-ins */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Registered Intake History &amp; Audits</h3>
                      {intakesList.length === 0 ? (
                        <p className="text-sm text-slate-500 py-6 text-center">No patient records check-ins found.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Reason</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm">
                              {intakesList.map((itk) => (
                                <tr key={itk.id}>
                                  <td className="px-4 py-3 font-semibold text-slate-900">{itk.patient_name}</td>
                                  <td className="px-4 py-3 text-slate-500">{itk.reason_for_visit}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${itk.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                        itk.status === 'in_consultation' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                          'bg-amber-50 text-amber-800 border-amber-200'
                                      }`}>
                                      {itk.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right space-x-2">
                                    <button
                                      onClick={async () => {
                                        setSelectedIntake(itk);
                                        await handleFetchAuditHistory(itk.id);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                    >
                                      Edit / Audit
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Edit Demographics & Audit view */}
                    {selectedIntake && (
                      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Edit Demographics (Audited)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600">Insurance Provider</label>
                            <input
                              type="text"
                              value={selectedIntake.insurance_provider || ''}
                              onChange={(e) => handleUpdateIntakeDetails(selectedIntake.id, { insurance_provider: e.target.value })}
                              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600">Policy Number</label>
                            <input
                              type="text"
                              value={selectedIntake.insurance_policy_number || ''}
                              onChange={(e) => handleUpdateIntakeDetails(selectedIntake.id, { insurance_policy_number: e.target.value })}
                              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600">Phone Contact</label>
                            <input
                              type="text"
                              value={selectedIntake.contact_phone || ''}
                              onChange={(e) => handleUpdateIntakeDetails(selectedIntake.id, { contact_phone: e.target.value })}
                              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600">Emergency Contact</label>
                            <input
                              type="text"
                              value={selectedIntake.emergency_contact || ''}
                              onChange={(e) => handleUpdateIntakeDetails(selectedIntake.id, { emergency_contact: e.target.value })}
                              className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            />
                          </div>
                        </div>

                        {/* Audit history list */}
                        <div className="border-t border-slate-100 pt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-slate-800">Edit Log Trail</h4>
                          {auditHistory.length === 0 ? (
                            <p className="text-xs text-slate-400">No edits recorded yet.</p>
                          ) : (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {auditHistory.map((log) => (
                                <div key={log.id} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-slate-600 flex justify-between items-center">
                                  <span><span className="font-semibold text-slate-800">{log.changed_by}</span> updated demographics.</span>
                                  <span>{new Date(log.changed_at).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lab Technician Dashboard */}
        {currentUser.role === 'lab_technician' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Laboratory Station</h1>
              <p className="text-sm text-slate-500 mt-1">Process physician lab test orders, update test statuses, and attach diagnostic documents.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Laboratory Orders Queue</h2>
              {labOrders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No laboratory orders in the queue.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Test Ordered</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {labOrders.map((lab) => (
                        <tr key={lab.id}>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">{lab.patientName || lab.patientId}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{lab.testName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              lab.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                              {lab.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm space-x-2">
                            {lab.status === 'ordered' && (
                              <button
                                onClick={() => handleUpdateLabStatus(lab.id, 'processing')}
                                className="bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700"
                              >
                                Begin Process
                              </button>
                            )}
                            {lab.status === 'processing' && (
                              <button
                                onClick={() => handleUpdateLabStatus(lab.id, 'completed')}
                                className="bg-emerald-600 text-white rounded px-2 py-1 text-xs hover:bg-emerald-700"
                              >
                                Mark Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pharmacist Dashboard */}
        {currentUser.role === 'pharmacist' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Pharmacy Dispensing Station</h1>
              <p className="text-sm text-slate-500 mt-1">Review physician-issued prescriptions and log dispensed status updates.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'prescriptions' || activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Prescription Log
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Medicine Inventory
              </button>
            </div>

            {medicines.some(m => m.stock <= m.reorderThreshold || new Date(m.expiryDate) < new Date()) && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg text-rose-900 text-sm space-y-2">
                <h3 className="font-bold flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Pharmacy Inventory Alerts</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {medicines.filter(m => m.stock <= m.reorderThreshold).map(m => (
                    <li key={`low-${m.name}`}><span className="font-semibold">{m.name}</span> is low on stock ({m.stock} left, threshold is {m.reorderThreshold}).</li>
                  ))}
                  {medicines.filter(m => new Date(m.expiryDate) < new Date()).map(m => (
                    <li key={`exp-${m.name}`}><span className="font-semibold">{m.name}</span> has expired on {new Date(m.expiryDate).toLocaleDateString()}!</li>
                  ))}
                </ul>
              </div>
            )}

            {(activeTab === 'prescriptions' || activeTab === 'overview') && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm animate-fadeIn">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Prescription Logs</h2>
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No prescriptions available to dispense.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Medication Details</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {prescriptions.map((rx) => (
                          <tr key={rx.id}>
                            <td className="px-4 py-3 text-sm text-slate-900 font-medium">{rx.patientName || rx.patientId}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{rx.medicationDetails}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${rx.status === 'dispensed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                {rx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {rx.status === 'pending' && (
                                <button
                                  onClick={() => handleDispensePrescription(rx.id)}
                                  className="bg-indigo-600 text-white rounded px-2.5 py-1 text-xs hover:bg-indigo-700 cursor-pointer"
                                >
                                  Dispense Meds
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Medicine Stock</h2>
                  {medicines.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No medications in stock.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Medicine Name</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Current Stock</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Reorder Threshold</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Expiry Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {medicines.map((med) => (
                            <tr key={med.name}>
                              <td className="px-4 py-3 text-sm text-slate-900 font-medium">{med.name}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`font-semibold ${med.stock <= med.reorderThreshold ? 'text-rose-600' : 'text-slate-800'}`}>{med.stock}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{med.reorderThreshold}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(med.expiryDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Update Inventory</h2>
                  <form onSubmit={handleSaveMedicine} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Medicine Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol"
                        value={medForm.name}
                        onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Current Stock</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 100"
                        value={medForm.stock}
                        onChange={(e) => setMedForm({ ...medForm, stock: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Reorder Threshold</label>
                      <input
                        type="number"
                        required
                        value={medForm.reorderThreshold}
                        onChange={(e) => setMedForm({ ...medForm, reorderThreshold: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={medForm.expiryDate}
                        onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      Update Stock
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Administrative Staff Dashboard */}
        {(currentUser.role === 'admin_staff' || currentUser.role === 'admin') && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Administrative System Oversight</h1>
              <p className="text-sm text-slate-500 mt-1">Configure role permissions, track system status, and manage healthcare users.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><Users className="h-5 w-5 text-indigo-600" /> Active System Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">User ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Assigned Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Affiliation</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((usr) => (
                      <tr key={usr.userId}>
                        <td className="px-4 py-3 text-sm font-mono text-slate-950 font-semibold">{usr.userId}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{ROLE_LABELS[usr.role] || usr.role}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{usr.orgName.toUpperCase()}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                            {usr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <button
                            onClick={() => showToast('Demo action: Status settings can be updated on PostgreSQL.', false)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Configuration & Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                  ⚙️ System Settings
                </h2>

                {systemSettings.length === 0 ? (
                  <p className="text-xs text-slate-400">No active system configuration settings saved.</p>
                ) : (
                  <div className="space-y-2">
                    {systemSettings.map(s => (
                      <div key={s.key} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                        <span className="font-mono text-slate-700">{s.key}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-xs font-semibold">{JSON.stringify(s.value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSaveSetting} className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Setting key (e.g. slot_duration)"
                      required
                      value={newSettingForm.key}
                      onChange={(e) => setNewSettingForm({ ...newSettingForm, key: e.target.value })}
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="Setting value (e.g. 30)"
                      required
                      value={newSettingForm.value}
                      onChange={(e) => setNewSettingForm({ ...newSettingForm, value: e.target.value })}
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-950"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded py-2 cursor-pointer"
                  >
                    Save Config Setting
                  </button>
                </form>
              </div>

              {/* Bulk Exports */}
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                  📤 Data Export Utility
                </h2>
                <p className="text-xs text-slate-500">Export active database tables in bulk CSV format for compliance auditing.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <a
                    href={api.exportCSVUrl('activity-logs')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center border border-slate-200 rounded p-4 text-center hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer"
                  >
                    <span className="text-2xl">📋</span>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Activity Logs</span>
                  </a>
                  <a
                    href={api.exportCSVUrl('invoices')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center border border-slate-200 rounded p-4 text-center hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer"
                  >
                    <span className="text-2xl">💵</span>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Invoices</span>
                  </a>
                  <a
                    href={api.exportCSVUrl('records')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center border border-slate-200 rounded p-4 text-center hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer"
                  >
                    <span className="text-2xl">📂</span>
                    <span className="text-xs font-semibold text-slate-800 mt-2">EHR Records</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Management Dashboard */}
        {currentUser.role === 'management' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Healthcare Analytics &amp; Management Oversight</h1>
              <p className="text-sm text-slate-500 mt-1">Cross-module operational statistics, patient flow charts, and financial analytics.</p>
            </div>

            {analytics && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md"><FileText className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Records</p>
                    <p className="text-2xl font-semibold text-slate-900">{analytics.totalRecords}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md"><Calendar className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Appointments</p>
                    <p className="text-2xl font-semibold text-slate-900">{analytics.totalAppointments}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-md"><FlaskConical className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Lab Orders</p>
                    <p className="text-2xl font-semibold text-slate-900">{analytics.totalLabOrders}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-md"><DollarSign className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-slate-900">${analytics.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {analytics && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><TrendingUp className="h-5 w-5 text-indigo-600" /> Physician Consultation Volumes</h2>
                {(!analytics.doctorPerformance || analytics.doctorPerformance.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-8">No doctor consultation performance metrics recorded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.doctorPerformance.map((doc: any) => (
                      <div key={doc._id} className="border border-slate-100 rounded p-4 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Dr. {doc.doctorName || doc._id || 'General Practice'}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {doc._id}</p>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-2">
                          <span className="text-xs text-slate-500 font-semibold">Consultations Completed</span>
                          <span className="text-lg font-bold text-indigo-600">{doc.patientVolume}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'organization' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Organization Owner Desk</h1>
              <p className="text-sm text-slate-500 mt-1">Configure department list, set staff access levels, and audit system users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left Column: Organization & Departments */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                    🏥 Departments List
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {orgDetails?.departments?.map((dept: string) => (
                      <span key={dept} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
                        {dept}
                      </span>
                    )) || <span className="text-slate-400">Loading departments...</span>}
                  </div>

                  <form onSubmit={handleAddDepartment} className="flex gap-2 pt-4 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="New department name..."
                      required
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-950 flex-grow"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded px-4 py-2 cursor-pointer"
                    >
                      Add Department
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                    👥 Registered Staff Members
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Staff ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Assigned Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Affiliation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {orgStaff.map((usr) => (
                          <tr key={usr.userId}>
                            <td className="px-4 py-3 text-sm font-mono text-slate-950 font-semibold">{usr.userId}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{ROLE_LABELS[usr.role] || usr.role}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{usr.orgName.toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Access Level Rules & Policies */}
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4 h-fit">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                  🔐 Access Rules Config
                </h2>

                <div className="space-y-4">
                  {orgDetails?.accessRules?.map((rule: any) => (
                    <div key={rule.role} className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800 capitalize">{ROLE_LABELS[rule.role] || rule.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.permissions.map((p: string) => (
                          <span key={p} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleUpdatePermissions} className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Edit Permissions</h3>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Target Role</label>
                    <select
                      value={editingRolePermissions.role}
                      onChange={(e) => setEditingRolePermissions({ ...editingRolePermissions, role: e.target.value })}
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-900"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="lab_technician">Laboratory Technician</option>
                      <option value="pharmacist">Pharmacist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Permissions (comma-separated list)</label>
                    <input
                      type="text"
                      placeholder="e.g. read_ehr, log_vitals, check_in"
                      required
                      value={editingRolePermissions.permissions}
                      onChange={(e) => setEditingRolePermissions({ ...editingRolePermissions, permissions: e.target.value })}
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-950"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded py-2 cursor-pointer"
                  >
                    Save Access Rules
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SegueEMR. Secured Practice Management Ecosystem. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
