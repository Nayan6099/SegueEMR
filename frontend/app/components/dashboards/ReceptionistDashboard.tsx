// @ts-nocheck

import React from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity, DollarSign } from 'lucide-react';
import { PatientPicker } from '../PatientPicker';

export function ReceptionistDashboard(props: any) {
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
                {/* Left Column: Schedule New Appointment Form */}
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-1">
                    <Clock className="h-5 w-5 text-indigo-600" /> Schedule Appointment
                  </h2>
                  <form onSubmit={handleCreateAppointment} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                      <PatientPicker
                        value={appointmentPicker}
                        onChange={setAppointmentPicker}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Doctor ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. dr.smith"
                        value={appointmentForm.doctorId}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={appointmentForm.scheduledTime}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledTime: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Reason for visit, special instructions..."
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                        className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Scheduling...' : 'Schedule Appointment'}
                    </button>
                  </form>
                </div>

                {/* Right Column: Appointments List */}
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm lg:col-span-2">
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
  );
}
