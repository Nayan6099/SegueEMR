// @ts-nocheck

import React from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity } from 'lucide-react';

export function NurseDashboard(props: any) {
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
                              <>
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Check In Patient',
                                    message: 'Are you sure you want to check in this patient?',
                                    onConfirm: () => handleUpdateAptStatus(apt.id, 'check-in'),
                                    actionLabel: 'Check In',
                                    type: 'primary'
                                  })}
                                  className="bg-blue-600 text-white rounded px-2.5 py-1 text-xs hover:bg-blue-700"
                                >
                                  Check In
                                </button>
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Cancel Appointment',
                                    message: 'Are you sure you want to cancel this appointment?',
                                    onConfirm: () => handleUpdateAptStatus(apt.id, 'cancelled'),
                                    actionLabel: 'Cancel',
                                    type: 'danger'
                                  })}
                                  className="bg-rose-600 text-white rounded px-2.5 py-1 text-xs hover:bg-rose-700 ml-2"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {apt.status === 'check-in' && (
                              <button
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  title: 'Log Vitals',
                                  message: 'Have you recorded the patient vitals?',
                                  onConfirm: () => handleUpdateAptStatus(apt.id, 'completed'),
                                  actionLabel: 'Vitals Logged',
                                  type: 'primary'
                                })}
                                className="bg-emerald-600 text-white rounded px-2.5 py-1 text-xs hover:bg-emerald-700"
                              >
                                Vitals Logged
                              </button>
                            )}
                            {apt.status !== 'scheduled' && (
                              <button
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  title: 'Undo Action',
                                  message: 'Are you sure you want to undo this status change and revert to Scheduled?',
                                  onConfirm: () => handleUpdateAptStatus(apt.id, 'scheduled'),
                                  actionLabel: 'Undo',
                                  type: 'danger'
                                })}
                                className="bg-amber-600 text-white rounded px-2.5 py-1 text-xs hover:bg-amber-700 ml-2"
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
          </div>
  );
}
