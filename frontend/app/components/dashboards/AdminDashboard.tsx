// @ts-nocheck

import React from 'react';
import api from '../../../services/api';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity, Search, Plus, Trash2, DollarSign, PieChart, TrendingUp, Users, Calendar, LogOut, FlaskConical } from 'lucide-react';

export function AdminDashboard(props: any) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Administrative System Oversight</h1>
              <p className="text-sm text-slate-500 mt-1">Configure role permissions, track system status, and manage healthcare users.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded ${(!activeTab || activeTab === 'overview') ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                System Users
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-semibold rounded ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Configuration &amp; Settings
              </button>
            </div>

            {(!activeTab || activeTab === 'overview') && (
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
            )}

            {/* System Configuration & Settings */}
            {activeTab === 'settings' && (
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
                  {[
                    { resource: 'activity-logs', label: 'Activity Logs', icon: '📋' },
                    { resource: 'invoices', label: 'Invoices', icon: '💵' },
                    { resource: 'records', label: 'EHR Records', icon: '📂' },
                  ].map(({ resource, label, icon }) => (
                    <button
                      key={resource}
                      type="button"
                      onClick={async () => {
                        try {
                          await api.exportCSV(resource);
                        } catch (err: any) {
                          showToast(err?.message || `Failed to export ${label}`, true);
                        }
                      }}
                      className="flex flex-col items-center justify-center border border-slate-200 rounded p-4 text-center hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-colors"
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-xs font-semibold text-slate-800 mt-2">{label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Download CSV</span>
                    </button>
                  ))}
                </div>
              </div>
              </div>
            )}
          </div>
  );
}
