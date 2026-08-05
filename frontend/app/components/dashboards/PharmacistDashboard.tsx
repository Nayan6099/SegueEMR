// @ts-nocheck

import React from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity } from 'lucide-react';

export function PharmacistDashboard(props: any) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Pharmacy Dispensing Station</h1>
              <p className="text-sm text-slate-500 mt-1">Review physician-issued prescriptions and log dispensed status updates.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
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
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ordered By</th>
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
                              <span className="text-slate-800 font-medium">{rx.doctorName || rx.doctorId}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                rx.status === 'dispensed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                rx.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                {rx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm space-x-2">
                              {rx.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => setConfirmDialog({
                                      isOpen: true,
                                      title: 'Dispense Meds',
                                      message: 'Are you sure you want to mark this prescription as dispensed?',
                                      onConfirm: () => handleDispensePrescription(rx.id),
                                      actionLabel: 'Dispense',
                                      type: 'primary'
                                    })}
                                    className="bg-indigo-600 text-white rounded px-2.5 py-1 text-xs hover:bg-indigo-700 cursor-pointer"
                                  >
                                    Dispense Meds
                                  </button>
                                  <button
                                    onClick={() => setConfirmDialog({
                                      isOpen: true,
                                      title: 'Cancel Prescription',
                                      message: 'Are you sure you want to cancel this prescription?',
                                      onConfirm: () => handleCancelPrescription(rx.id),
                                      actionLabel: 'Cancel',
                                      type: 'danger'
                                    })}
                                    className="bg-rose-600 text-white rounded px-2.5 py-1 text-xs hover:bg-rose-700 cursor-pointer ml-2"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {rx.status !== 'pending' && (
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Undo Action',
                                    message: 'Are you sure you want to undo this action and revert the prescription to pending?',
                                    onConfirm: () => handleUndoPrescription(rx.id),
                                    actionLabel: 'Undo',
                                    type: 'danger'
                                  })}
                                  className="bg-amber-600 text-white rounded px-2.5 py-1 text-xs hover:bg-amber-700 cursor-pointer"
                                >
                                  Undo
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
  );
}
