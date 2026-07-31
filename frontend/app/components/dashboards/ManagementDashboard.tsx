// @ts-nocheck

import React from 'react';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity, Search, Plus, Trash2, DollarSign, PieChart, TrendingUp, Users, Calendar, LogOut, FlaskConical } from 'lucide-react';

export function ManagementDashboard(props: any) {
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
  );
}
