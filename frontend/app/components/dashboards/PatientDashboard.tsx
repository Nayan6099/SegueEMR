// @ts-nocheck

import React, { useState, useRef } from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity, Loader2, MessageSquare, Filter } from 'lucide-react';
import api from '../../../services/api';

export function PatientDashboard(props: any) {
  const {
    ROLE_LABELS,
    activeTab,
    allergiesList,
    allergyForm,
    analytics,
    apiKeysList,
    appointmentForm,
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
    showToast,
    soapNote,
    systemSettings,
    toast,
    uploadForm,
    uploadingLabs,
    users,
    vitalsForm,
    vitalsHistory
  } = props;

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [editingDoc, setEditingDoc] = React.useState(null);
  const [showAllDocs, setShowAllDocs] = React.useState(false);
  const [careSummaryOpen, setCareSummaryOpen] = React.useState(false);
  const [customReportOpen, setCustomReportOpen] = React.useState(false);
  const [sigPad, setSigPad] = React.useState(false);
  const canvasRef = React.useRef(null);
  const isDrawing = React.useRef(false);

  const startDraw = (e: any) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigPad(true);
  };
  const stopDraw = () => { isDrawing.current = false; };
  const clearSig = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setSigPad(false);
  };

  return (
    <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Welcome, {currentUser?.userId}</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and access your medical record trail, physician consultations, payments, and integrations.</p>
            </div>

            {/* Navigation Tabs — Developer Integration removed (patient-facing); backend routes preserved */}
            <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Overview &amp; EMRs
              </button>
              <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'documents' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Clinical Documents
              </button>
              <button onClick={() => setActiveTab('consultations')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'consultations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Consultations ({appointments.length})
              </button>
              <button onClick={() => setActiveTab('clinical')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'clinical' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Clinical Health
              </button>
              <button onClick={() => setActiveTab('refills')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'refills' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Medication Refills
              </button>
              <button onClick={() => setActiveTab('messaging')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'messaging' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Secure Messaging
              </button>
              <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Payments &amp; Invoices
              </button>
              <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Medical Reports
              </button>
              <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Profile
              </button>
              <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Settings
              </button>
              <button onClick={() => setActiveTab('help')} className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'help' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Help
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary stats — kept as an improvement over OpenEMR's bare landing page */}
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
                      <p className="text-sm font-medium text-slate-500">Allergies on File</p>
                      <p className="text-2xl font-semibold text-slate-900">{allergiesList.length}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md"><Shield className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Active Conditions</p>
                      <p className="text-2xl font-semibold text-slate-900">{problemsList.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <h2 className="text-base font-semibold text-slate-800 mb-1">Getting Started</h2>
                  <p className="text-sm text-slate-500">Use the tab bar above to navigate between modules: Clinical Documents, Consultations, Clinical Health, Medication Refills, Secure Messaging, Payments, Medical Reports, Profile, Settings, and Help.</p>
                  {appointments.filter(a => new Date(a.scheduledTime) > new Date()).length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
                      📅 You have <strong>{appointments.filter(a => new Date(a.scheduledTime) > new Date()).length}</strong> upcoming appointment(s).{' '}
                      <button onClick={() => setActiveTab('consultations')} className="underline font-semibold hover:text-indigo-600">View Appointments →</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONSULTATIONS TAB */}
            {activeTab === 'consultations' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {appointments.map((apt) => (
                          <tr key={apt.id}>
                            <td className="px-4 py-3 text-sm text-slate-900 font-semibold">Dr. {apt.doctorName || apt.doctorId}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{new Date(apt.scheduledTime).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                  apt.status === 'completed'   ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  apt.status === 'no-show'     ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                  apt.status === 'cancelled'   ? 'bg-slate-100 text-slate-600 border-slate-300' :
                                  apt.status === 'confirmed'   ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                                                 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                      href={`http://localhost:3000/api/patient/ccda/export/${currentUser?.userId}`}
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

                    {/* allowSelfEntry gate: staff must grant self-entry per patient */}
                    {currentUser?.allowSelfEntry && (
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

                    )}
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

                    {currentUser?.allowSelfEntry && (
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

                    )}
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
                      chatMessages.map((msg: any) => {
                        const isMe = (msg.sender_id || msg.senderId) === (currentUser?.patientId || currentUser?.userId);
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
                      })
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

            {/* ── CLINICAL DOCUMENTS TAB ─────────────────────────────────────────────── */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {editingDoc === null ? (
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileText className="h-5 w-5 text-indigo-600" /> Forms &amp; Documents
                      </h2>
                      <div className="flex gap-2 flex-wrap">
                        <select className="border border-slate-300 rounded text-sm px-3 py-1.5 bg-white">
                          <option value="">Select Form (General)</option>
                          <option value="hipaa">HIPAA Document</option>
                          <option value="insurance">Insurance Info</option>
                          <option value="history">Medical History</option>
                          <option value="privacy">Privacy Document</option>
                        </select>
                        <button onClick={() => setEditingDoc({ id: 'new-' + Date.now(), name: 'New Form', status: 'Editing', signed: false, createDate: new Date().toLocaleDateString(), reviewedDate: null, signedDate: null, content: '' })} className="bg-indigo-600 text-white rounded px-3 py-1.5 text-sm font-semibold hover:bg-indigo-700">
                          + Fill New
                        </button>
                        <button className="bg-slate-100 text-slate-700 rounded px-3 py-1.5 text-sm font-semibold hover:bg-slate-200">↑ Upload</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" className="rounded" checked={showAllDocs} onChange={(e) => setShowAllDocs(e.target.checked)} />
                        Show All (including completed/locked)
                      </label>
                      <button className="text-sm text-indigo-600 hover:underline">↻ Reload</button>
                    </div>
                    <div className="overflow-x-auto border rounded-lg border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Document Name</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Create Date</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Reviewed Date</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600 uppercase">Signed</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Signed Date</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {[
                            { id: 'DOC-001', name: 'Privacy Document', createDate: 'Oct 12, 2023', reviewedDate: null, status: 'Pending', signed: false, signedDate: null },
                            { id: 'DOC-002', name: 'HIPAA Consent Form', createDate: 'Sep 5, 2023', reviewedDate: 'Sep 6, 2023', status: 'Locked', signed: true, signedDate: 'Sep 5, 2023' },
                            { id: 'DOC-003', name: 'Medical History', createDate: 'Aug 20, 2023', reviewedDate: null, status: 'Editing', signed: false, signedDate: null },
                          ].filter(doc => showAllDocs || doc.status !== 'Locked').map((doc) => (
                            <tr key={doc.id}>
                              <td className="px-4 py-3 text-xs font-mono text-slate-500">{doc.id}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{doc.name}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{doc.createDate}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{doc.reviewedDate || '—'}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${doc.status === 'Locked' ? 'bg-slate-100 text-slate-600 border-slate-300' : doc.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>{doc.status}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">{doc.signed ? <CheckCircle className="h-4 w-4 text-emerald-500 inline" /> : <span className="text-slate-300 text-xs">No</span>}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{doc.signedDate || '—'}</td>
                              <td className="px-4 py-3 text-right text-sm">{doc.status !== 'Locked' ? <button onClick={() => setEditingDoc(doc)} className="text-indigo-600 font-semibold hover:underline">Edit / Sign</button> : <span className="text-slate-400 text-xs">Locked</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><FilePlus className="h-4 w-4 text-indigo-500" /> Upload a Document</h3>
                      <form onSubmit={handleUploadEHR} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div><label className="block text-xs font-semibold text-slate-600">Patient Name</label><input type="text" required value={uploadForm.patientName} onChange={(e) => setUploadForm({ ...uploadForm, patientName: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm" /></div>
                        <div><label className="block text-xs font-semibold text-slate-600">Record Type</label><select value={uploadForm.recordType} onChange={(e) => setUploadForm({ ...uploadForm, recordType: e.target.value })} className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"><option value="Report">Report</option><option value="Prescription">Prescription</option><option value="X-Ray">X-Ray</option><option value="MRI">MRI</option></select></div>
                        <div><label className="block text-xs font-semibold text-slate-600">File</label><input type="file" required onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700" /></div>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white rounded py-1.5 px-4 text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300">{loading ? 'Uploading...' : 'Store Securely'}</button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button onClick={() => { setEditingDoc(null); clearSig(); }} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">← Back to Documents</button>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingDoc(null); clearSig(); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50">Save Draft</button>
                        <button onClick={() => { setEditingDoc(null); clearSig(); }} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700">Submit for Review</button>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h2 className="text-lg font-semibold text-slate-900">{editingDoc.name}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-800 border-blue-200">{editingDoc.status}</span>
                      </div>
                      <div><label className="block text-xs font-semibold text-slate-600 mb-1">Form Content</label><textarea rows={10} defaultValue={editingDoc.content} placeholder="Fill in the form content here..." className="w-full rounded border border-slate-300 px-3 py-2 text-sm resize-y" /></div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Digital Signature</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-1 bg-slate-50 relative">
                          <canvas ref={canvasRef} width={600} height={160} className="w-full rounded cursor-crosshair touch-none" style={{ maxHeight: '160px' }} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                          {!sigPad && <p className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm pointer-events-none">Sign here ✍️</p>}
                        </div>
                        <div className="flex gap-3 mt-2"><button onClick={clearSig} className="text-xs text-slate-500 hover:text-red-500 hover:underline">Clear Signature</button>{sigPad && <span className="text-xs text-emerald-600 font-semibold">✓ Signature captured</span>}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECURE MESSAGING TAB ──────────────────────────────────────────────── */}
            {activeTab === 'messaging' && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row min-h-[600px]">
                <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
                  <div className="p-4 border-b border-slate-200">
                    <button className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" /> Compose Message</button>
                  </div>
                  <nav className="flex-1 p-2 space-y-1">
                    <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-md"><span>Inbox</span><span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">3</span></a>
                    <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md"><span>Sent</span></a>
                    <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md"><span>Archive</span></a>
                    <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md"><span>All Messages</span></a>
                  </nav>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <select className="text-sm border-slate-300 rounded-md py-1 px-2"><option>Actions...</option><option>Mark as Read</option><option>Move to Archive</option><option>Delete</option></select>
                    </div>
                    <button className="text-slate-500 hover:text-slate-700 p-1"><Activity className="h-5 w-5" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="border-b border-slate-200 p-4 bg-indigo-50/30 hover:bg-slate-50 cursor-pointer flex gap-4">
                      <input type="checkbox" className="mt-1 rounded border-slate-300" />
                      <div className="flex-1"><div className="flex justify-between items-start mb-1"><span className="font-semibold text-slate-900 text-sm">Dr. Smith</span><span className="text-xs text-slate-500">10:42 AM</span></div><p className="font-semibold text-sm text-slate-800">Lab Results Available</p><p className="text-sm text-slate-500 truncate">Your recent blood panel results have been uploaded to your portal.</p></div>
                    </div>
                    <div className="border-b border-slate-200 p-4 bg-indigo-50/30 hover:bg-slate-50 cursor-pointer flex gap-4">
                      <input type="checkbox" className="mt-1 rounded border-slate-300" />
                      <div className="flex-1"><div className="flex justify-between items-start mb-1"><span className="font-semibold text-slate-900 text-sm">Billing Dept</span><span className="text-xs text-slate-500">Yesterday</span></div><p className="font-semibold text-sm text-slate-800">New Statement</p><p className="text-sm text-slate-500 truncate">You have a new statement ready for review.</p></div>
                    </div>
                    <div className="border-b border-slate-200 p-4 hover:bg-slate-50 cursor-pointer flex gap-4">
                      <input type="checkbox" className="mt-1 rounded border-slate-300" />
                      <div className="flex-1"><div className="flex justify-between items-start mb-1"><span className="text-slate-600 text-sm">Nurse Jane</span><span className="text-xs text-slate-500">Oct 12</span></div><p className="text-sm text-slate-700">Follow-up Reminder</p><p className="text-sm text-slate-500 truncate">Please remember to schedule your 6-month checkup.</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MEDICAL REPORTS TAB ───────────────────────────────────────────────── */}
            {activeTab === 'reports' && (
              <PatientReportsView 
                currentUser={currentUser}
                problemsList={problemsList}
                allergiesList={allergiesList}
                prescriptions={prescriptions}
                labOrders={labOrders}
                appointments={appointments}
                records={records}
              />
            )}
            {/* ── PROFILE TAB ───────────────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                  <div><h2 className="text-lg font-semibold text-slate-900">Patient Profile</h2><p className="text-sm text-slate-500">Manage your demographics, contact information, and preferences.</p></div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700">Edit Profile</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Who</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 block">Title</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Name</span><span className="font-medium">{currentUser?.fullName || currentUser?.userId}</span></div>
                      <div><span className="text-slate-500 block">DOB</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">SSN</span><span className="font-medium font-mono">***-**-****</span></div>
                      <div><span className="text-slate-500 block">Birth Sex</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Gender Identity</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Marital Status</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Sexual Orientation</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Pronouns</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">External ID</span><span className="font-medium text-slate-400 text-xs">Not provided</span></div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Contact</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2"><span className="text-slate-500 block">Street Address</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">City</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">State</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Postal Code</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Country</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Mobile Phone</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Home Phone</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Work Phone</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Contact Email</span><span className="font-medium">{currentUser?.email || 'Not provided'}</span></div>
                      <div><span className="text-slate-500 block">Mother's Name</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Emergency Contact</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">Emergency Phone</span><span className="font-medium">Not provided</span></div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Choices &amp; Permissions</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 block">Assigned Provider</span><span className="font-medium">Dr. Smith</span></div>
                      <div><span className="text-slate-500 block">Preferred Pharmacy</span><span className="font-medium">Main St Pharmacy</span></div>
                      <div><span className="text-slate-500 block">Leave Message With</span><span className="font-medium">Not provided</span></div>
                      <div><span className="text-slate-500 block">HIPAA Notice Received</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1 border-t pt-2"><span className="text-slate-700">Allow Voice Message</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow Mail Message</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow SMS Notifications</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow Email Communications</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow Immunization Registry Use</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow Health Information Exchange</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                      <div className="col-span-2 flex justify-between items-center py-1"><span className="text-slate-700">Allow Patient Portal Access</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Yes</span></div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Stats &amp; Misc</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 block">Language</span><span className="font-medium">English</span></div>
                      <div><span className="text-slate-500 block">Status</span><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">Active</span></div>
                      <div className="col-span-2"><span className="text-slate-500 block">Date Deceased</span><span className="font-medium text-slate-400">Not applicable</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ─────────────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
                <p className="text-sm text-slate-500 mb-6">Manage your application preferences and security.</p>
                <div className="space-y-6 max-w-xl">
                  <div className="border-b pb-4"><h3 className="font-medium text-slate-800 mb-2">Theme Appearance</h3><select className="w-full rounded border border-slate-300 p-2 text-sm"><option>Light Mode (Default)</option><option>Dark Mode</option><option>System Default</option></select></div>
                  <div className="border-b pb-4"><h3 className="font-medium text-slate-800 mb-2">Manage Login Credentials</h3><button className="text-sm text-indigo-600 font-semibold hover:underline">Change Password...</button></div>
                  <div><h3 className="font-medium text-slate-800 mb-2">Digital Signature Setup</h3><button className="text-sm text-indigo-600 font-semibold hover:underline">Configure Default Signature...</button></div>
                </div>
              </div>
            )}

            {/* ── HELP TAB ──────────────────────────────────────────────────────────── */}
            {activeTab === 'help' && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-6">
                <div><h2 className="text-lg font-semibold text-slate-900">Dashboard Help</h2><p className="text-sm text-slate-500">Guidance on using the Patient Portal features.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">📄 Clinical Documents</h4><p className="text-xs text-slate-600 mt-1">View, sign, and submit required forms and medical documents.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">📅 Appointments</h4><p className="text-xs text-slate-600 mt-1">Schedule new visits and view your past and future appointments.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">✉️ Secure Messaging</h4><p className="text-xs text-slate-600 mt-1">Communicate securely with your assigned care team and providers.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">❤️ Health Snapshot</h4><p className="text-xs text-slate-600 mt-1">Review your active problems, allergies, immunizations, and medications.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">👤 Profile</h4><p className="text-xs text-slate-600 mt-1">View and update your personal demographics, contact information, and communication preferences.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">💳 Billing Summary</h4><p className="text-xs text-slate-600 mt-1">Review outstanding invoices, make payments, and view your full payment history.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">📋 Medical Reports</h4><p className="text-xs text-slate-600 mt-1">Download your Summary of Care, generate custom history reports, or bulk-export all medical records.</p></div>
                  <div className="p-4 bg-slate-50 rounded border border-slate-200"><h4 className="font-semibold text-slate-800 flex items-center gap-2">⚙️ Settings</h4><p className="text-xs text-slate-600 mt-1">Manage your login credentials, set a default digital signature, and choose your preferred theme.</p></div>
                </div>
              </div>
            )}

          </div>
  );
}

// ─── PATIENT REPORTS SUB-COMPONENT ────────────────────────────────────────────────────
function PatientReportsView({ 
  currentUser, 
  problemsList, 
  allergiesList, 
  prescriptions, 
  labOrders, 
  appointments, 
  records 
}: any) {
  const [reportMode, setReportMode] = React.useState<'summary' | 'custom' | 'bulk'>('summary');
  
  // Custom report states
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [incProblems, setIncProblems] = React.useState(true);
  const [incAllergies, setIncAllergies] = React.useState(true);
  const [incRx, setIncRx] = React.useState(true);
  const [incLabs, setIncLabs] = React.useState(true);
  const [incVisits, setIncVisits] = React.useState(true);
  
  const [isZipping, setIsZipping] = React.useState(false);

  const handleBulkExport = async () => {
    setIsZipping(true);
    try {
      // Assuming api is imported or passed via props, but api is usually imported globally in these components.
      const blob = await api.bulkExportEHR();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Records_${currentUser?.userId || 'Export'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to download ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Filter helper
    const isWithinDate = (dString: string) => {
      const d = new Date(dString);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate && d > new Date(toDate)) return false;
      return true;
    };

    if (incProblems) {
      csvContent += "--- PROBLEMS ---\nDescription,Onset Date\n";
      problemsList.filter((p: any) => isWithinDate(p.onsetDate)).forEach((p: any) => {
        csvContent += `"${p.description}","${new Date(p.onsetDate).toLocaleDateString()}"\n`;
      });
      csvContent += "\n";
    }

    if (incAllergies) {
      csvContent += "--- ALLERGIES ---\nAllergen,Severity,Reaction\n";
      allergiesList.forEach((a: any) => {
        csvContent += `"${a.allergen}","${a.severity}","${a.reaction}"\n`;
      });
      csvContent += "\n";
    }

    if (incRx) {
      csvContent += "--- PRESCRIPTIONS ---\nMedication,Dosage,Status,Date\n";
      prescriptions.filter((p: any) => isWithinDate(p.createdAt)).forEach((p: any) => {
        csvContent += `"${p.medicationDetails}","${p.dosage || ''}","${p.status}","${new Date(p.createdAt).toLocaleDateString()}"\n`;
      });
      csvContent += "\n";
    }

    if (incLabs) {
      csvContent += "--- LAB ORDERS ---\nTest Name,Status,Critical,Date\n";
      labOrders.filter((l: any) => isWithinDate(l.createdAt)).forEach((l: any) => {
        csvContent += `"${l.testName}","${l.status}","${l.critical ? 'Yes' : 'No'}","${new Date(l.createdAt).toLocaleDateString()}"\n`;
      });
      csvContent += "\n";
    }

    if (incVisits) {
      csvContent += "--- VISITS ---\nDate,Provider,Status\n";
      appointments.filter((a: any) => isWithinDate(a.scheduledTime)).forEach((a: any) => {
        csvContent += `"${new Date(a.scheduledTime).toLocaleDateString()}","${a.doctorName}","${a.status}"\n`;
      });
      csvContent += "\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Medical_History_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
        <button onClick={() => setReportMode('summary')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${reportMode === 'summary' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          <FileText className="inline-block w-4 h-4 mr-2" />
          Summary of Care
        </button>
        <button onClick={() => setReportMode('custom')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${reportMode === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          <Filter className="inline-block w-4 h-4 mr-2" />
          Custom Medical History
        </button>
        <button onClick={() => setReportMode('bulk')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${reportMode === 'bulk' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          <Download className="inline-block w-4 h-4 mr-2" />
          Bulk Export Documents
        </button>
      </div>

      {/* 1 & 2: Summary of Care */}
      {reportMode === 'summary' && (
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Summary of Care</h2>
            <button onClick={handlePrint} className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-semibold hover:bg-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Download PDF / Print
            </button>
          </div>
          
          <div className="space-y-6 print:space-y-4 text-sm" id="summary-of-care-print-area">
            {/* Problems */}
            <div>
              <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">Active Problems</h3>
              {problemsList.length > 0 ? (
                <ul className="list-disc pl-5 text-slate-700">
                  {problemsList.map((p: any) => <li key={p.id}>{p.description} (Onset: {new Date(p.onsetDate).toLocaleDateString()})</li>)}
                </ul>
              ) : <p className="text-slate-500 italic">No active problems on file.</p>}
            </div>

            {/* Allergies */}
            <div>
              <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">Allergies</h3>
              {allergiesList.length > 0 ? (
                <ul className="list-disc pl-5 text-slate-700">
                  {allergiesList.map((a: any) => <li key={a.id}>{a.allergen} - {a.severity} (Reaction: {a.reaction})</li>)}
                </ul>
              ) : <p className="text-slate-500 italic">No known allergies.</p>}
            </div>

            {/* Medications */}
            <div>
              <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">Current Medications</h3>
              {prescriptions.filter((p: any) => p.status !== 'cancelled').length > 0 ? (
                <ul className="list-disc pl-5 text-slate-700">
                  {prescriptions.filter((p: any) => p.status !== 'cancelled').map((p: any) => <li key={p.id}>{p.medicationDetails} {p.dosage} - {p.status}</li>)}
                </ul>
              ) : <p className="text-slate-500 italic">No active medications.</p>}
            </div>

            {/* Labs */}
            <div>
              <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">Recent Lab Orders</h3>
              {labOrders.slice(0, 5).length > 0 ? (
                <ul className="list-disc pl-5 text-slate-700">
                  {labOrders.slice(0, 5).map((l: any) => <li key={l.id}>{new Date(l.createdAt).toLocaleDateString()}: {l.testName} - {l.status} {l.critical ? '(CRITICAL)' : ''}</li>)}
                </ul>
              ) : <p className="text-slate-500 italic">No recent labs.</p>}
            </div>

            {/* Visits */}
            <div>
              <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">Recent Visits</h3>
              {appointments.filter((a: any) => a.status === 'completed').slice(0, 5).length > 0 ? (
                <ul className="list-disc pl-5 text-slate-700">
                  {appointments.filter((a: any) => a.status === 'completed').slice(0, 5).map((a: any) => <li key={a.id}>{new Date(a.scheduledTime).toLocaleDateString()} with {a.doctorName}</li>)}
                </ul>
              ) : <p className="text-slate-500 italic">No past visits.</p>}
            </div>
          </div>
        </div>
      )}

      {/* 3: Custom Report */}
      {reportMode === 'custom' && (
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Custom Medical History Report</h2>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-sm font-semibold hover:bg-slate-200 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Print PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-40" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Include Categories</label>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <label className="flex items-center gap-2"><input type="checkbox" checked={incProblems} onChange={e => setIncProblems(e.target.checked)} className="rounded" /> Problems</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={incAllergies} onChange={e => setIncAllergies(e.target.checked)} className="rounded" /> Allergies</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={incRx} onChange={e => setIncRx(e.target.checked)} className="rounded" /> Prescriptions</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={incLabs} onChange={e => setIncLabs(e.target.checked)} className="rounded" /> Lab Orders</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={incVisits} onChange={e => setIncVisits(e.target.checked)} className="rounded" /> Visits</label>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700">
            <p className="italic text-slate-500 mb-4">Click "Print PDF" or "Export CSV" to download the filtered report based on the categories above.</p>
          </div>
        </div>
      )}

      {/* 4: Bulk Export */}
      {reportMode === 'bulk' && (
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Bulk Document Export</h2>
            <button 
              onClick={handleBulkExport} 
              disabled={isZipping || !records || records.length === 0} 
              className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isZipping ? 'Zipping...' : 'Download All as ZIP'}
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            You can download all your available medical records as a single ZIP archive, or download them individually below.
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Document Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Description</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date Added</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.recordType}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{r.description || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No medical documents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
