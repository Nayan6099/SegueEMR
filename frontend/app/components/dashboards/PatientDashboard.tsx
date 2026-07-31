// @ts-nocheck

import React from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity } from 'lucide-react';

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

  return (
    <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900">Welcome, {currentUser?.userId}</h1>
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
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
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
                        <div key={msg.id} className={`flex flex-col max-w-xs p-3 rounded-lg ${msg.sender_id === currentUser?.userId ? 'bg-indigo-600 text-white ml-auto' : 'bg-white border border-slate-200 text-slate-800'}`}>
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
  );
}
