// @ts-nocheck

import React from 'react';
import api from '../../../services/api';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity, FlaskConical } from 'lucide-react';
import { PatientPicker } from '../PatientPicker';

export function DoctorDashboard(props: any) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Physician Dashboard — Dr. {currentUser?.userId}</h1>
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
                      <label className="block text-xs font-semibold text-slate-600">Assign to Pharmacy</label>
                      <select
                        value={rxForm.assignedPharmacyId}
                        onChange={(e) => setRxForm({ ...rxForm, assignedPharmacyId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                      >
                        <option value="">Any Available Pharmacy (Default)</option>
                        {pharmaciesList.map(pharm => (
                          <option key={pharm.id} value={pharm.id}>{pharm.fullName} (ID: {pharm.id})</option>
                        ))}
                      </select>
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
                      <label className="block text-xs font-semibold text-slate-600">Assign to Laboratory</label>
                      <select
                        value={labForm.assignedLabId}
                        onChange={(e) => setLabForm({ ...labForm, assignedLabId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
                      >
                        <option value="">Any Available Lab (Default)</option>
                        {labsList.map(lab => (
                          <option key={lab.id} value={lab.id}>{lab.fullName} (ID: {lab.id})</option>
                        ))}
                      </select>
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
                            {lab.doctorName && (
                              <p className="text-xs text-slate-400 mt-0.5">Ordered by: {lab.doctorName}{lab.doctorSpecialization ? ` · ${lab.doctorSpecialization}` : ''}</p>
                            )}
                            {lab.notes && <p className="text-xs text-slate-500 mt-1 italic">{lab.notes}</p>}
                          </div>
                          <div className="flex items-center space-x-2">
                             <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : lab.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>{lab.status}</span>
                             {lab.status === 'completed' && (
                               <>
                                 <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700" onClick={async () => { await api.notifyLabOrder(lab.id, 'patient'); showToast('Patient notified', false); }}>Notify Patient</button>
                                 <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => window.open(`/lab/report/print/${lab.id}`, '_blank')}>Print</button>
                               </>
                             )}
                           </div>
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
  );
}
