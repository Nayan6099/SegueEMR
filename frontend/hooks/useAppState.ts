// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';


const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  lab_technician: 'Laboratory Technician',
  pharmacist: 'Pharmacist',
  admin_staff: 'Administrative Staff',
  management: 'Healthcare Management',
  admin: 'Admin',
  organization: 'Organization'
};

export function useAppState(toast: (msg: string, isError?: boolean) => void) {

  const showToast = (message: string, isError = false) => {
    toast(message, isError);
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ userId: '', email: '', role: '', password: '' });
  const [activeTab, setActiveTab] = useState('summary');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const getStorageKeys = (roleOverride?: string) => {
    if (roleOverride) {
      const isStaff = roleOverride !== 'patient';
      return {
        token: isStaff ? 'segue_token_staff' : 'segue_token_patient',
        user: isStaff ? 'segue_user_staff' : 'segue_user_patient'
      };
    }
    if (typeof window === 'undefined') return { token: 'segue_token_patient', user: 'segue_user_patient' };
    const path = window.location.pathname;
    const isStaff = path.startsWith('/staff') || (path.startsWith('/dashboard') && !path.startsWith('/dashboard/patient'));
    return {
      token: isStaff ? 'segue_token_staff' : 'segue_token_patient',
      user: isStaff ? 'segue_user_staff' : 'segue_user_patient'
    };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const keys = getStorageKeys();
      const storedUser = localStorage.getItem(keys.user);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem(keys.user);
          localStorage.removeItem(keys.token);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const keys = getStorageKeys(currentUser.role);
      const token = localStorage.getItem(keys.token);
      if (token) {
        const socket = connectSocket(token);
        
        socket.on('receive_message', (msg) => {
          setChatMessages(prev => [...prev, { ...msg, is_read: msg.isRead }]);
        });
        
        socket.on('messages_read', ({ readerId }) => {
          setChatMessages(prev => prev.map(m => 
            m.receiver_id === readerId ? { ...m, is_read: true } : m
          ));
        });

        return () => {
          socket.off('receive_message');
          socket.off('messages_read');
          disconnectSocket();
        };
      }
    }
  }, [currentUser]);

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
  const [appointmentForm, setAppointmentForm] = useState({ patientId: '', patientName: '', doctorId: 'dr.smith', doctorName: 'Dr. Smith', scheduledTime: '', notes: '', status: 'scheduled' });
  const [appointmentAvailableSlots, setAppointmentAvailableSlots] = useState<string[]>([]);
  const [appointmentConflictError, setAppointmentConflictError] = useState<string | null>(null);
  const [rxForm, setRxForm] = useState({ patientId: '', patientName: '', medName: '', dosage: '', frequency: '', duration: '', assignedPharmacyId: '' });
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
  const [labForm, setLabForm] = useState({ patientId: '', patientName: '', testName: '', notes: '', assignedLabId: '' });
  const [labsList, setLabsList] = useState<any[]>([]);
  const [pharmaciesList, setPharmaciesList] = useState<any[]>([]);
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
  const [uploadingLabs, setUploadingLabs] = useState<Record<string, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    actionLabel?: string;
    type?: 'primary' | 'danger';
  } | null>(null);
  const [sendReportModal, setSendReportModal] = useState<{ isOpen: boolean; labId: string } | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUserId = (loginForm.userId || '').trim();
    console.log('1. Login handler function triggered', { userId: trimmedUserId, email: loginForm.email, role: loginForm.role, pwd: loginForm.password });
    if ((trimmedUserId || loginForm.email) && loginForm.role && loginForm.password) {
      setLoading(true);
      try {
        const orgName = loginForm.role === 'patient' ? 'patient' : 'hospital';
        const res = await api.login({
          userId: trimmedUserId,
          email: loginForm.email,
          orgName,
          role: loginForm.role,
          password: loginForm.password
        }) as any;
        console.log('2. Axios API response received:', res);

        // The backend returns success, token, and user at the top level, but the 
        // original code expected them inside a `data` object (res.data).
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user;

        if (res.success && token && user) {
          const keys = getStorageKeys(user.role);
          localStorage.setItem(keys.token, token);
          localStorage.setItem(keys.user, JSON.stringify(user));
          console.log('3. Token localStorage storage successful:', { tokenSet: !!token, keys });

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
    const keys = getStorageKeys(currentUser?.role);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
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
        const patientId = currentUser.patientId || userId;
        const [recRes, aptsRes, rxRes, labsRes, invRes, algRes, prbRes, rflRes, msgRes, keysRes, notifRes] = await Promise.all([
          api.getPatientRecords(patientId, patientId, orgName),
          api.listAppointments({ patientId }),
          api.listPrescriptions({ patientId }),
          api.listLabOrders({ patientId }),
          api.listInvoices({ patientId }),
          api.getAllergies(patientId),
          api.getProblems(patientId),
          api.listRefillRequests(patientId),
          api.getMessages(patientId, 'dr.smith'),
          api.getApiKeys(patientId),
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
        const msgData = msgRes.data || [];
        setChatMessages(msgData);
        if (msgData.some((m: any) => !m.is_read && m.sender_id !== userId)) {
          api.readMessages('dr.smith').then(() => {
            setChatMessages(prev => prev.map(m => m.sender_id !== userId ? { ...m, is_read: true } : m));
          }).catch(() => {});
        }
        setApiKeysList(keysRes.data || []);
        setNotifications(notifRes.data || []);
      } else if (role === 'doctor') {
        const [recordsRes, aptsRes, rxRes, labsRes, intakeRes, notifRes, labsListRes, pharmListRes] = await Promise.all([
          api.getPatientRecords(userId, userId, orgName),
          api.listAppointments({ doctorId: userId }),
          api.listPrescriptions({ doctorId: userId }),
          api.listLabOrders({ doctorId: userId }),
          api.listIntakes({ doctorId: userId }),
          api.listNotifications(),
          api.getProviders('lab_technician'),
          api.getProviders('pharmacist')
        ]);
        setRecords(recordsRes.data || []);
        setAppointments(aptsRes.data || []);
        setPrescriptions(rxRes.data || []);
        setLabOrders(labsRes.data || []);
        setIntakesList(intakeRes.data || []);
        setNotifications(notifRes.data || []);
        setLabsList(labsListRes.data || []);
        setPharmaciesList(pharmListRes.data || []);
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
      const actualSenderId = currentUser.role === 'patient' && currentUser.patientId ? currentUser.patientId : currentUser.userId;
      await api.sendMessage({ senderId: actualSenderId, receiverId: 'dr.smith', content: chatInput });
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
        setAppointmentConflictError(null);
        setAppointmentAvailableSlots([]);
        setAppointmentForm({ patientId: '', patientName: '', doctorId: 'dr.smith', doctorName: 'Dr. Smith', scheduledTime: '', notes: '', status: 'scheduled' });
        setAppointmentPicker({
          isNew: false,
          patientId: '',
          patientName: '',
          dateOfBirth: '',
          gender: 'Male',
          contactPhone: '',
          contactEmail: ''
        });
        const res = await api.listAppointments();
        if (res.success) setAppointments(res.data || []);
      } catch (error: any) {
        if (error.response?.status === 409 && error.response?.data?.available_slots) {
          setAppointmentConflictError(error.response.data.error || 'Conflict');
          setAppointmentAvailableSlots(error.response.data.available_slots);
        } else {
          showToast(error.response?.data?.error || error.message || 'Action failed', true);
        }
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
        duration: rxForm.duration,
        assignedPharmacyId: rxForm.assignedPharmacyId,
        medications: [{
          name: rxForm.medName,
          dosage: rxForm.dosage,
          frequency: rxForm.frequency,
          duration: rxForm.duration
        }]
      });
      showToast('Prescription successfully created');
      setRxForm({ patientId: '', patientName: '', medName: '', dosage: '', frequency: '', duration: '', assignedPharmacyId: '' });
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

  const handleCancelPrescription = async (id: string) => {
    if (!currentUser) return;
    try {
      await api.cancelPrescription(id);
      showToast('Prescription successfully cancelled');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message || 'Action failed', true);
    }
  };

  const handleUndoPrescription = async (id: string) => {
    if (!currentUser) return;
    try {
      await api.undoPrescription(id);
      showToast('Prescription action undone successfully');
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
        notes: labForm.notes,
        // @ts-ignore
        assignedLabId: labForm.assignedLabId
      });
      showToast('Laboratory order submitted');
      setLabForm({ patientId: '', patientName: '', testName: '', notes: '', assignedLabId: '' });
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

  

  return {
    ROLE_LABELS,
    activeTab,
    allergiesList,
    allergyForm,
    analytics,
    apiKeysList,
    appointmentForm,
    appointmentAvailableSlots,
    appointmentConflictError,
    setAppointmentForm,
    setAppointmentAvailableSlots,
    setAppointmentConflictError,
    appointmentPicker,
    appointments,
    auditHistory,
    chatInput,
    chatMessages,
    confirmDialog,
    currentUser,
    doctorSearchQuery,
    editingRolePermissions,
    generatedKeyResult,
    grantAccessForm,
    handleAddAllergy,
    handleAddDepartment,
    handleAddProblem,
    handleCancelPrescription,
    handleCreateAppointment,
    handleCreateIntake,
    handleCreateInvoice,
    handleCreateLabOrder,
    handleCreatePrescription,
    handleDispensePrescription,
    handleDownloadRecord,
    handleFetchAuditHistory,
    handleGenerateApiKey,
    handleGrantAccess,
    handleImportCCDA,
    handleLogin,
    handleLogout,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handlePayInvoice,
    handleRequestRefill,
    handleRevokeAccess,
    handleSaveClinicalNote,
    handleSaveLabResults,
    handleSaveMedicine,
    handleSaveSetting,
    handleSaveVitals,
    handleSendMessage,
    handleUndoPrescription,
    handleUpdateAptStatus,
    handleUpdateIntakeDetails,
    handleUpdateIntakeStatus,
    handleUpdateLabStatus,
    handleUpdatePermissions,
    handleUploadEHR,
    intakeForm,
    intakesList,
    invoiceForm,
    invoicePicker,
    invoices,
    isLabPrefilled,
    isRxPrefilled,
    keyForm,
    labForm,
    labOrders,
    labPicker,
    labResultsForm,
    labsList,
    loading,
    loginForm,
    medForm,
    medicines,
    newDepartmentName,
    newSettingForm,
    notifications,
    orgDetails,
    orgStaff,
    patientVitals,
    pharmaciesList,
    prescriptions,
    problemForm,
    problemsList,
    records,
    refillForm,
    refillRequests,
    rxForm,
    rxPicker,
    selectedAptForNote,
    selectedAptForVitals,
    selectedCCDAFile,
    selectedFile,
    selectedIntake,
    selectedLabForResults,
    sendReportModal,
    setActiveTab,
    setAllergiesList,
    setAllergyForm,
    setAnalytics,
    setApiKeysList,
    setAppointmentForm,
    setAppointmentPicker,
    setAppointments,
    setAuditHistory,
    setChatInput,
    setChatMessages,
    setConfirmDialog,
    setCurrentUser,
    setDoctorSearchQuery,
    setEditingRolePermissions,
    setGeneratedKeyResult,
    setGrantAccessForm,
    setIntakeForm,
    setIntakesList,
    setInvoiceForm,
    setInvoicePicker,
    setInvoices,
    setIsLabPrefilled,
    setIsRxPrefilled,
    setKeyForm,
    setLabForm,
    setLabOrders,
    setLabPicker,
    setLabResultsForm,
    setLabsList,
    setLoading,
    setLoginForm,
    setMedForm,
    setMedicines,
    setNewDepartmentName,
    setNewSettingForm,
    setNotifications,
    setOrgDetails,
    setOrgStaff,
    setPatientVitals,
    setPharmaciesList,
    setPrescriptions,
    setProblemForm,
    setProblemsList,
    setRecords,
    setRefillForm,
    setRefillRequests,
    setRxForm,
    setRxPicker,
    setSelectedAptForNote,
    setSelectedAptForVitals,
    setSelectedCCDAFile,
    setSelectedFile,
    setSelectedIntake,
    setSelectedLabForResults,
    setSendReportModal,
    setShowNotificationsDropdown,
    setSoapNote,
    setSystemSettings,
    setUploadForm,
    setUploadingLabs,
    setUsers,
    setVitalsForm,
    setVitalsHistory,
    showNotificationsDropdown,
    soapNote,
    systemSettings,
    uploadForm,
    uploadingLabs,
    users,
    vitalsForm,
    vitalsHistory,
    fetchData,
    showToast
  };
}
