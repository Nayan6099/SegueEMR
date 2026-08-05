// @ts-nocheck

import React from 'react';
import api from '../../../services/api';
import {
  FileText, Download, Pill, Clock, CheckCircle, Activity,
  FlaskConical, Search, User as UserIcon, MessageSquare,
  X, Send, RefreshCw, AlertCircle, Shield, Calendar,
  ChevronLeft, ChevronRight, Plus, Bell, CreditCard,
  ClipboardList, BookOpen, ArrowLeft
} from 'lucide-react';
import { PatientPicker } from '../PatientPicker';
import { getSocket } from '../../../services/socket';

export function DoctorDashboard(props: any) {
  const {
    activeTab,
    allergiesList,
    appointments,
    auditHistory,
    currentUser,
    handleAddAllergy,
    handleAddProblem,
    handleCancelPrescription,
    handleCreateAppointment,
    handleCreateLabOrder,
    handleCreatePrescription,
    handleDownloadRecord,
    handleFetchAuditHistory,
    handleSaveClinicalNote,
    handleSendMessage,
    handleUndoPrescription,
    handleUpdateAptStatus,
    handleUpdateIntakeDetails,
    handleUpdateIntakeStatus,
    handleUpdateLabStatus,
    intakeForm,
    intakesList,
    isLabPrefilled,
    isRxPrefilled,
    labForm,
    labOrders,
    labPicker,
    labsList,
    loading,
    prescriptions,
    problemForm,
    problemsList,
    records,
    rxForm,
    rxPicker,
    selectedIntake,
    selectedLabForResults,
    showToast,
    soapNote,
    vitalsForm,
    vitalsHistory,
    pharmaciesList,
    setActiveTab,
    setAllergyForm,
    setIntakeForm,
    setIsLabPrefilled,
    setIsRxPrefilled,
    setLabForm,
    setLabPicker,
    setProblemForm,
    setRxForm,
    setRxPicker,
    setSelectedIntake,
    setSoapNote,
    setVitalsForm,
    allergyForm,
    setLabResultsForm,
    labResultsForm,
    setSendReportModal,
    sendReportModal,
    uploadingLabs,
    setUploadingLabs,
    handleFetchAuditHistory: _hfah,
  } = props;

  // ── Phase 1 state (Patient Finder, Chart, Messages) ────────────────────────

  const [finderQuery, setFinderQuery] = React.useState('');
  const [finderResults, setFinderResults] = React.useState([]);
  const [finderLoading, setFinderLoading] = React.useState(false);

  const [chartPatientId, setChartPatientId] = React.useState('');
  const [chartPatientName, setChartPatientName] = React.useState('');
  const [chartLoading, setChartLoading] = React.useState(false);
  const [chartData, setChartData] = React.useState(null);
  const [chartSection, setChartSection] = React.useState('summary');

  // SOAP note compose in chart visits section
  const [chartNoteAptId, setChartNoteAptId] = React.useState(null);
  const [chartNoteForm, setChartNoteForm] = React.useState({ soapSubjective: '', soapObjective: '', soapAssessment: '', soapPlan: '' });
  const [chartNoteSaving, setChartNoteSaving] = React.useState(false);
  const [chartSoapExpanded, setChartSoapExpanded] = React.useState({});
  const [chartSoapData, setChartSoapData] = React.useState({});

  // Create visit from chart
  const [chartCreateVisit, setChartCreateVisit] = React.useState(false);
  const [chartVisitForm, setChartVisitForm] = React.useState({ scheduledTime: '', notes: '' });
  const [chartVisitSaving, setChartVisitSaving] = React.useState(false);

  // Fee Sheet in chart visits section
  const [chartFeeSheetAptId, setChartFeeSheetAptId] = React.useState(null);
  const [chartFeeSheetData, setChartFeeSheetData] = React.useState(null);
  const [chartFeeSheetForm, setChartFeeSheetForm] = React.useState([]);
  const [chartFeeSheetLoading, setChartFeeSheetLoading] = React.useState(false);
  const [chartFeeSheetSaving, setChartFeeSheetSaving] = React.useState(false);

  // Phase 4 chart additions
  const [chartOfficeNoteForm, setChartOfficeNoteForm] = React.useState({ content: '' });
  const [chartOfficeNoteSaving, setChartOfficeNoteSaving] = React.useState(false);

  const [chartEduForm, setChartEduForm] = React.useState({ title: '', content: '' });
  const [chartEduSaving, setChartEduSaving] = React.useState(false);

  const [chartAuthForm, setChartAuthForm] = React.useState({ requestedItem: '', payer: '', status: 'pending' });
  const [chartAuthSaving, setChartAuthSaving] = React.useState(false);

  const [msgContacts, setMsgContacts] = React.useState([]);
  const [msgLoading, setMsgLoading] = React.useState(false);
  const [msgSelectedContact, setMsgSelectedContact] = React.useState(null);
  const [msgThread, setMsgThread] = React.useState([]);
  const [msgThreadLoading, setMsgThreadLoading] = React.useState(false);
  const [msgCompose, setMsgCompose] = React.useState('');
  const [msgSending, setMsgSending] = React.useState(false);

  // ── Phase 2 state ──────────────────────────────────────────────────────────

  // Calendar
  const [calView, setCalView] = React.useState<'list' | 'day' | 'week' | 'month'>('list');
  const [calDate, setCalDate] = React.useState(new Date());
  const [calModalOpen, setCalModalOpen] = React.useState(false);
  const [calModalSlot, setCalModalSlot] = React.useState<Date | null>(null);
  const [calModalPicker, setCalModalPicker] = React.useState({ isNew: false, patientId: '', patientName: '' });
  const [calModalNotes, setCalModalNotes] = React.useState('');
  const [calModalSaving, setCalModalSaving] = React.useState(false);

  // Recalls
  const [recalls, setRecalls] = React.useState([]);
  const [recallsLoading, setRecallsLoading] = React.useState(false);
  const [recallFilter, setRecallFilter] = React.useState('pending');
  const [recallForm, setRecallForm] = React.useState({ patientId: '', patientName: '', reason: '', dueDate: '', notes: '' });
  const [recallPicker, setRecallPicker] = React.useState({ isNew: false, patientId: '', patientName: '' });
  const [recallSaving, setRecallSaving] = React.useState(false);
  const [recallFormOpen, setRecallFormOpen] = React.useState(false);

  // Portal staff view
  const [portalSection, setPortalSection] = React.useState<'mail' | 'payments'>('mail');
  const [portalContacts, setPortalContacts] = React.useState([]);
  const [portalContactsLoading, setPortalContactsLoading] = React.useState(false);
  const [portalSelectedContact, setPortalSelectedContact] = React.useState(null);
  const [portalThread, setPortalThread] = React.useState([]);
  const [portalThreadLoading, setPortalThreadLoading] = React.useState(false);
  const [portalInvoicePatientId, setPortalInvoicePatientId] = React.useState('');
  const [portalInvoicePicker, setPortalInvoicePicker] = React.useState({ isNew: false, patientId: '', patientName: '' });
  const [portalInvoices, setPortalInvoices] = React.useState([]);
  const [portalInvoicesLoading, setPortalInvoicesLoading] = React.useState(false);

  // Record requests
  const [recordRequests, setRecordRequests] = React.useState([]);
  const [recordRequestsLoading, setRecordRequestsLoading] = React.useState(false);
  const [recordRequestSearchPid, setRecordRequestSearchPid] = React.useState('');
  const [recordRequestPicker, setRecordRequestPicker] = React.useState({ isNew: false, patientId: '', patientName: '' });
  const [recordRequestForm, setRecordRequestForm] = React.useState({ purpose: '', requestType: 'full_chart' });
  const [recordRequestFormOpen, setRecordRequestFormOpen] = React.useState(false);
  const [recordRequestSaving, setRecordRequestSaving] = React.useState(false);

  // Labs sub-tabs
  const [labTab, setLabTab] = React.useState<'orders' | 'overview' | 'batch' | 'reports' | 'documents'>('orders');
  const [labBatchFile, setLabBatchFile] = React.useState<File | null>(null);
  const [labBatchLoading, setLabBatchLoading] = React.useState(false);

  // Reports
  const [allInvoices, setAllInvoices] = React.useState<any[]>([]);
  const [allEligibilityChecks, setAllEligibilityChecks] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeTab === 'reports') {
      if (allInvoices.length === 0) {
        api.listInvoices({}).then(res => {
          if (res.success) setAllInvoices(res.data || []);
        });
      }
      if (allEligibilityChecks.length === 0) {
        api.getEligibilityChecks({}).then(res => {
          if (res.success) setAllEligibilityChecks(res.data || []);
        });
      }
    }
  }, [activeTab]);

  // ── HELPERS ────────────────────────────────────────────────────────────────

  const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed:   'bg-emerald-50 text-emerald-800 border-emerald-200',
      cancelled:   'bg-rose-50 text-rose-800 border-rose-200',
      'no-show':   'bg-slate-100 text-slate-600 border-slate-300',
      scheduled:   'bg-amber-50 text-amber-800 border-amber-200',
      confirmed:   'bg-blue-50 text-blue-800 border-blue-200',
      pending:     'bg-amber-50 text-amber-800 border-amber-200',
      dispensed:   'bg-emerald-50 text-emerald-800 border-emerald-200',
      processing:  'bg-blue-50 text-blue-800 border-blue-200',
      contacted:   'bg-blue-50 text-blue-800 border-blue-200',
      approved:    'bg-emerald-50 text-emerald-800 border-emerald-200',
      denied:      'bg-rose-50 text-rose-800 border-rose-200',
      paid:        'bg-emerald-50 text-emerald-800 border-emerald-200',
      unpaid:      'bg-amber-50 text-amber-800 border-amber-200',
    };
    return `text-xs px-2.5 py-0.5 rounded-full font-semibold border ${map[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`;
  };

  const aptStatusColor = (status: string) => {
    if (status === 'completed') return '#10b981';
    if (status === 'cancelled' || status === 'no-show') return '#f43f5e';
    return '#f59e0b';
  };

  // ── Patient Finder handlers ────────────────────────────────────────────────

  React.useEffect(() => {
    if (finderQuery.trim().length < 1) { setFinderResults([]); return; }
    const t = setTimeout(async () => {
      setFinderLoading(true);
      try {
        const res = await api.searchPatients(finderQuery.trim());
        if (res.success) setFinderResults(res.data || []);
      } catch { /* non-fatal */ }
      finally { setFinderLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [finderQuery]);

  const openChart = React.useCallback(async (patient: { id: string; name: string }) => {
    setChartPatientId(patient.id);
    setChartPatientName(patient.name);
    setChartData(null);
    setChartSection('summary');
    setChartNoteAptId(null);
    setChartCreateVisit(false);
    setChartSoapExpanded({});
    setChartSoapData({});
    setActiveTab('chart');
    setChartLoading(true);
    try {
      const [rxRes, labRes, aptRes, allergyRes, problemRes, recordRes, notesRes, eduRes, authRes] = await Promise.allSettled([
        api.listPrescriptions({ patientId: patient.id }),
        api.listLabOrders({ patientId: patient.id }),
        api.listAppointments({ patientId: patient.id }),
        api.getAllergies(patient.id),
        api.getProblems(patient.id),
        api.getPatientRecords(patient.id, currentUser?.userId, currentUser?.orgName || 'hospital'),
        api.getOfficeNotes(patient.id),
        api.getPatientEducation(patient.id),
        api.getAuthorizations(patient.id),
      ]);
      setChartData({
        prescriptions: rxRes.status === 'fulfilled' && rxRes.value?.success ? rxRes.value.data || [] : [],
        labs:          labRes.status === 'fulfilled' && labRes.value?.success ? labRes.value.data || [] : [],
        appointments:  aptRes.status === 'fulfilled' && aptRes.value?.success ? aptRes.value.data || [] : [],
        allergies:     allergyRes.status === 'fulfilled' && allergyRes.value?.success ? allergyRes.value.data || [] : [],
        problems:      problemRes.status === 'fulfilled' && problemRes.value?.success ? problemRes.value.data || [] : [],
        records:       recordRes.status === 'fulfilled' && recordRes.value?.success ? recordRes.value.data || [] : [],
        officeNotes:   notesRes.status === 'fulfilled' && notesRes.value?.success ? notesRes.value.data || [] : [],
        education:     eduRes.status === 'fulfilled' && eduRes.value?.success ? eduRes.value.data || [] : [],
        authorizations: authRes.status === 'fulfilled' && authRes.value?.success ? authRes.value.data || [] : [],
      });
    } catch { /* non-fatal */ }
    finally { setChartLoading(false); }
  }, [currentUser, setActiveTab]);

  // Expand/load SOAP note for a chart appointment
  const toggleChartSoap = React.useCallback(async (apt: any) => {
    const key = apt.id;
    if (chartSoapExpanded[key]) {
      setChartSoapExpanded(p => ({ ...p, [key]: false }));
      return;
    }
    setChartSoapExpanded(p => ({ ...p, [key]: true }));
    if (!chartSoapData[key]) {
      try {
        const res = await api.getClinicalNote(key);
        if (res.success && res.data) setChartSoapData(p => ({ ...p, [key]: res.data }));
      } catch { /* no note yet */ }
    }
  }, [chartSoapExpanded, chartSoapData]);

  // Save SOAP note from chart
  const saveChartSoapNote = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartNoteAptId || !chartPatientId || chartNoteSaving) return;
    setChartNoteSaving(true);
    try {
      const res = await api.createClinicalNote({
        appointmentId: chartNoteAptId,
        patientId: chartPatientId,
        doctorId: currentUser?.doctorId || currentUser?.userId,
        recordedBy: currentUser?.userId,
        ...chartNoteForm,
      });
      if (res.success && res.data) {
        setChartSoapData(p => ({ ...p, [chartNoteAptId]: res.data }));
        setChartNoteAptId(null);
        setChartNoteForm({ soapSubjective: '', soapObjective: '', soapAssessment: '', soapPlan: '' });
      }
      showToast?.('SOAP note saved', false);
      setChartNoteForm({ soapSubjective: '', soapObjective: '', soapAssessment: '', soapPlan: '' });
    } catch { /* non-fatal */ }
    finally { setChartNoteSaving(false); }
  }, [chartNoteAptId, chartPatientId, chartNoteForm, chartNoteSaving, currentUser]);

  // Phase 4 Save Handlers
  const saveChartOfficeNote = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartPatientId || !chartOfficeNoteForm.content || chartOfficeNoteSaving) return;
    setChartOfficeNoteSaving(true);
    try {
      const res = await api.addOfficeNote(chartPatientId, {
        authorId: currentUser?.userId || '',
        authorName: currentUser?.fullName || currentUser?.userId || 'Unknown',
        content: chartOfficeNoteForm.content
      });
      if (res.success && res.data) {
        setChartData(p => p ? { ...p, officeNotes: [res.data, ...(p.officeNotes || [])] } : p);
        setChartOfficeNoteForm({ content: '' });
        showToast?.('Office note added', false);
      }
    } catch { showToast?.('Failed to add office note', true); }
    finally { setChartOfficeNoteSaving(false); }
  }, [chartPatientId, chartOfficeNoteForm, chartOfficeNoteSaving, currentUser]);

  const saveChartEducation = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartPatientId || !chartEduForm.title || !chartEduForm.content || chartEduSaving) return;
    setChartEduSaving(true);
    try {
      const res = await api.addPatientEducation(chartPatientId, {
        authorId: currentUser?.userId || '',
        authorName: currentUser?.fullName || currentUser?.userId || 'Unknown',
        title: chartEduForm.title,
        content: chartEduForm.content
      });
      if (res.success && res.data) {
        setChartData(p => p ? { ...p, education: [res.data, ...(p.education || [])] } : p);
        setChartEduForm({ title: '', content: '' });
        showToast?.('Education material added', false);
      }
    } catch { showToast?.('Failed to add education', true); }
    finally { setChartEduSaving(false); }
  }, [chartPatientId, chartEduForm, chartEduSaving, currentUser]);

  const saveChartAuthorization = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartPatientId || !chartAuthForm.requestedItem || !chartAuthForm.payer || chartAuthSaving) return;
    setChartAuthSaving(true);
    try {
      const res = await api.addAuthorization(chartPatientId, {
        authorId: currentUser?.userId || '',
        authorName: currentUser?.fullName || currentUser?.userId || 'Unknown',
        requestedItem: chartAuthForm.requestedItem,
        payer: chartAuthForm.payer,
        status: chartAuthForm.status
      });
      if (res.success && res.data) {
        setChartData(p => p ? { ...p, authorizations: [res.data, ...(p.authorizations || [])] } : p);
        setChartAuthForm({ requestedItem: '', payer: '', status: 'pending' });
        showToast?.('Authorization added', false);
      }
    } catch { showToast?.('Failed to add authorization', true); }
    finally { setChartAuthSaving(false); }
  }, [chartPatientId, chartAuthForm, chartAuthSaving, currentUser]);

  // Expand/load Fee Sheet
  const toggleFeeSheet = React.useCallback(async (apt: any) => {
    if (chartFeeSheetAptId === apt.id) {
      setChartFeeSheetAptId(null);
      return;
    }
    setChartNoteAptId(null); // Close note form if open
    setChartFeeSheetAptId(apt.id);
    setChartSection('visits');
    setChartFeeSheetLoading(true);
    setChartFeeSheetData(null);
    setChartFeeSheetForm([{ cptCode: '', icd10Code: '', modifiers: '', description: '', quantity: 1, amount: 0 }]); // Default empty line
    try {
      const res = await api.getInvoiceByAppointment(apt.id);
      if (res.success && res.data) {
        setChartFeeSheetData(res.data);
        if (res.data.items && res.data.items.length > 0) {
          setChartFeeSheetForm(res.data.items.map((i: any) => ({ 
            cptCode: i.cptCode || '', 
            icd10Code: i.icd10Code || '', 
            modifiers: i.modifiers || '', 
            description: i.description || '', 
            quantity: i.quantity || 1, 
            amount: i.amount || 0 
          })));
        }
      }
    } catch { /* no invoice yet */ }
    finally { setChartFeeSheetLoading(false); }
  }, [chartFeeSheetAptId]);

  // Save Fee Sheet
  const saveFeeSheet = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartFeeSheetAptId || chartFeeSheetSaving) return;
    setChartFeeSheetSaving(true);
    try {
      // Filter out completely empty rows
      const validItems = chartFeeSheetForm.filter(i => i.description.trim() || Number(i.amount) > 0);
      if (chartFeeSheetData && chartFeeSheetData.id) {
        const res = await api.updateInvoice(chartFeeSheetData.id, { items: validItems });
        if (res.success) {
          setChartFeeSheetData(res.data);
          setChartFeeSheetAptId(null);
        }
      } else {
        const res = await api.createInvoice({
          patientId: chartPatientId,
          patientName: chartPatientName,
          appointmentId: chartFeeSheetAptId,
          items: validItems,
        });
        if (res.success) {
          setChartFeeSheetData(res.data);
          setChartFeeSheetAptId(null);
        }
      }
    } catch { /* non-fatal */ }
    finally { setChartFeeSheetSaving(false); }
  }, [chartFeeSheetAptId, chartFeeSheetForm, chartFeeSheetData, chartPatientId, chartPatientName, chartFeeSheetSaving]);

  // Create visit from chart
  const handleCreateVisitFromChart = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartPatientId || !chartVisitForm.scheduledTime || chartVisitSaving) return;
    setChartVisitSaving(true);
    try {
      await api.createAppointment({
        patientId: chartPatientId,
        patientName: chartPatientName,
        doctorId: currentUser?.doctorId || currentUser?.userId,
        doctorName: currentUser?.fullName || currentUser?.userId,
        scheduledTime: chartVisitForm.scheduledTime,
        notes: chartVisitForm.notes,
        status: 'scheduled',
      });
      showToast?.('Visit created', false);
      setChartCreateVisit(false);
      setChartVisitForm({ scheduledTime: '', notes: '' });
      // Refresh chart appointments
      const res = await api.listAppointments({ patientId: chartPatientId });
      if (res.success) setChartData(p => p ? { ...p, appointments: res.data || [] } : p);
    } catch { /* non-fatal */ }
    finally { setChartVisitSaving(false); }
  }, [chartPatientId, chartPatientName, chartVisitForm, chartVisitSaving, currentUser]);

  // ── Messages handlers ──────────────────────────────────────────────────────

  const loadMsgContacts = React.useCallback(async () => {
    if (!currentUser?.userId) return;
    setMsgLoading(true);
    try {
      const aptRes = await api.listAppointments({ doctorId: currentUser.doctorId || currentUser.userId });
      if (aptRes.success && aptRes.data) {
        const seen = new Set<string>();
        const contacts = [];
        for (const apt of aptRes.data) {
          if (!seen.has(apt.patientId)) {
            seen.add(apt.patientId);
            contacts.push({ id: apt.patientId, name: apt.patientName || apt.patientId });
          }
        }
        setMsgContacts(contacts);
        if (contacts.length > 0 && !msgSelectedContact) loadMsgThread(contacts[0]);
      }
    } catch { /* non-fatal */ }
    finally { setMsgLoading(false); }
  }, [currentUser, msgSelectedContact]);

  const loadMsgThread = React.useCallback(async (contact: any) => {
    if (!currentUser?.userId || !contact?.id) return;
    setMsgSelectedContact(contact);
    setMsgThread([]);
    setMsgThreadLoading(true);
    try {
      const res = await api.getMessages(currentUser.userId, contact.id);
      if (res.success) {
        setMsgThread(res.data || []);
        if (res.data?.some((m: any) => !m.is_read && m.sender_id === contact.id)) {
          api.readMessages(contact.id).then(() => {
            setMsgThread(prev => prev.map(m => m.sender_id === contact.id ? { ...m, is_read: true } : m));
          }).catch(() => {});
        }
      }
    } catch { /* non-fatal */ }
    finally { setMsgThreadLoading(false); }
  }, [currentUser]);

  const handleSendMsg = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgCompose.trim() || !msgSelectedContact || msgSending) return;
    setMsgSending(true);
    try {
      await api.sendMessage({ senderId: currentUser.userId, receiverId: msgSelectedContact.id, content: msgCompose.trim() });
      setMsgCompose('');
      await loadMsgThread(msgSelectedContact);
    } catch { /* non-fatal */ }
    finally { setMsgSending(false); }
  }, [msgCompose, msgSelectedContact, currentUser, msgSending, loadMsgThread]);

  React.useEffect(() => {
    if (activeTab === 'messages' && msgContacts.length === 0) loadMsgContacts();
  }, [activeTab]);

  // ── Calendar handlers ──────────────────────────────────────────────────────

  const calDays = React.useMemo(() => {
    const start = new Date(calDate);
    if (calView === 'week') {
      start.setDate(calDate.getDate() - calDate.getDay());
    } else if (calView === 'month') {
      start.setDate(1);
    }
    return start;
  }, [calDate, calView]);

  const getAptsForDate = React.useCallback((date: Date) => {
    return (appointments || []).filter((apt: any) => {
      const d = new Date(apt.scheduledTime);
      return d.toDateString() === date.toDateString();
    });
  }, [appointments]);

  const handleCalSlotClick = (slot: Date) => {
    setCalModalSlot(slot);
    setCalModalPicker({ isNew: false, patientId: '', patientName: '' });
    setCalModalNotes('');
    setCalModalOpen(true);
  };

  const handleCalBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calModalSlot || !calModalPicker.patientId || calModalSaving) return;
    setCalModalSaving(true);
    try {
      await api.createAppointment({
        patientId: calModalPicker.patientId,
        patientName: calModalPicker.patientName,
        doctorId: currentUser?.doctorId || currentUser?.userId,
        doctorName: currentUser?.fullName || currentUser?.userId,
        scheduledTime: calModalSlot.toISOString(),
        notes: calModalNotes,
        status: 'scheduled',
      });
      showToast?.('Appointment booked', false);
      setCalModalOpen(false);
      // Trigger parent refresh — parent's data will re-render via props
    } catch { /* non-fatal */ }
    finally { setCalModalSaving(false); }
  };

  const navigateCal = (dir: -1 | 1) => {
    const d = new Date(calDate);
    if (calView === 'day')   d.setDate(d.getDate() + dir);
    if (calView === 'week')  d.setDate(d.getDate() + 7 * dir);
    if (calView === 'month') d.setMonth(d.getMonth() + dir);
    setCalDate(d);
  };

  const calLabel = React.useMemo(() => {
    if (calView === 'day')   return calDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (calView === 'week') {
      const start = new Date(calDate); start.setDate(calDate.getDate() - calDate.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return calDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [calDate, calView]);

  // ── Recalls handlers ───────────────────────────────────────────────────────

  const loadRecalls = React.useCallback(async (status = recallFilter) => {
    setRecallsLoading(true);
    try {
      const res = await api.listRecalls(status ? { status } : {});
      if (res.success) setRecalls(res.data || []);
    } catch { /* non-fatal */ }
    finally { setRecallsLoading(false); }
  }, [recallFilter]);

  React.useEffect(() => {
    if (activeTab === 'recalls') loadRecalls(recallFilter);
  }, [activeTab, recallFilter]);

  const handleCreateRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallPicker.patientId || !recallForm.reason || !recallForm.dueDate || recallSaving) return;
    setRecallSaving(true);
    try {
      await api.createRecall({ patientId: recallPicker.patientId, patientName: recallPicker.patientName, reason: recallForm.reason, dueDate: recallForm.dueDate, notes: recallForm.notes });
      showToast?.('Recall created', false);
      setRecallFormOpen(false);
      setRecallPicker({ isNew: false, patientId: '', patientName: '' });
      setRecallForm({ patientId: '', patientName: '', reason: '', dueDate: '', notes: '' });
      await loadRecalls(recallFilter);
    } catch { /* non-fatal */ }
    finally { setRecallSaving(false); }
  };

  const handleRecallStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateRecallStatus(id, status);
      await loadRecalls(recallFilter);
      showToast?.(`Recall marked as ${status}`, false);
    } catch { /* non-fatal */ }
  };

  // ── Portal staff view handlers ─────────────────────────────────────────────

  const loadPortalContacts = React.useCallback(async () => {
    if (!currentUser?.userId) return;
    setPortalContactsLoading(true);
    try {
      const aptRes = await api.listAppointments({ doctorId: currentUser.doctorId || currentUser.userId });
      if (aptRes.success && aptRes.data) {
        const seen = new Set<string>();
        const contacts = [];
        for (const apt of aptRes.data) {
          if (!seen.has(apt.patientId)) {
            seen.add(apt.patientId);
            contacts.push({ id: apt.patientId, name: apt.patientName || apt.patientId });
          }
        }
        setPortalContacts(contacts);
        if (contacts.length > 0 && !portalSelectedContact) loadPortalThread(contacts[0]);
      }
    } catch { /* non-fatal */ }
    finally { setPortalContactsLoading(false); }
  }, [currentUser, portalSelectedContact]);

  const loadPortalThread = React.useCallback(async (contact: any) => {
    setPortalSelectedContact(contact);
    setPortalThread([]);
    setPortalThreadLoading(true);
    try {
      const res = await api.getMessages(currentUser.userId, contact.id);
      if (res.success) {
        setPortalThread(res.data || []);
        if (res.data?.some((m: any) => !m.is_read && m.sender_id === contact.id)) {
          api.readMessages(contact.id).then(() => {
            setPortalThread(prev => prev.map(m => m.sender_id === contact.id ? { ...m, is_read: true } : m));
          }).catch(() => {});
        }
      }
    } catch { /* non-fatal */ }
    finally { setPortalThreadLoading(false); }
  }, [currentUser]);

  const loadPortalInvoices = React.useCallback(async (patientId: string) => {
    if (!patientId) return;
    setPortalInvoicesLoading(true);
    try {
      const res = await api.listInvoices({ patientId });
      if (res.success) setPortalInvoices(res.data || []);
    } catch { /* non-fatal */ }
    finally { setPortalInvoicesLoading(false); }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'portal') {
      if (portalSection === 'mail' && portalContacts.length === 0) loadPortalContacts();
    }
  }, [activeTab, portalSection]);

  React.useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleReceive = (msg: any) => {
      // Only append if it's the currently viewed thread in portalThread
      setPortalThread(prev => {
        if (!portalSelectedContact || (msg.sender_id !== portalSelectedContact.id && msg.receiver_id !== portalSelectedContact.id)) {
          return prev;
        }
        return [...prev, { ...msg, is_read: msg.isRead }];
      });
      // Also append to msgThread if it's the currently viewed thread there
      setMsgThread(prev => {
        if (!msgSelectedContact || (msg.sender_id !== msgSelectedContact.id && msg.receiver_id !== msgSelectedContact.id)) {
          return prev;
        }
        return [...prev, { ...msg, is_read: msg.isRead }];
      });
    };

    const handleRead = ({ readerId }: any) => {
      setPortalThread(prev => prev.map(m => 
        m.receiver_id === readerId ? { ...m, is_read: true } : m
      ));
      setMsgThread(prev => prev.map(m => 
        m.receiver_id === readerId ? { ...m, is_read: true } : m
      ));
    };

    socket.on('receive_message', handleReceive);
    socket.on('messages_read', handleRead);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('messages_read', handleRead);
    };
  }, [portalSelectedContact, msgSelectedContact]);

  React.useEffect(() => {
    if (portalInvoicePicker.patientId) loadPortalInvoices(portalInvoicePicker.patientId);
  }, [portalInvoicePicker.patientId]);

  // ── Record Request handlers ────────────────────────────────────────────────

  const loadRecordRequests = React.useCallback(async () => {
    setRecordRequestsLoading(true);
    try {
      // Fetch record requests for all patients: use the chart's current patient, or fetch by searching
      const patientId = recordRequestSearchPid || chartPatientId || '';
      if (!patientId) { setRecordRequests([]); setRecordRequestsLoading(false); return; }
      const res = await api.getPatientForms(patientId);
      if (res.success) {
        const requests = (res.data || []).filter((f: any) => f.form_type === 'record_request' || f.formType === 'record_request');
        setRecordRequests(requests);
      }
    } catch { /* non-fatal */ }
    finally { setRecordRequestsLoading(false); }
  }, [recordRequestSearchPid, chartPatientId]);

  React.useEffect(() => {
    if (activeTab === 'record_requests') loadRecordRequests();
  }, [activeTab, recordRequestSearchPid]);

  const handleSubmitRecordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordRequestPicker.patientId || !recordRequestForm.purpose || recordRequestSaving) return;
    setRecordRequestSaving(true);
    try {
      await api.submitPatientForm({
        patientId: recordRequestPicker.patientId,
        formType: 'record_request',
        formData: {
          requestedBy: currentUser.userId,
          requestType: recordRequestForm.requestType,
          purpose: recordRequestForm.purpose,
        },
      });
      showToast?.('Record request submitted', false);
      setRecordRequestFormOpen(false);
      setRecordRequestPicker({ isNew: false, patientId: '', patientName: '' });
      setRecordRequestForm({ purpose: '', requestType: 'full_chart' });
      setRecordRequestSearchPid(recordRequestPicker.patientId);
    } catch { /* non-fatal */ }
    finally { setRecordRequestSaving(false); }
  };

  const handleApproveRejectRequest = async (formId: string, status: 'approved' | 'denied') => {
    try {
      await api.updateFormStatus(formId, status);
      showToast?.(`Request ${status}`, false);
      await loadRecordRequests();
    } catch { /* non-fatal */ }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labBatchFile || labBatchLoading) return;
    setLabBatchLoading(true);

    try {
      const text = await labBatchFile.text();
      // Simple CSV parse: labOrderId, resultSummary, resultsJSON
      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('labOrderId'));
      const results = lines.map(line => {
        const parts = line.split(',');
        const labOrderId = parts[0]?.trim();
        const resultSummary = parts[1]?.trim() || '';
        let resultFields = {};
        try {
          if (parts[2]) resultFields = JSON.parse(parts.slice(2).join(',').replace(/^"|"$/g, '').trim());
        } catch { /* ignore parse error */ }
        
        return { labOrderId, resultSummary, resultFields };
      }).filter(r => r.labOrderId);

      if (results.length > 0) {
        const res = await api.batchUploadLabResults(results);
        if (res.success) {
          showToast?.(`Batch processed ${res.count} results`, false);
          setLabBatchFile(null);
          // Optional: refresh labs
        }
      } else {
        showToast?.('No valid results found in file', true);
      }
    } catch {
      showToast?.('Failed to process batch file', true);
    } finally {
      setLabBatchLoading(false);
    }
  };

  // ── NAV TABS ───────────────────────────────────────────────────────────────

  const TABS = [
    { key: 'overview',         label: 'Clinical Records' },
    { key: 'finder',           label: 'Patient Finder' },
    { key: 'chart',            label: chartPatientName ? `Chart — ${chartPatientName}` : 'Patient Chart' },
    { key: 'appointments',     label: `Appointments (${(appointments || []).length})` },
    { key: 'prescriptions',    label: 'Prescriptions' },
    { key: 'labs',             label: 'Laboratory Orders' },
    { key: 'intake_queue',     label: `Intake Queue (${(intakesList || []).length})` },
    { key: 'messages',         label: 'Messages' },
    { key: 'recalls',          label: 'Recalls' },
    { key: 'portal',           label: 'Portal View' },
    { key: 'record_requests',  label: 'Record Requests' },
    { key: 'reports',          label: 'Reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Physician Dashboard — Dr. {currentUser?.userId}</h1>
        <p className="text-sm text-slate-500 mt-1">Review diagnostic results, prescribe medications, and initiate lab workflows.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── CLINICAL RECORDS ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
            <FileText className="h-5 w-5 text-indigo-600" /> Accessible Patient Records
          </h2>
          {!records?.length ? (
            <p className="text-sm text-slate-500 text-center py-8">No shared patient records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Patient Name', 'Type', 'Description', 'Date', 'Actions'].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r: any) => (
                    <tr key={r.recordId}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.patientName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-500">{r.recordType}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-sm truncate">{r.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(r.uploadDate || '').toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDownloadRecord(r)} className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center gap-1 ml-auto">
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

      {/* ── PATIENT FINDER ────────────────────────────────────────────────────── */}
      {activeTab === 'finder' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <Search className="h-5 w-5 text-indigo-600" /> Patient Finder
            </h2>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input autoFocus type="text" placeholder="Type patient name or ID…" value={finderQuery} onChange={e => setFinderQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {finderLoading && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />}
            </div>
          </div>
          {finderResults.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Patient', 'ID', 'Actions'].map(h => <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {finderResults.map((pt: any) => (
                    <tr key={pt.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{(pt.name || '?')[0].toUpperCase()}</div>
                        {pt.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{pt.id}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openChart(pt)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"><FileText className="h-3.5 w-3.5" /> Open Chart</button>
                          <button onClick={() => { setRxPicker({ isNew: false, patientId: pt.id, patientName: pt.name || '' }); setIsRxPrefilled(true); setActiveTab('prescriptions'); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold hover:bg-purple-100"><Pill className="h-3.5 w-3.5" /> Prescribe</button>
                          <button onClick={() => { setLabPicker({ isNew: false, patientId: pt.id, patientName: pt.name || '' }); setIsLabPrefilled(true); setActiveTab('labs'); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-xs font-semibold hover:bg-teal-100"><FlaskConical className="h-3.5 w-3.5" /> Order Lab</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {finderQuery.length >= 1 && !finderLoading && finderResults.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">No patients found matching "<strong>{finderQuery}</strong>".</div>
          )}
          {finderQuery.length === 0 && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-10 text-center">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Type at least one character to search.</p>
            </div>
          )}
        </div>
      )}

      {/* ── PATIENT CHART ─────────────────────────────────────────────────────── */}
      {activeTab === 'chart' && (
        <div className="space-y-4">
          {!chartPatientId ? (
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1.5"><UserIcon className="h-5 w-5 text-indigo-600" /> Patient Chart</h2>
              <p className="text-sm text-slate-500 mb-4">Search for a patient to open their chart, or use Patient Finder.</p>
              <div className="max-w-md">
                <PatientPicker value={{ isNew: false, patientId: chartPatientId, patientName: chartPatientName }} onChange={async val => { if (val.patientId) await openChart({ id: val.patientId, name: val.patientName }); }} existingOnly={true} />
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">{(chartPatientName || '?')[0].toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{chartPatientName}</h2>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {chartPatientId}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setRxPicker({ isNew: false, patientId: chartPatientId, patientName: chartPatientName }); setIsRxPrefilled(true); setActiveTab('prescriptions'); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-sm font-semibold hover:bg-purple-100"><Pill className="h-4 w-4" /> Prescribe</button>
                  <button onClick={() => { setLabPicker({ isNew: false, patientId: chartPatientId, patientName: chartPatientName }); setIsLabPrefilled(true); setActiveTab('labs'); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-sm font-semibold hover:bg-teal-100"><FlaskConical className="h-4 w-4" /> Order Lab</button>
                  <button onClick={() => { setChartPatientId(''); setChartPatientName(''); setChartData(null); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-sm font-semibold hover:bg-slate-200"><X className="h-4 w-4" /> Close</button>
                </div>
              </div>

              {/* Chart sub-nav */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
                {[
                  { key: 'summary',   label: 'Summary' },
                  { key: 'allergies', label: `Allergies${chartData ? ` (${chartData.allergies.length})` : ''}` },
                  { key: 'problems',  label: `Problems${chartData ? ` (${chartData.problems.length})` : ''}` },
                  { key: 'rx',        label: `Rx${chartData ? ` (${chartData.prescriptions.length})` : ''}` },
                  { key: 'labs',      label: `Labs${chartData ? ` (${chartData.labs.length})` : ''}` },
                  { key: 'visits',    label: `Visits${chartData ? ` (${chartData.appointments.length})` : ''}` },
                  { key: 'records',   label: `Documents${chartData ? ` (${chartData.records.length})` : ''}` },
                  { key: 'officeNotes',label: `Notes${chartData ? ` (${chartData.officeNotes.length})` : ''}` },
                  { key: 'education',  label: `Education${chartData ? ` (${chartData.education.length})` : ''}` },
                  { key: 'authorizations', label: `Auths${chartData ? ` (${chartData.authorizations.length})` : ''}` },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setChartSection(key)} className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded ${chartSection === key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{label}</button>
                ))}
              </div>

              {/* Chart content */}
              {chartLoading ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center"><RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mx-auto mb-3" /><p className="text-sm text-slate-500">Loading chart…</p></div>
              ) : !chartData ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center"><p className="text-sm text-slate-500">Chart data unavailable.</p></div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">

                  {chartSection === 'summary' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                      {[
                        { label: 'Allergies',    count: chartData.allergies.length,     color: 'bg-rose-50 text-rose-700',    icon: <AlertCircle className="h-5 w-5" /> },
                        { label: 'Conditions',   count: chartData.problems.length,      color: 'bg-amber-50 text-amber-700',  icon: <Shield className="h-5 w-5" /> },
                        { label: 'Prescriptions', count: chartData.prescriptions.length, color: 'bg-purple-50 text-purple-700', icon: <Pill className="h-5 w-5" /> },
                        { label: 'Lab Orders',   count: chartData.labs.length,          color: 'bg-teal-50 text-teal-700',    icon: <FlaskConical className="h-5 w-5" /> },
                        { label: 'Visits',       count: chartData.appointments.length,  color: 'bg-indigo-50 text-indigo-700', icon: <Clock className="h-5 w-5" /> },
                        { label: 'Documents',    count: chartData.records.length,       color: 'bg-slate-50 text-slate-700',  icon: <FileText className="h-5 w-5" /> },
                        { label: 'Notes',        count: chartData.officeNotes.length,   color: 'bg-blue-50 text-blue-700',    icon: <FileText className="h-5 w-5" /> },
                        { label: 'Education',    count: chartData.education.length,     color: 'bg-emerald-50 text-emerald-700', icon: <FileText className="h-5 w-5" /> },
                      ].map(({ label, count, color, icon }) => (
                        <div key={label} className={`p-4 rounded-xl ${color} flex flex-col items-center text-center gap-1`}>{icon}<p className="text-2xl font-bold">{count}</p><p className="text-xs font-medium">{label}</p></div>
                      ))}
                    </div>
                  )}

                  {chartSection === 'allergies' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><AlertCircle className="h-4 w-4 text-rose-500" /> Allergies</h3>
                      {!chartData.allergies.length ? <p className="text-sm text-slate-500 py-4 text-center">No allergies on file.</p> : (
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50"><tr>{['Allergen', 'Severity', 'Reaction', 'Status'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-slate-200">
                            {chartData.allergies.map((a: any) => (
                              <tr key={a.id}>
                                <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{a.allergen}</td>
                                <td className="px-4 py-2.5 text-sm"><span className={statusBadge(a.severity)}>{a.severity}</span></td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{a.reaction || '—'}</td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{a.status || 'active'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {chartSection === 'problems' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><Shield className="h-4 w-4 text-amber-500" /> Active Conditions</h3>
                      {!chartData.problems.length ? <p className="text-sm text-slate-500 py-4 text-center">No problems on file.</p> : (
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50"><tr>{['ICD Code', 'Description', 'Onset', 'Status'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-slate-200">
                            {chartData.problems.map((p: any) => (
                              <tr key={p.id}>
                                <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{p.code || '—'}</td>
                                <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{p.description}</td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{p.onsetDate || p.onset_date ? new Date(p.onsetDate || p.onset_date).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-2.5"><span className={statusBadge(p.status || 'active')}>{p.status || 'active'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {chartSection === 'rx' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><Pill className="h-4 w-4 text-purple-500" /> Prescription History</h3>
                      {!chartData.prescriptions.length ? <p className="text-sm text-slate-500 py-4 text-center">No prescriptions on file.</p> : (
                        <div className="space-y-3">
                          {chartData.prescriptions.map((rx: any) => (
                            <div key={rx.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                              <div><p className="font-semibold text-slate-800 text-sm">{rx.medicationDetails}</p><p className="text-xs text-slate-500 mt-0.5">Prescribed: {new Date(rx.createdAt).toLocaleDateString()}</p></div>
                              <span className={statusBadge(rx.status)}>{rx.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {chartSection === 'labs' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><FlaskConical className="h-4 w-4 text-teal-500" /> Lab Orders</h3>
                      {!chartData.labs.length ? <p className="text-sm text-slate-500 py-4 text-center">No lab orders on file.</p> : (
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50"><tr>{['Test', 'Ordered', 'Status', 'Result'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-slate-200">
                            {chartData.labs.map((lab: any) => (
                              <tr key={lab.id}>
                                <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{lab.testName}</td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{new Date(lab.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2.5"><span className={statusBadge(lab.status)}>{lab.status}</span></td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{lab.resultSummary || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Visits — with Create Visit + SOAP note expand */}
                  {chartSection === 'visits' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><Clock className="h-4 w-4 text-indigo-500" /> Visit / Appointment History</h3>
                        <button onClick={() => setChartCreateVisit(v => !v)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"><Plus className="h-3.5 w-3.5" /> Create Visit</button>
                      </div>

                      {chartCreateVisit && (
                        <form onSubmit={handleCreateVisitFromChart} className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 space-y-3">
                          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Visit / Appointment</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600">Date & Time</label>
                              <input type="datetime-local" required value={chartVisitForm.scheduledTime} onChange={e => setChartVisitForm(p => ({ ...p, scheduledTime: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600">Reason / Notes</label>
                              <input type="text" placeholder="Reason for visit" value={chartVisitForm.notes} onChange={e => setChartVisitForm(p => ({ ...p, notes: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={chartVisitSaving} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300">
                              {chartVisitSaving ? 'Saving…' : 'Book Visit'}
                            </button>
                            <button type="button" onClick={() => setChartCreateVisit(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-300">Cancel</button>
                          </div>
                        </form>
                      )}

                      {!chartData.appointments.length ? (
                        <p className="text-sm text-slate-500 py-4 text-center">No visits on file.</p>
                      ) : (
                        <div className="space-y-2">
                          {chartData.appointments.map((apt: any) => (
                            <div key={apt.id} className="border border-slate-200 rounded-lg overflow-hidden">
                              <div className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                  <span className={statusBadge(apt.status)}>{apt.status}</span>
                                  <span className="text-sm text-slate-700">{new Date(apt.scheduledTime).toLocaleString()}</span>
                                  {apt.notes && <span className="text-xs text-slate-400 italic">"{apt.notes}"</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button onClick={() => toggleFeeSheet(apt)} className="text-xs text-amber-600 hover:text-amber-900 font-semibold">Fee Sheet</button>
                                  <button onClick={() => { setChartNoteAptId(apt.id); setChartFeeSheetAptId(null); setChartSection('visits'); }} className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold">Write Note</button>
                                  <button onClick={() => toggleChartSoap(apt)} className="text-xs text-slate-500 hover:text-slate-900 font-semibold">{chartSoapExpanded[apt.id] ? 'Hide Note' : 'View Note'}</button>
                                </div>
                              </div>

                              {chartSoapExpanded[apt.id] && (
                                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                                  {chartSoapData[apt.id] ? (
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      {['soapSubjective', 'soapObjective', 'soapAssessment', 'soapPlan'].map(key => (
                                        <div key={key}>
                                          <p className="text-xs font-semibold text-slate-500 uppercase">{key.replace('soap', '')}</p>
                                          <p className="text-slate-700 mt-0.5">{chartSoapData[apt.id][key] || '—'}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : <p className="text-xs text-slate-400">No SOAP note recorded for this visit.</p>}
                                </div>
                              )}

                              {chartNoteAptId === apt.id && (
                                <form onSubmit={saveChartSoapNote} className="border-t border-slate-100 bg-indigo-50/40 px-4 py-3 space-y-3">
                                  <p className="text-xs font-semibold text-indigo-700 uppercase">Write SOAP Note</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { key: 'soapSubjective', label: 'Subjective' },
                                      { key: 'soapObjective',  label: 'Objective' },
                                      { key: 'soapAssessment', label: 'Assessment' },
                                      { key: 'soapPlan',       label: 'Plan' },
                                    ].map(({ key, label }) => (
                                      <div key={key}>
                                        <label className="block text-xs font-semibold text-slate-600">{label}</label>
                                        <textarea rows={2} value={chartNoteForm[key]} onChange={e => setChartNoteForm(p => ({ ...p, [key]: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm resize-none" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={chartNoteSaving} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300">{chartNoteSaving ? 'Saving…' : 'Save Note'}</button>
                                    <button type="button" onClick={() => setChartNoteAptId(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-300">Cancel</button>
                                  </div>
                                </form>
                              )}

                              {chartFeeSheetAptId === apt.id && (
                                <form onSubmit={saveFeeSheet} className="border-t border-slate-100 bg-amber-50/40 px-4 py-3 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs font-semibold text-amber-700 uppercase">Visit Fee Sheet</p>
                                    {chartFeeSheetData?.status === 'paid' && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">PAID</span>}
                                  </div>
                                  
                                  {chartFeeSheetLoading ? (
                                    <p className="text-xs text-slate-500">Loading fee sheet...</p>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        {chartFeeSheetForm.map((item, idx) => (
                                          <div key={idx} className="flex gap-2 items-start border-b border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                            <div className="w-24">
                                              <input 
                                                type="text" 
                                                placeholder="CPT" 
                                                value={item.cptCode}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].cptCode = e.target.value;
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 uppercase"
                                              />
                                            </div>
                                            <div className="w-24">
                                              <input 
                                                type="text" 
                                                placeholder="ICD-10" 
                                                value={item.icd10Code}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].icd10Code = e.target.value;
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 uppercase"
                                              />
                                            </div>
                                            <div className="w-20">
                                              <input 
                                                type="text" 
                                                placeholder="Mod" 
                                                value={item.modifiers}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].modifiers = e.target.value;
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 uppercase"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <input 
                                                type="text" 
                                                placeholder="Description" 
                                                value={item.description}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].description = e.target.value;
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                                              />
                                            </div>
                                            <div className="w-20 relative">
                                              <span className="absolute left-2 top-1.5 text-slate-400 text-sm">x</span>
                                              <input 
                                                type="number" 
                                                min="1"
                                                value={item.quantity}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].quantity = Number(e.target.value);
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 pl-5 pr-2 py-1.5 text-sm disabled:bg-slate-50"
                                              />
                                            </div>
                                            <div className="w-24 relative">
                                              <span className="absolute left-2 top-1.5 text-slate-400 text-sm">$</span>
                                              <input 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                value={item.amount}
                                                disabled={chartFeeSheetData?.status === 'paid'}
                                                onChange={e => {
                                                  const newForm = [...chartFeeSheetForm];
                                                  newForm[idx].amount = e.target.value;
                                                  setChartFeeSheetForm(newForm);
                                                }}
                                                className="w-full rounded border border-slate-300 pl-5 pr-2 py-1.5 text-sm disabled:bg-slate-50"
                                              />
                                            </div>
                                            {chartFeeSheetData?.status !== 'paid' && (
                                              <button 
                                                type="button" 
                                                onClick={() => setChartFeeSheetForm(chartFeeSheetForm.filter((_, i) => i !== idx))}
                                                className="mt-1 text-slate-400 hover:text-red-500"
                                              >
                                                <X className="w-5 h-5" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {chartFeeSheetData?.status !== 'paid' && (
                                        <button 
                                          type="button" 
                                          onClick={() => setChartFeeSheetForm([...chartFeeSheetForm, { cptCode: '', icd10Code: '', modifiers: '', description: '', quantity: 1, amount: 0 }])}
                                          className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> Add Line Item
                                        </button>
                                      )}

                                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                        <div className="text-sm font-semibold text-slate-700">
                                          Total: ${chartFeeSheetForm.reduce((sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0).toFixed(2)}
                                        </div>
                                        <div className="flex gap-2">
                                          {chartFeeSheetData?.status !== 'paid' && (
                                            <button type="submit" disabled={chartFeeSheetSaving} className="px-4 py-1.5 bg-amber-600 text-white rounded text-sm font-semibold hover:bg-amber-700 disabled:bg-amber-300">
                                              {chartFeeSheetSaving ? 'Saving…' : (chartFeeSheetData ? 'Update Fee Sheet' : 'Save Fee Sheet')}
                                            </button>
                                          )}
                                          <button type="button" onClick={() => setChartFeeSheetAptId(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-300">Close</button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {chartSection === 'records' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-1.5"><FileText className="h-4 w-4 text-slate-500" /> Clinical Documents</h3>
                      {!chartData.records.length ? <p className="text-sm text-slate-500 py-4 text-center">No shared documents.</p> : (
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50"><tr>{['Type', 'Description', 'Date', 'Download'].map(h => <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase ${h === 'Download' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-slate-200">
                            {chartData.records.map((r: any) => (
                              <tr key={r.recordId}>
                                <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{r.recordType}</td>
                                <td className="px-4 py-2.5 text-sm text-slate-700 max-w-sm truncate">{r.description}</td>
                                <td className="px-4 py-2.5 text-sm text-slate-500">{new Date(r.uploadDate || r.createdAt || '').toLocaleDateString()}</td>
                                <td className="px-4 py-2.5 text-right"><button onClick={() => handleDownloadRecord(r)} className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center gap-1 ml-auto"><Download className="h-3.5 w-3.5" /> Download</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {chartSection === 'officeNotes' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-slate-800">Office Notes</h3>
                      </div>
                      <form onSubmit={saveChartOfficeNote} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <textarea value={chartOfficeNoteForm.content} onChange={e => setChartOfficeNoteForm(p => ({ ...p, content: e.target.value }))} rows={2} placeholder="Add an internal office note..." className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required></textarea>
                        <div className="flex justify-end"><button type="submit" disabled={chartOfficeNoteSaving} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300">{chartOfficeNoteSaving ? 'Saving...' : 'Add Note'}</button></div>
                      </form>
                      <div className="space-y-3">
                        {!(chartData.officeNotes || []).length ? <p className="text-sm text-slate-500 py-4 text-center">No office notes.</p> : chartData.officeNotes.map((n: any) => (
                          <div key={n.id} className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.content}</p>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><User className="h-3 w-3" /> {n.authorName} &bull; {new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {chartSection === 'education' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-slate-800">Patient Education</h3>
                      </div>
                      <form onSubmit={saveChartEducation} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <input type="text" value={chartEduForm.title} onChange={e => setChartEduForm(p => ({ ...p, title: e.target.value }))} placeholder="Title (e.g. Diabetes Management)" className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                        <textarea value={chartEduForm.content} onChange={e => setChartEduForm(p => ({ ...p, content: e.target.value }))} rows={2} placeholder="Add educational text or a link..." className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required></textarea>
                        <div className="flex justify-end"><button type="submit" disabled={chartEduSaving} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300">{chartEduSaving ? 'Saving...' : 'Add Education'}</button></div>
                      </form>
                      <div className="space-y-3">
                        {!(chartData.education || []).length ? <p className="text-sm text-slate-500 py-4 text-center">No education materials attached.</p> : chartData.education.map((e: any) => (
                          <div key={e.id} className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                            <p className="font-semibold text-slate-800 text-sm">{e.title}</p>
                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{e.content}</p>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><User className="h-3 w-3" /> {e.authorName} &bull; {new Date(e.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {chartSection === 'authorizations' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-slate-800">Authorizations</h3>
                      </div>
                      <form onSubmit={saveChartAuthorization} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={chartAuthForm.requestedItem} onChange={e => setChartAuthForm(p => ({ ...p, requestedItem: e.target.value }))} placeholder="Requested Item / Procedure" className="rounded border border-slate-300 px-3 py-2 text-sm" required />
                          <input type="text" value={chartAuthForm.payer} onChange={e => setChartAuthForm(p => ({ ...p, payer: e.target.value }))} placeholder="Payer / Insurance" className="rounded border border-slate-300 px-3 py-2 text-sm" required />
                        </div>
                        <div className="flex justify-between items-center">
                          <select value={chartAuthForm.status} onChange={e => setChartAuthForm(p => ({ ...p, status: e.target.value }))} className="rounded border border-slate-300 px-3 py-1.5 text-sm bg-white">
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="denied">Denied</option>
                          </select>
                          <button type="submit" disabled={chartAuthSaving} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300">{chartAuthSaving ? 'Saving...' : 'Add Auth'}</button>
                        </div>
                      </form>
                      <div className="space-y-3">
                        {!(chartData.authorizations || []).length ? <p className="text-sm text-slate-500 py-4 text-center">No authorizations.</p> : (
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50"><tr>{['Item', 'Payer', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase text-left">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-slate-200">
                              {chartData.authorizations.map((a: any) => (
                                <tr key={a.id}>
                                  <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{a.requestedItem}</td>
                                  <td className="px-4 py-2.5 text-sm text-slate-600">{a.payer}</td>
                                  <td className="px-4 py-2.5 text-sm">{<span className={statusBadge(a.status)}>{a.status}</span>}</td>
                                  <td className="px-4 py-2.5 text-sm text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS + CALENDAR ───────────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* View toggle + calendar nav */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {(['list', 'day', 'week', 'month'] as const).map(v => (
                <button key={v} onClick={() => setCalView(v)} className={`px-3 py-1.5 text-sm font-semibold rounded capitalize ${calView === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{v}</button>
              ))}
            </div>
            {calView !== 'list' && (
              <div className="flex items-center gap-3">
                <button onClick={() => navigateCal(-1)} className="p-1.5 rounded hover:bg-slate-100"><ChevronLeft className="h-4 w-4 text-slate-600" /></button>
                <span className="text-sm font-semibold text-slate-700 min-w-48 text-center">{calLabel}</span>
                <button onClick={() => navigateCal(1)} className="p-1.5 rounded hover:bg-slate-100"><ChevronRight className="h-4 w-4 text-slate-600" /></button>
                <button onClick={() => setCalDate(new Date())} className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded hover:bg-slate-200">Today</button>
              </div>
            )}
          </div>

          {/* LIST VIEW */}
          {calView === 'list' && (
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Scheduled Consultations</h2>
              {!(appointments || []).length ? (
                <p className="text-sm text-slate-500 text-center py-8">No appointments found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(appointments || []).map((apt: any) => (
                    <div key={apt.id} className="border border-slate-200 p-4 rounded-lg flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-base">{apt.patientName || apt.patientId}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(apt.scheduledTime).toLocaleString()}</p>
                        <p className="text-sm text-slate-600 mt-3 italic">"{apt.notes || 'No notes.'}"</p>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex gap-3">
                          <button type="button" onClick={() => { setRxPicker({ isNew: false, patientId: apt.patientId, patientName: apt.patientName || '' }); setIsRxPrefilled(true); setActiveTab('prescriptions'); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 flex items-center gap-0.5"><Pill className="h-3 w-3" /> Prescribe</button>
                          <button type="button" onClick={() => { setLabPicker({ isNew: false, patientId: apt.patientId, patientName: apt.patientName || '' }); setIsLabPrefilled(true); setActiveTab('labs'); }} className="text-xs font-semibold text-teal-600 hover:text-teal-900 flex items-center gap-0.5"><FlaskConical className="h-3 w-3" /> Order Lab</button>
                          <button type="button" onClick={() => openChart({ id: apt.patientId, name: apt.patientName || apt.patientId })} className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"><FileText className="h-3 w-3" /> Chart</button>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className={statusBadge(apt.status)}>{apt.status}</span>
                        {apt.status === 'scheduled' && <button onClick={() => handleUpdateAptStatus(apt.id, 'completed')} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Complete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DAY VIEW */}
          {calView === 'day' && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => {
                  const slotDate = new Date(calDate);
                  slotDate.setHours(hour, 0, 0, 0);
                  const slotApts = (appointments || []).filter((apt: any) => {
                    const d = new Date(apt.scheduledTime);
                    return d.toDateString() === slotDate.toDateString() && d.getHours() === hour;
                  });
                  return (
                    <div key={hour} className="flex min-h-14 group cursor-pointer hover:bg-indigo-50/30 transition" onClick={() => { const s = new Date(calDate); s.setHours(hour, 0, 0, 0); handleCalSlotClick(s); }}>
                      <div className="w-16 flex-shrink-0 border-r border-slate-100 flex items-start justify-end px-3 pt-2">
                        <span className="text-xs text-slate-400 font-mono">{hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}</span>
                      </div>
                      <div className="flex-1 px-3 py-1.5 flex flex-wrap gap-1.5 items-start">
                        {slotApts.map((apt: any) => (
                          <div key={apt.id} onClick={e => e.stopPropagation()} style={{ borderLeftColor: aptStatusColor(apt.status) }} className="border-l-4 pl-2 bg-white shadow-sm rounded text-xs py-1 pr-2 cursor-default">
                            <p className="font-semibold text-slate-800">{apt.patientName}</p>
                            <p className="text-slate-400">{fmtTime(new Date(apt.scheduledTime))}</p>
                          </div>
                        ))}
                        {slotApts.length === 0 && <span className="text-xs text-slate-200 group-hover:text-slate-400">+ Add</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {calView === 'week' && (() => {
            const weekStart = new Date(calDate); weekStart.setDate(calDate.getDate() - calDate.getDay());
            const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
            return (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-200">
                  {days.map(day => (
                    <div key={day.toISOString()} className="p-3 text-center border-r border-slate-100 last:border-0">
                      <p className="text-xs text-slate-400 uppercase">{day.toLocaleDateString('en', { weekday: 'short' })}</p>
                      <p className={`text-lg font-bold mt-0.5 ${day.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-slate-700'}`}>{day.getDate()}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 min-h-96 divide-x divide-slate-100">
                  {days.map(day => {
                    const dayApts = getAptsForDate(day);
                    return (
                      <div key={day.toISOString()} className="p-2 space-y-1 cursor-pointer hover:bg-indigo-50/20 transition" onClick={() => handleCalSlotClick(day)}>
                        {dayApts.map((apt: any) => (
                          <div key={apt.id} onClick={e => e.stopPropagation()} style={{ background: aptStatusColor(apt.status) + '22', borderColor: aptStatusColor(apt.status) }} className="border rounded px-2 py-1 text-xs cursor-default" >
                            <p className="font-semibold text-slate-800 truncate">{apt.patientName}</p>
                            <p className="text-slate-500">{fmtTime(new Date(apt.scheduledTime))}</p>
                          </div>
                        ))}
                        {dayApts.length === 0 && <span className="text-[10px] text-slate-200 select-none">+ Add</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* MONTH VIEW */}
          {calView === 'month' && (() => {
            const year = calDate.getFullYear(), month = calDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const cells: (Date | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))];
            return (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="p-3 text-xs font-semibold text-slate-500 text-center uppercase">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                  {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="min-h-20 bg-slate-50/50" />;
                    const dayApts = getAptsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div key={day.toISOString()} className="min-h-20 p-1.5 cursor-pointer hover:bg-indigo-50/20 transition" onClick={() => handleCalSlotClick(day)}>
                        <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>{day.getDate()}</p>
                        {dayApts.slice(0, 2).map((apt: any) => (
                          <div key={apt.id} onClick={e => e.stopPropagation()} style={{ backgroundColor: aptStatusColor(apt.status) + '33' }} className="rounded text-[10px] px-1 py-0.5 truncate text-slate-700 cursor-default mb-0.5">{apt.patientName}</div>
                        ))}
                        {dayApts.length > 2 && <p className="text-[10px] text-slate-400">+{dayApts.length - 2} more</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Booking modal */}
          {calModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setCalModalOpen(false)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Book Appointment</h3>
                <p className="text-sm text-slate-500 mb-4">{calModalSlot ? calModalSlot.toLocaleString() : ''}</p>
                <form onSubmit={handleCalBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
                    <PatientPicker value={calModalPicker} onChange={setCalModalPicker} existingOnly={true} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Reason</label>
                    <input type="text" value={calModalNotes} onChange={e => setCalModalNotes(e.target.value)} placeholder="Reason for visit…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={!calModalPicker.patientId || calModalSaving} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300">
                      {calModalSaving ? 'Booking…' : 'Confirm Appointment'}
                    </button>
                    <button type="button" onClick={() => setCalModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PRESCRIPTIONS ─────────────────────────────────────────────────────── */}
      {activeTab === 'prescriptions' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><Pill className="h-5 w-5 text-indigo-600" /> Create Prescription</h2>
            <form onSubmit={handleCreatePrescription} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                {rxPicker.patientId && isRxPrefilled ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center">
                    <div><span className="block text-xs font-semibold text-indigo-900">{rxPicker.patientName}</span><span className="block text-[10px] text-indigo-700 font-mono">ID: {rxPicker.patientId}</span></div>
                    <button type="button" onClick={() => { setRxPicker({ isNew: false, patientId: '', patientName: '' }); setIsRxPrefilled(false); }} className="text-xs text-rose-600 hover:text-rose-900 font-semibold">Clear</button>
                  </div>
                ) : (
                  <PatientPicker value={rxPicker} onChange={setRxPicker} existingOnly={true} />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Assign to Pharmacy</label>
                <select value={rxForm.assignedPharmacyId} onChange={e => setRxForm({ ...rxForm, assignedPharmacyId: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white">
                  <option value="">Any Available Pharmacy</option>
                  {(pharmaciesList || []).map((p: any) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Medication Name</label>
                <input type="text" required placeholder="e.g. Amoxicillin" value={rxForm.medName} onChange={e => setRxForm({ ...rxForm, medName: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-xs font-semibold text-slate-600">Dosage</label><input type="text" placeholder="500mg" value={rxForm.dosage} onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs" /></div>
                <div><label className="block text-xs font-semibold text-slate-600">Frequency</label><input type="text" placeholder="TID" value={rxForm.frequency} onChange={e => setRxForm({ ...rxForm, frequency: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs" /></div>
                <div><label className="block text-xs font-semibold text-slate-600">Duration</label><input type="text" placeholder="7d" value={rxForm.duration} onChange={e => setRxForm({ ...rxForm, duration: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-xs" /></div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2">Issue Prescription</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Prescription History</h2>
            {!(prescriptions || []).length ? <p className="text-sm text-slate-500 text-center py-8">No prescriptions issued yet.</p> : (
              <div className="space-y-4">
                {(prescriptions || []).map((rx: any) => (
                  <div key={rx.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                    <div><p className="font-semibold text-slate-800">{rx.patientName}</p><p className="text-sm text-slate-600 mt-1">{rx.medicationDetails}</p></div>
                    <span className={statusBadge(rx.status)}>{rx.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LABORATORY ORDERS ─────────────────────────────────────────────────── */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'orders', label: 'Orders' },
              { id: 'overview', label: 'Overview' },
              { id: 'batch', label: 'Batch Results' },
              { id: 'reports', label: 'Electronic Reports' },
              { id: 'documents', label: 'Lab Documents' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLabTab(tab.id as any)}
                className={`px-3 py-1.5 text-sm font-semibold rounded transition ${labTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {labTab === 'orders' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1"><FlaskConical className="h-5 w-5 text-indigo-600" /> Order Lab Test</h2>
            <form onSubmit={handleCreateLabOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                {labPicker.patientId && isLabPrefilled ? (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
                    <div><span className="block text-xs font-semibold text-teal-900">{labPicker.patientName}</span><span className="block text-[10px] text-teal-700 font-mono">ID: {labPicker.patientId}</span></div>
                    <button type="button" onClick={() => { setLabPicker({ isNew: false, patientId: '', patientName: '' }); setIsLabPrefilled(false); }} className="text-xs text-rose-600 hover:text-rose-900 font-semibold">Clear</button>
                  </div>
                ) : (
                  <PatientPicker value={labPicker} onChange={setLabPicker} existingOnly={true} />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Test Name</label>
                <input type="text" required placeholder="e.g. CBC" value={labForm.testName} onChange={e => setLabForm({ ...labForm, testName: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Assign to Lab</label>
                <select value={labForm.assignedLabId} onChange={e => setLabForm({ ...labForm, assignedLabId: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white">
                  <option value="">Any Available Lab</option>
                  {(labsList || []).map((l: any) => <option key={l.id} value={l.id}>{l.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Special Instructions</label>
                <textarea value={labForm.notes} onChange={e => setLabForm({ ...labForm, notes: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 mt-2">Order Lab Test</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Laboratory Orders</h2>
            {!(labOrders || []).length ? <p className="text-sm text-slate-500 text-center py-8">No lab orders recorded.</p> : (
              <div className="space-y-4">
                {(labOrders || []).map((lab: any) => (
                  <div key={lab.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{lab.patientName}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{lab.testName}</p>
                      {lab.notes && <p className="text-xs text-slate-500 mt-1 italic">{lab.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(lab.status)}>{lab.status}</span>
                      {lab.status === 'completed' && (
                        <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700" onClick={async () => { await api.notifyLabOrder(lab.id, 'patient'); showToast?.('Patient notified', false); }}>Notify</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {labTab === 'overview' && (
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Laboratory Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg bg-indigo-50 border-indigo-100">
                <p className="text-sm text-indigo-800 font-semibold mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-indigo-900">{(labOrders || []).length}</p>
              </div>
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
                <p className="text-sm text-amber-800 font-semibold mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-amber-900">{(labOrders || []).filter((o: any) => o.status !== 'completed').length}</p>
              </div>
              <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100">
                <p className="text-sm text-emerald-800 font-semibold mb-1">Completed Results</p>
                <p className="text-3xl font-bold text-emerald-900">{(labOrders || []).filter((o: any) => o.status === 'completed').length}</p>
              </div>
            </div>
          </div>
        )}

        {labTab === 'batch' && (
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Batch Upload Lab Results</h2>
            <p className="text-sm text-slate-600 mb-6">Upload a CSV file to process multiple lab results simultaneously. Format must be: <code>labOrderId, resultSummary, resultsJSON</code>.</p>
            <form onSubmit={handleBatchUpload} className="max-w-md space-y-4 border border-dashed border-slate-300 p-8 rounded-lg bg-slate-50 text-center">
              <div>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={e => setLabBatchFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                />
              </div>
              {labBatchFile && (
                <button 
                  type="submit" 
                  disabled={labBatchLoading}
                  className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {labBatchLoading ? 'Processing...' : 'Upload & Process Batch'}
                </button>
              )}
            </form>
          </div>
        )}

        {labTab === 'reports' && (
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Electronic Lab Reports</h2>
            <div className="space-y-4">
              {(labOrders || []).filter((o: any) => o.status === 'completed' && Object.keys(o.resultFields || {}).length > 0).length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No electronic reports available.</p>
              ) : (
                (labOrders || []).filter((o: any) => o.status === 'completed' && Object.keys(o.resultFields || {}).length > 0).map((lab: any) => (
                  <div key={lab.id} className="border border-slate-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">{lab.patientName} <span className="text-sm font-normal text-slate-500">— {lab.testName}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Order ID: {lab.id}</p>
                      </div>
                      {lab.critical && <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">CRITICAL</span>}
                    </div>
                    {lab.resultSummary && <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-2 rounded">{lab.resultSummary}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(lab.resultFields).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm font-semibold text-slate-800">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {labTab === 'documents' && (
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Lab Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(labOrders || []).filter((o: any) => o.status === 'completed' && o.pdfBlobUrl).length === 0 ? (
                <div className="col-span-full">
                  <p className="text-sm text-slate-500 py-4">No PDF documents available.</p>
                </div>
              ) : (
                (labOrders || []).filter((o: any) => o.status === 'completed' && o.pdfBlobUrl).map((lab: any) => (
                  <div key={lab.id} className="border border-slate-200 p-4 rounded-lg flex flex-col justify-between h-full bg-slate-50 hover:bg-slate-100 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-red-500" />
                        <p className="font-semibold text-slate-800 text-sm truncate" title={lab.testName}>{lab.testName}</p>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{lab.patientName}</p>
                      <p className="text-xs text-slate-500">Completed on {new Date(lab.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <a 
                      href={lab.pdfBlobUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 text-center block w-full bg-white border border-slate-300 text-slate-700 rounded py-1.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      View PDF
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        </div>
      )}

      {/* ── INTAKE QUEUE ──────────────────────────────────────────────────────── */}
      {activeTab === 'intake_queue' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Checked-in Patient Queue</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-3">
              <h3 className="text-md font-semibold text-slate-800">Queue</h3>
              {!(intakesList || []).length ? <p className="text-sm text-slate-500 py-6 text-center">No patients checked in.</p> : (
                <div className="space-y-3">
                  {(intakesList || []).map((itk: any) => (
                    <div key={itk.id} onClick={() => { setSelectedIntake(itk); handleFetchAuditHistory(itk.id); }}
                      className={`p-4 border rounded-lg cursor-pointer transition flex items-center justify-between ${selectedIntake?.id === itk.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div>
                        <p className="font-semibold text-slate-900">{itk.patient_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(itk.created_at).toLocaleTimeString()}</p>
                      </div>
                      <span className={statusBadge(itk.status)}>{itk.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              {selectedIntake ? (
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedIntake.patient_name}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">DOB: {new Date(selectedIntake.date_of_birth).toLocaleDateString()} | {selectedIntake.gender}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedIntake.status === 'checked_in' && <button onClick={() => handleUpdateIntakeStatus(selectedIntake.id, 'in_consultation')} className="bg-indigo-600 text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-indigo-700">Start Consultation</button>}
                      {selectedIntake.status === 'in_consultation' && <>
                        <button type="button" onClick={() => { setRxPicker({ isNew: false, patientId: selectedIntake.patient_id, patientName: selectedIntake.patient_name || '' }); setIsRxPrefilled(true); setActiveTab('prescriptions'); }} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-3 py-1.5 text-sm font-semibold hover:bg-indigo-100 flex items-center gap-1"><Pill className="h-4 w-4" /> Prescribe</button>
                        <button type="button" onClick={() => { setLabPicker({ isNew: false, patientId: selectedIntake.patient_id, patientName: selectedIntake.patient_name || '' }); setIsLabPrefilled(true); setActiveTab('labs'); }} className="bg-teal-50 text-teal-700 border border-teal-200 rounded px-3 py-1.5 text-sm font-semibold hover:bg-teal-100 flex items-center gap-1"><FlaskConical className="h-4 w-4" /> Order Lab</button>
                        <button onClick={() => handleUpdateIntakeStatus(selectedIntake.id, 'completed')} className="bg-emerald-600 text-white rounded px-4 py-1.5 text-sm font-semibold hover:bg-emerald-700">Complete Visit</button>
                      </>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[['Blood Pressure', selectedIntake.vitals?.bloodPressure], ['Pulse', `${selectedIntake.vitals?.pulse || '–'} bpm`], ['Temperature', `${selectedIntake.vitals?.temperature || '–'} °F`], ['SpO₂', `${selectedIntake.vitals?.spo2 || '–'} %`]].map(([label, val]) => (
                      <div key={label} className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500">{label}</p><p className="text-base font-semibold text-slate-800 mt-1">{val || '–'}</p></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {[['Allergies', selectedIntake.allergies], ['Medications', selectedIntake.medications], ['Medical History', selectedIntake.medical_history]].map(([label, val]) => (
                      <div key={label} className="bg-slate-50 p-4 rounded-lg"><p className="font-semibold text-slate-700 mb-1">{label}</p><p className="text-slate-600 whitespace-pre-line">{val || `No ${label?.toLowerCase()}.`}</p></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-12 text-center text-slate-500">Select a patient from the queue to review their intake information.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGES ──────────────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row" style={{ minHeight: '600px' }}>
          <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Patient Conversations</h3>
              <button onClick={loadMsgContacts} className="text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${msgLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {msgContacts.length === 0 ? <div className="p-6 text-center text-slate-400 text-xs">{msgLoading ? 'Loading…' : 'No patient conversations.'}</div> : (
                msgContacts.map((c: any) => (
                  <button key={c.id} onClick={() => loadMsgThread(c)} className={`w-full text-left px-4 py-3 border-b border-slate-100 flex items-center gap-3 transition ${msgSelectedContact?.id === c.id ? 'bg-indigo-50 border-l-2 border-l-indigo-600' : 'hover:bg-white'}`}>
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">{(c.name || '?')[0].toUpperCase()}</div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {!msgSelectedContact ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-400"><MessageSquare className="h-10 w-10" /><p className="text-sm">Select a patient.</p></div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{(msgSelectedContact.name || '?')[0].toUpperCase()}</div>
                  <div><p className="font-semibold text-slate-800 text-sm">{msgSelectedContact.name}</p><p className="text-xs text-slate-400">Patient · {msgSelectedContact.id}</p></div>
                  <button onClick={() => loadMsgThread(msgSelectedContact)} className="ml-auto text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${msgThreadLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {msgThreadLoading ? <div className="text-center py-12"><RefreshCw className="h-5 w-5 text-indigo-300 animate-spin mx-auto" /></div> :
                    !msgThread.length ? <div className="text-center py-12 text-slate-400 text-sm">No messages yet.</div> :
                    msgThread.map((msg: any) => {
                      const isMe = (msg.sender_id || msg.senderId) === currentUser?.userId;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                            <p>{msg.content}</p>
                            {(msg.sent_at || msg.sentAt) && (
                              <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {new Date(msg.sent_at || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && (
                                  <span className="ml-1 text-[9px]">{ (msg.is_read || msg.isRead) ? '✓✓' : '✓' }</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <form onSubmit={handleSendMsg} className="px-4 py-4 border-t border-slate-200 flex gap-3 items-end">
                  <textarea value={msgCompose} onChange={e => setMsgCompose(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMsg(e as any); } }} placeholder="Type a secure message…" rows={2} className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="submit" disabled={!msgCompose.trim() || msgSending} className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300"><Send className="h-4 w-4" /></button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── RECALLS ───────────────────────────────────────────────────────────── */}
      {activeTab === 'recalls' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><Bell className="h-5 w-5 text-indigo-600" /> Recall Board</h2>
              <p className="text-sm text-slate-500 mt-0.5">Patients needing follow-up with no scheduled appointment.</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex gap-1">
                {['pending', 'contacted', 'completed', 'cancelled', ''].map(s => (
                  <button key={s || 'all'} onClick={() => setRecallFilter(s)} className={`px-3 py-1.5 text-xs font-semibold rounded capitalize ${recallFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s || 'All'}</button>
                ))}
              </div>
              <button onClick={() => setRecallFormOpen(v => !v)} className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700"><Plus className="h-4 w-4" /> New Recall</button>
              <button onClick={() => loadRecalls(recallFilter)} className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${recallsLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
            </div>
          </div>

          {recallFormOpen && (
            <div className="bg-white border border-indigo-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-indigo-900 mb-4 flex items-center gap-1.5"><Plus className="h-4 w-4" /> Create Recall</h3>
              <form onSubmit={handleCreateRecall} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
                  <PatientPicker value={recallPicker} onChange={setRecallPicker} existingOnly={true} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Reason for Recall</label>
                    <input type="text" required placeholder="e.g. BP recheck" value={recallForm.reason} onChange={e => setRecallForm(p => ({ ...p, reason: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Due Date</label>
                    <input type="date" required value={recallForm.dueDate} onChange={e => setRecallForm(p => ({ ...p, dueDate: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Notes (optional)</label>
                  <textarea value={recallForm.notes} onChange={e => setRecallForm(p => ({ ...p, notes: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm resize-none" rows={2} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={recallSaving || !recallPicker.patientId} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300">{recallSaving ? 'Saving…' : 'Create Recall'}</button>
                  <button type="button" onClick={() => setRecallFormOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-300">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {recallsLoading ? (
              <div className="p-12 text-center"><RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mx-auto" /></div>
            ) : !recalls.length ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                No recalls found{recallFilter ? ` with status "${recallFilter}"` : ''}.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>{['Patient', 'Reason', 'Due Date', 'Notes', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recalls.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{r.patientName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.reason}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{r.notes || '—'}</td>
                      <td className="px-4 py-3"><span className={statusBadge(r.status)}>{r.status}</span></td>
                      <td className="px-4 py-3">
                        {r.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRecallStatusUpdate(r.id, 'contacted')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-100">Contacted</button>
                            <button onClick={() => handleRecallStatusUpdate(r.id, 'completed')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold hover:bg-emerald-100">Done</button>
                            <button onClick={() => handleRecallStatusUpdate(r.id, 'cancelled')} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold hover:bg-rose-100">Cancel</button>
                          </div>
                        )}
                        {r.status === 'contacted' && (
                          <button onClick={() => handleRecallStatusUpdate(r.id, 'completed')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold hover:bg-emerald-100">Mark Done</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── PORTAL STAFF VIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'portal' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5 mb-4"><BookOpen className="h-5 w-5 text-indigo-600" /> Patient Portal — Staff View</h2>
            <div className="flex gap-1.5">
              <button onClick={() => setPortalSection('mail')} className={`px-4 py-2 text-sm font-semibold rounded ${portalSection === 'mail' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Portal Mail</button>
              <button onClick={() => setPortalSection('payments')} className={`px-4 py-2 text-sm font-semibold rounded ${portalSection === 'payments' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Portal Payments</button>
            </div>
          </div>

          {/* Portal Mail — read-only view of patient message threads */}
          {portalSection === 'mail' && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row" style={{ minHeight: '500px' }}>
              <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Patient Threads</h3>
                  <button onClick={loadPortalContacts} className="text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${portalContactsLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {portalContacts.length === 0 ? <div className="p-6 text-center text-slate-400 text-xs">{portalContactsLoading ? 'Loading…' : 'No patient threads. Requires appointment history.'}</div> : (
                    portalContacts.map((c: any) => (
                      <button key={c.id} onClick={() => loadPortalThread(c)} className={`w-full text-left px-4 py-3 border-b border-slate-100 flex items-center gap-3 transition ${portalSelectedContact?.id === c.id ? 'bg-indigo-50 border-l-2 border-l-indigo-600' : 'hover:bg-white'}`}>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">{(c.name || '?')[0].toUpperCase()}</div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                {!portalSelectedContact ? (
                  <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-400"><MessageSquare className="h-10 w-10" /><p className="text-sm">Select a patient to view their messages.</p></div>
                ) : (
                  <>
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{(portalSelectedContact.name || '?')[0].toUpperCase()}</div>
                      <div><p className="font-semibold text-slate-800 text-sm">{portalSelectedContact.name}</p><p className="text-xs text-slate-400">Read-only staff view</p></div>
                      <button onClick={() => loadPortalThread(portalSelectedContact)} className="ml-auto text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${portalThreadLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                      {portalThreadLoading ? <div className="text-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-indigo-300 mx-auto" /></div> :
                        !portalThread.length ? <div className="text-center py-12 text-slate-400 text-sm">No messages in this thread.</div> :
                        portalThread.map((msg: any) => {
                          const isPatient = (msg.sender_id || msg.senderId) !== currentUser?.userId;
                          return (
                            <div key={msg.id} className={`flex ${isPatient ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isPatient ? 'bg-slate-100 text-slate-800 rounded-bl-sm' : 'bg-indigo-600 text-white rounded-br-sm'}`}>
                                <p className="text-[10px] font-semibold mb-0.5 opacity-60">{isPatient ? 'Patient' : 'You (Dr.)'}</p>
                                <p>{msg.content}</p>
                                {(msg.sent_at || msg.sentAt) && (
                                  <p className="text-[10px] mt-1 opacity-60">
                                    {new Date(msg.sent_at || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {!isPatient && (
                                      <span className="ml-1 text-[9px]">{ (msg.is_read || msg.isRead) ? '✓✓' : '✓' }</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Portal Payments */}
          {portalSection === 'payments' && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Search Patient</label>
                <div className="max-w-md">
                  <PatientPicker value={portalInvoicePicker} onChange={setPortalInvoicePicker} existingOnly={true} />
                </div>
              </div>
              {portalInvoicePicker.patientId && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">Invoices for {portalInvoicePicker.patientName}</h3>
                    <button onClick={() => loadPortalInvoices(portalInvoicePicker.patientId)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><RefreshCw className={`h-4 w-4 ${portalInvoicesLoading ? 'animate-spin text-indigo-400' : ''}`} /></button>
                  </div>
                  {portalInvoicesLoading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin text-indigo-300 mx-auto" /></div> :
                    !portalInvoices.length ? <p className="text-sm text-slate-500 text-center py-8">No invoices found.</p> : (
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr>{['Invoice ID', 'Amount', 'Status', 'Created', 'Paid At'].map(h => <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase text-left">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-200">
                          {portalInvoices.map((inv: any) => (
                            <tr key={inv.id}>
                              <td className="px-4 py-3 text-xs font-mono text-slate-500">{inv.id.slice(0, 8)}…</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-800">${inv.amount?.toFixed(2)}</td>
                              <td className="px-4 py-3"><span className={statusBadge(inv.status)}>{inv.status}</span></td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </>
              )}
              {!portalInvoicePicker.patientId && (
                <div className="border border-dashed border-slate-200 rounded-lg p-10 text-center">
                  <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Search for a patient above to view their invoices.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── RECORD REQUESTS ───────────────────────────────────────────────────── */}
      {activeTab === 'record_requests' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5"><ClipboardList className="h-5 w-5 text-indigo-600" /> Patient Record Requests</h2>
              <p className="text-sm text-slate-500 mt-0.5">Review and approve/deny patient requests for copies of their records.</p>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => setRecordRequestFormOpen(v => !v)} className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700"><Plus className="h-4 w-4" /> New Request</button>
            </div>
          </div>

          {/* New record request form */}
          {recordRequestFormOpen && (
            <div className="bg-white border border-indigo-200 rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-indigo-900 flex items-center gap-1.5"><Plus className="h-4 w-4" /> Submit Record Request</h3>
              <form onSubmit={handleSubmitRecordRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
                  <PatientPicker value={recordRequestPicker} onChange={setRecordRequestPicker} existingOnly={true} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Request Type</label>
                    <select value={recordRequestForm.requestType} onChange={e => setRecordRequestForm(p => ({ ...p, requestType: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white">
                      <option value="full_chart">Full Chart</option>
                      <option value="lab_results">Lab Results Only</option>
                      <option value="prescriptions">Prescriptions Only</option>
                      <option value="imaging">Imaging/Documents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Purpose</label>
                    <input type="text" required placeholder="e.g. Referral to specialist" value={recordRequestForm.purpose} onChange={e => setRecordRequestForm(p => ({ ...p, purpose: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={recordRequestSaving || !recordRequestPicker.patientId} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300">{recordRequestSaving ? 'Submitting…' : 'Submit Request'}</button>
                  <button type="button" onClick={() => setRecordRequestFormOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-300">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Patient search for existing requests */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">View Requests for Patient</label>
              <div className="max-w-md">
                <PatientPicker
                  value={{ isNew: false, patientId: recordRequestSearchPid, patientName: '' }}
                  onChange={val => setRecordRequestSearchPid(val.patientId)}
                  existingOnly={true}
                />
              </div>
            </div>

            {recordRequestSearchPid && (
              <>
                {recordRequestsLoading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin text-indigo-300 mx-auto" /></div> :
                  !recordRequests.length ? <p className="text-sm text-slate-500 text-center py-6">No record requests found for this patient.</p> : (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50"><tr>{['Request Type', 'Purpose', 'Requested By', 'Submitted', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase text-left">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {recordRequests.map((req: any) => {
                          const formData = (() => { try { return typeof req.form_data === 'string' ? JSON.parse(req.form_data) : req.form_data || req.formData || {}; } catch { return {}; } })();
                          return (
                            <tr key={req.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-semibold text-slate-800 capitalize">{(formData.requestType || '—').replace('_', ' ')}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{formData.purpose || '—'}</td>
                              <td className="px-4 py-3 text-xs font-mono text-slate-500">{formData.requestedBy || '—'}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(req.submitted_at || req.submittedAt || '').toLocaleDateString()}</td>
                              <td className="px-4 py-3"><span className={statusBadge(req.status)}>{req.status}</span></td>
                              <td className="px-4 py-3">
                                {req.status === 'submitted' || req.status === 'pending' ? (
                                  <div className="flex gap-1.5">
                                    <button onClick={() => handleApproveRejectRequest(req.id, 'approved')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold hover:bg-emerald-100">Approve</button>
                                    <button onClick={() => handleApproveRejectRequest(req.id, 'denied')} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold hover:bg-rose-100">Deny</button>
                                  </div>
                                ) : <span className="text-xs text-slate-400">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
              </>
            )}
            {!recordRequestSearchPid && (
              <div className="border border-dashed border-slate-200 rounded-lg p-10 text-center">
                <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a patient above to view or manage their record requests.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── REPORTS ──────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <ReportsView 
          currentUser={currentUser} 
          appointments={appointments} 
          prescriptions={prescriptions}
          labOrders={labOrders}
          invoices={allInvoices}
          eligibilityChecks={allEligibilityChecks}
          onEligibilityCheckAdded={(chk: any) => setAllEligibilityChecks([chk, ...allEligibilityChecks])}
        />
      )}

    </div>
  );
}

// ─── REPORTS SUB-COMPONENT ────────────────────────────────────────────────────
function ReportsView({ 
  currentUser, 
  appointments, 
  prescriptions, 
  labOrders, 
  invoices,
  eligibilityChecks,
  onEligibilityCheckAdded
}: { 
  currentUser: any, 
  appointments: any[],
  prescriptions?: any[],
  labOrders?: any[],
  invoices?: any[],
  eligibilityChecks?: any[],
  onEligibilityCheckAdded?: (chk: any) => void
}) {
  const [reportType, setReportType] = React.useState('appointments');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  // Eligibility Form state
  const [eligForm, setEligForm] = React.useState({ patientId: '', patientName: '', payer: '', status: 'pending' });
  const [eligFormLoading, setEligFormLoading] = React.useState(false);

  const handleAddEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setEligFormLoading(true);
    try {
      const res = await api.addEligibilityCheck(eligForm);
      if (res.success && onEligibilityCheckAdded) {
        onEligibilityCheckAdded(res.data);
        setEligForm({ patientId: '', patientName: '', payer: '', status: 'pending' });
      }
    } catch { /* */ }
    finally { setEligFormLoading(false); }
  };
  
  // Data states
  const [patientList, setPatientList] = React.useState<any[]>([]);
  const [clinicalSummary, setClinicalSummary] = React.useState<any>(null);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'patients') {
        const res = await api.getPatientReport({ from: fromDate, to: toDate });
        if (res.success) setPatientList(res.data);
      } else if (reportType === 'clinical') {
        const res = await api.getClinicalSummaryReport({ from: fromDate, to: toDate });
        if (res.success) setClinicalSummary(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReportData();
  }, [reportType, fromDate, toDate]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'appointments') {
      const filtered = appointments.filter(a => {
        if (fromDate && new Date(a.scheduledTime) < new Date(fromDate)) return false;
        if (toDate && new Date(a.scheduledTime) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date,Patient,Provider,Status,Notes\n";
      filtered.forEach(a => {
        csvContent += `"${new Date(a.scheduledTime).toLocaleString()}","${a.patientName}","${a.doctorName}","${a.status}","${a.notes || ''}"\n`;
      });
    } else if (reportType === 'encounters') {
      const filtered = appointments.filter(a => a.status === 'completed').filter(a => {
        if (fromDate && new Date(a.scheduledTime) < new Date(fromDate)) return false;
        if (toDate && new Date(a.scheduledTime) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date,Patient,Provider,SOAP Note\n";
      filtered.forEach(a => {
        csvContent += `"${new Date(a.scheduledTime).toLocaleString()}","${a.patientName}","${a.doctorName}","${a.hasClinicalNote ? 'Yes' : 'No'}"\n`;
      });
    } else if (reportType === 'patients') {
      csvContent += "Name,DOB,Gender,Phone,Last Visit\n";
      patientList.forEach(p => {
        const lastV = p.lastVisit ? new Date(p.lastVisit.scheduledTime).toLocaleDateString() : 'Never';
        csvContent += `"${p.name}","${p.dateOfBirth || ''}","${p.gender || ''}","${p.contactPhone || ''}","${lastV}"\n`;
      });
    } else if (reportType === 'clinical') {
      csvContent += "Metric,Count\n";
      if (clinicalSummary) {
        csvContent += `"Total Problems","${clinicalSummary.totalProblems}"\n`;
        csvContent += `"Total Allergies","${clinicalSummary.totalAllergies}"\n`;
        csvContent += `"Total Prescriptions","${clinicalSummary.prescriptions?.total || 0}"\n`;
        csvContent += `"Total Lab Orders","${clinicalSummary.labs?.total || 0}"\n`;
      }
    } else if (reportType === 'amc') {
      csvContent += "Measure,Percentage,Details\n";
      if (clinicalSummary?.amc) {
        const { totalUniquePatients, patientsWithProblems, patientsWithAllergies, totalVisits, visitsWithNotes } = clinicalSummary.amc;
        const probPct = totalUniquePatients ? Math.round((patientsWithProblems / totalUniquePatients) * 100) : 0;
        const allPct = totalUniquePatients ? Math.round((patientsWithAllergies / totalUniquePatients) * 100) : 0;
        const notePct = totalVisits ? Math.round((visitsWithNotes / totalVisits) * 100) : 0;
        csvContent += `"Active Problem List","${probPct}%","${patientsWithProblems} of ${totalUniquePatients} patients"\n`;
        csvContent += `"Allergies Documented","${allPct}%","${patientsWithAllergies} of ${totalUniquePatients} patients"\n`;
        csvContent += `"Visit Notes Completed","${notePct}%","${visitsWithNotes} of ${totalVisits} visits"\n`;
      }
    } else if (reportType === 'eligibility') {
      const filtered = (eligibilityChecks || []).filter(e => {
        if (fromDate && new Date(e.createdAt) < new Date(fromDate)) return false;
        if (toDate && new Date(e.createdAt) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date Checked,Patient,Payer,Status\n";
      filtered.forEach(e => {
        csvContent += `"${new Date(e.createdAt).toLocaleString()}","${e.patientName}","${e.payer}","${e.status}"\n`;
      });
    } else if (reportType === 'prescriptions') {
      const filtered = (prescriptions || []).filter(p => {
        if (fromDate && new Date(p.createdAt) < new Date(fromDate)) return false;
        if (toDate && new Date(p.createdAt) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date,Patient,Medication Details,Status\n";
      filtered.forEach(p => {
        csvContent += `"${new Date(p.createdAt).toLocaleString()}","${p.patientName}","${p.medicationDetails}","${p.status}"\n`;
      });
    } else if (reportType === 'lab_orders') {
      const filtered = (labOrders || []).filter(l => {
        if (fromDate && new Date(l.createdAt) < new Date(fromDate)) return false;
        if (toDate && new Date(l.createdAt) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date,Patient,Test Name,Status,Critical\n";
      filtered.forEach(l => {
        csvContent += `"${new Date(l.createdAt).toLocaleString()}","${l.patientName}","${l.testName}","${l.status}","${l.critical ? 'Yes' : 'No'}"\n`;
      });
    } else if (reportType === 'invoices') {
      const filtered = (invoices || []).filter(i => {
        if (fromDate && new Date(i.createdAt) < new Date(fromDate)) return false;
        if (toDate && new Date(i.createdAt) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Date,Patient,Amount,Status\n";
      filtered.forEach(i => {
        csvContent += `"${new Date(i.createdAt).toLocaleString()}","${i.patientName}","${i.amount}","${i.status}"\n`;
      });
    } else if (reportType === 'superbill') {
      const filtered = appointments.map(apt => {
        const inv = invoices?.find(i => i.appointmentId === apt.id);
        if (!inv) return null;
        return {
          date: apt.scheduledTime,
          patientName: apt.patientName,
          doctorName: apt.doctorName,
          cptCodes: (inv.items || []).filter((i: any) => i.cptCode).map((i: any) => i.cptCode).join('; '),
          icd10Codes: (inv.items || []).filter((i: any) => i.icd10Code).map((i: any) => i.icd10Code).join('; '),
          totalCharges: inv.totalAmount
        };
      }).filter((Boolean as any) as <T>(x: T | null) => x is T).filter(s => {
        if (fromDate && new Date(s.date) < new Date(fromDate)) return false;
        if (toDate && new Date(s.date) > new Date(toDate)) return false;
        return true;
      });
      csvContent += "Encounter Date,Patient,Provider,CPT Codes,ICD-10 Codes,Total Charges\n";
      filtered.forEach(s => {
        csvContent += `"${new Date(s.date).toLocaleString()}","${s.patientName}","${s.doctorName}","${s.cptCodes}","${s.icd10Codes}","${s.totalCharges}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-indigo-600" /> Reporting Module
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 flex items-center gap-1">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handlePrint} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1">
            <FileText className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-48 px-3 py-2 border rounded-md text-sm">
            <option value="appointments">Appointments Report</option>
            <option value="encounters">Encounters Report</option>
            <option value="patients">Patient List</option>
            <option value="clinical">Clinical Summary</option>
            <option value="amc">AMC / Standard Measures</option>
            <option value="eligibility">Eligibility Report</option>
            <option value="superbill">Superbill Report</option>
            <option value="prescriptions">Prescriptions Report</option>
            <option value="lab_orders">Lab Orders Report</option>
            <option value="invoices">Billing & Invoices</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40 px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40 px-3 py-2 border rounded-md text-sm" />
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading report data...</p>}

      {/* Appointments Report */}
      {!loading && reportType === 'appointments' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Date & Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Provider</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.filter(a => {
                if (fromDate && new Date(a.scheduledTime) < new Date(fromDate)) return false;
                if (toDate && new Date(a.scheduledTime) > new Date(toDate)) return false;
                return true;
              }).map((a: any) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(a.scheduledTime).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{a.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{a.doctorName}</td>
                  <td className="px-4 py-3 capitalize">{a.status}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{a.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Encounters Report */}
      {!loading && reportType === 'encounters' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Visit Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Provider</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">SOAP Note?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.filter(a => a.status === 'completed').filter(a => {
                if (fromDate && new Date(a.scheduledTime) < new Date(fromDate)) return false;
                if (toDate && new Date(a.scheduledTime) > new Date(toDate)) return false;
                return true;
              }).map((a: any) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(a.scheduledTime).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{a.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{a.doctorName}</td>
                  <td className="px-4 py-3 text-center">
                    {a.hasClinicalNote ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient List */}
      {!loading && reportType === 'patients' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">DOB</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Gender</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Phone</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {patientList.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.dateOfBirth || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{p.gender || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{p.contactPhone || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.lastVisit ? new Date(p.lastVisit.scheduledTime).toLocaleDateString() : 'No visits'}
                  </td>
                </tr>
              ))}
              {patientList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No patients found for this criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Eligibility Report */}
      {!loading && reportType === 'eligibility' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Log Manual Eligibility Check</h3>
            <form onSubmit={handleAddEligibility} className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Patient Name</label>
                <input required type="text" value={eligForm.patientName} onChange={e => setEligForm({...eligForm, patientName: e.target.value})} className="w-48 px-2 py-1 border rounded text-sm" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Patient ID (optional)</label>
                <input type="text" value={eligForm.patientId} onChange={e => setEligForm({...eligForm, patientId: e.target.value})} className="w-40 px-2 py-1 border rounded text-sm" placeholder="PT-..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Payer (Insurance)</label>
                <input required type="text" value={eligForm.payer} onChange={e => setEligForm({...eligForm, payer: e.target.value})} className="w-48 px-2 py-1 border rounded text-sm" placeholder="e.g. Aetna, Medicare" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select value={eligForm.status} onChange={e => setEligForm({...eligForm, status: e.target.value})} className="w-32 px-2 py-1 border rounded text-sm">
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <button type="submit" disabled={eligFormLoading} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 h-8">
                {eligFormLoading ? 'Saving...' : 'Log Check'}
              </button>
            </form>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date Checked</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Payer</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(eligibilityChecks || []).filter((e: any) => {
                  if (fromDate && new Date(e.createdAt) < new Date(fromDate)) return false;
                  if (toDate && new Date(e.createdAt) > new Date(toDate)) return false;
                  return true;
                }).map((e: any) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{e.patientName}</td>
                    <td className="px-4 py-3 text-slate-500">{e.payer}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${e.status === 'verified' ? 'bg-green-100 text-green-800' : e.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {(eligibilityChecks || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No eligibility checks recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clinical Summary */}
      {!loading && reportType === 'clinical' && clinicalSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-red-50 border-red-100">
            <p className="text-sm font-medium text-red-800">Total Active Problems</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{clinicalSummary.totalProblems}</p>
          </div>
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
            <p className="text-sm font-medium text-amber-800">Total Allergies Logged</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{clinicalSummary.totalAllergies}</p>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
            <p className="text-sm font-medium text-blue-800">Prescriptions</p>
            <div className="mt-1 flex gap-4">
              <div>
                <span className="text-2xl font-bold text-blue-600">{clinicalSummary.prescriptions?.pending || 0}</span>
                <span className="text-xs text-blue-700 ml-1 block">Pending</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-600">{clinicalSummary.prescriptions?.dispensed || 0}</span>
                <span className="text-xs text-blue-700 ml-1 block">Dispensed</span>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100">
            <p className="text-sm font-medium text-emerald-800">Lab Orders</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{clinicalSummary.labs?.total || 0}</p>
            <div className="flex gap-2 mt-2 text-xs text-emerald-700 flex-wrap">
              {(clinicalSummary.labs?.byStatus || []).map((s: any) => (
                <span key={s.status} className="bg-emerald-100 px-1.5 py-0.5 rounded capitalize">{s.status}: {s.count}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AMC / Standard Measures */}
      {!loading && reportType === 'amc' && clinicalSummary?.amc && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Simplified internal metric
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  These percentages are calculated based on raw counts within the system. They are for internal tracking only and do NOT constitute certified CQM (Clinical Quality Measures) reporting for CMS/ONC.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium text-slate-500 mb-2">Active Problem List</div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {clinicalSummary.amc.totalUniquePatients ? Math.round((clinicalSummary.amc.patientsWithProblems / clinicalSummary.amc.totalUniquePatients) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">
                {clinicalSummary.amc.patientsWithProblems} of {clinicalSummary.amc.totalUniquePatients} patients
              </div>
            </div>
            
            <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium text-slate-500 mb-2">Allergies Documented</div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {clinicalSummary.amc.totalUniquePatients ? Math.round((clinicalSummary.amc.patientsWithAllergies / clinicalSummary.amc.totalUniquePatients) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">
                {clinicalSummary.amc.patientsWithAllergies} of {clinicalSummary.amc.totalUniquePatients} patients
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium text-slate-500 mb-2">Visit Notes Completed</div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {clinicalSummary.amc.totalVisits ? Math.round((clinicalSummary.amc.visitsWithNotes / clinicalSummary.amc.totalVisits) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">
                {clinicalSummary.amc.visitsWithNotes} of {clinicalSummary.amc.totalVisits} visits
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Superbill Report */}
      {!loading && reportType === 'superbill' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Encounter Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Provider</th>
                <th className="px-4 py-3 font-semibold text-slate-600">CPT Codes</th>
                <th className="px-4 py-3 font-semibold text-slate-600">ICD-10 Codes</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Total Charges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.map((apt: any) => {
                const inv = invoices?.find((i: any) => i.appointmentId === apt.id);
                if (!inv) return null;
                return {
                  id: apt.id,
                  date: apt.scheduledTime,
                  patientName: apt.patientName,
                  doctorName: apt.doctorName,
                  cptCodes: (inv.items || []).filter((i: any) => i.cptCode).map((i: any) => i.cptCode).join(', '),
                  icd10Codes: (inv.items || []).filter((i: any) => i.icd10Code).map((i: any) => i.icd10Code).join(', '),
                  totalCharges: inv.totalAmount
                };
              }).filter(Boolean).filter((s: any) => {
                if (fromDate && new Date(s.date) < new Date(fromDate)) return false;
                if (toDate && new Date(s.date) > new Date(toDate)) return false;
                return true;
              }).map((s: any) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(s.date).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{s.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{s.doctorName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.cptCodes || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.icd10Codes || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">${Number(s.totalCharges).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescriptions Report */}
      {!loading && reportType === 'prescriptions' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Date Issued</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Medication</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(prescriptions || []).filter((p: any) => {
                if (fromDate && new Date(p.createdAt) < new Date(fromDate)) return false;
                if (toDate && new Date(p.createdAt) > new Date(toDate)) return false;
                return true;
              }).map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{p.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{p.medicationDetails}</td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lab Orders Report */}
      {!loading && reportType === 'lab_orders' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Date Ordered</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Test Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Critical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(labOrders || []).filter((l: any) => {
                if (fromDate && new Date(l.createdAt) < new Date(fromDate)) return false;
                if (toDate && new Date(l.createdAt) > new Date(toDate)) return false;
                return true;
              }).map((l: any) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{l.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{l.testName}</td>
                  <td className="px-4 py-3 capitalize">{l.status}</td>
                  <td className="px-4 py-3 text-center">
                    {l.critical && <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">Yes</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing & Invoices Report */}
      {!loading && reportType === 'invoices' && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-green-50 border-green-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Total Revenue (Paid Invoices)</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                ${(invoices || []).filter((i: any) => {
                  if (i.status !== 'paid') return false;
                  if (fromDate && new Date(i.createdAt) < new Date(fromDate)) return false;
                  if (toDate && new Date(i.createdAt) > new Date(toDate)) return false;
                  return true;
                }).reduce((sum: number, inv: any) => sum + Number(inv.amount), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Pending Receivables (Unpaid)</p>
              <p className="text-xl font-bold text-amber-900 mt-1 text-right">
                ${(invoices || []).filter((i: any) => {
                  if (i.status === 'paid') return false;
                  if (fromDate && new Date(i.createdAt) < new Date(fromDate)) return false;
                  if (toDate && new Date(i.createdAt) > new Date(toDate)) return false;
                  return true;
                }).reduce((sum: number, inv: any) => sum + Number(inv.amount), 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date Generated</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(invoices || []).filter((i: any) => {
                  if (fromDate && new Date(i.createdAt) < new Date(fromDate)) return false;
                  if (toDate && new Date(i.createdAt) > new Date(toDate)) return false;
                  return true;
                }).map((i: any) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(i.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{i.patientName || 'Unknown Patient'}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(i.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${i.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {i.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
