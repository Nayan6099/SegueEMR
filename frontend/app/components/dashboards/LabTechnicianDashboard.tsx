// @ts-nocheck

import React from 'react';
import api from '../../../services/api';
import { FileText, AlertCircle, Shield, FilePlus, Download, Pill, Lock, Unlock, Clock, User as UserIcon, CheckCircle, Activity } from 'lucide-react';

export function LabTechnicianDashboard(props: any) {
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
    fetchData,
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
              <h1 className="text-2xl font-semibold text-slate-900">Laboratory Station</h1>
              <p className="text-sm text-slate-500 mt-1">Process physician lab test orders, update test statuses, and attach diagnostic documents.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Laboratory Orders Queue</h2>
              {labOrders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No laboratory orders in the queue.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Test Ordered</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ordered By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {labOrders.map((lab) => (
                        <tr key={lab.id}>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">{lab.patientName || lab.patientId}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{lab.testName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="text-slate-800 font-medium">{lab.doctorName || lab.doctorId}</span>
                            {lab.doctorSpecialization && <span className="block text-xs text-slate-400">{lab.doctorSpecialization}</span>}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              lab.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                              {lab.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm space-y-2">
                            <div className="flex justify-end space-x-2">
                              {lab.status === 'ordered' && (
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Begin Process',
                                    message: 'Are you sure you want to begin processing this lab order?',
                                    onConfirm: () => handleUpdateLabStatus(lab.id, 'processing'),
                                    actionLabel: 'Begin'
                                  })}
                                  className="bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700"
                                >
                                  Begin Process
                                </button>
                              )}
                              {lab.status === 'pending' && (
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Start Processing',
                                    message: 'Are you sure you want to start processing this pending order?',
                                    onConfirm: () => handleUpdateLabStatus(lab.id, 'processing'),
                                    actionLabel: 'Start'
                                  })}
                                  className="bg-indigo-600 text-white rounded px-2 py-1 text-xs hover:bg-indigo-700"
                                >
                                  Start Processing
                                </button>
                              )}
                              {lab.status === 'processing' && (
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Mark Completed',
                                    message: 'Are you sure this lab order is fully processed and ready to be marked as completed?',
                                    onConfirm: () => handleUpdateLabStatus(lab.id, 'completed'),
                                    actionLabel: 'Mark Completed',
                                    type: 'primary'
                                  })}
                                  className="bg-emerald-600 text-white rounded px-2 py-1 text-xs hover:bg-emerald-700"
                                >
                                  Mark Completed
                                </button>
                              )}
                              {lab.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => setConfirmDialog({
                                      isOpen: true,
                                      title: 'Undo Complete',
                                      message: 'Are you sure you want to undo? This will permanently delete the uploaded PDF report and revoke access.',
                                      onConfirm: async () => {
                                        try {
                                          await api.undoLabOrderComplete(lab.id);
                                          showToast('Status reverted to processing');
                                          await fetchData();
                                        } catch (err: any) {
                                          const msg = err?.response?.data?.error || err?.message || 'Failed to revert status';
                                          showToast(msg, true);
                                        }
                                      },
                                      actionLabel: 'Undo Complete',
                                      type: 'danger'
                                    })}
                                    className="bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-1 text-xs hover:bg-amber-100 font-medium"
                                  >
                                    Undo Complete
                                  </button>
                                  {!lab.pdfBlobUrl ? (
                                    <div className="relative inline-block">
                                      <input 
                                        type="file"
                                        accept="application/pdf"
                                        disabled={uploadingLabs[lab.id]}
                                        className={`absolute inset-0 w-full h-full opacity-0 ${uploadingLabs[lab.id] ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        title="Upload PDF Report"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 10 * 1024 * 1024) {
                                              showToast('File size must be less than 10MB', false);
                                              return;
                                            }
                                            setUploadingLabs(prev => ({ ...prev, [lab.id]: true }));
                                            try {
                                              await api.uploadLabPdfReport(lab.id, file);
                                              showToast('PDF uploaded successfully');
                                              await fetchData();
                                              setSendReportModal({ isOpen: true, labId: lab.id });
                                            } catch (err) {
                                              showToast('Failed to upload PDF', false);
                                            } finally {
                                              setUploadingLabs(prev => ({ ...prev, [lab.id]: false }));
                                            }
                                          }
                                        }}
                                      />
                                      <button className={`bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-1 text-xs font-medium pointer-events-none flex items-center gap-1 ${uploadingLabs[lab.id] ? 'opacity-75' : 'hover:bg-indigo-100'}`}>
                                        {uploadingLabs[lab.id] ? (
                                          <>
                                            <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                          </>
                                        ) : (
                                          'Upload PDF'
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <select 
                                      onChange={(e) => {
                                        const val = e.target.value as 'doctor' | 'patient' | 'both';
                                        if (!val) return;
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Send Report',
                                          message: `Are you sure you want to send this report to the ${val}? They will receive a notification immediately.`,
                                          onConfirm: async () => {
                                            try {
                                              await api.sendLabReport(lab.id, val);
                                              showToast('Notification sent successfully');
                                              await fetchData();
                                            } catch (err) {
                                              showToast('Failed to send notification or duplicate', true);
                                            }
                                          },
                                          actionLabel: 'Send'
                                        });
                                        e.target.value = ''; // reset dropdown immediately
                                      }}
                                      className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="">Send...</option>
                                      <option value="doctor">Send to Doctor</option>
                                      <option value="patient">Send to Patient</option>
                                      <option value="both">Send to Both</option>
                                    </select>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {/* Delivery Timestamps */}
                            {lab.status === 'completed' && (lab.doctorNotifiedAt || lab.patientNotifiedAt) && (
                              <div className="flex flex-col items-end text-[10px] text-slate-400 mt-1">
                                {lab.doctorNotifiedAt && (
                                  <span>✓ Sent to Doctor at {new Date(lab.doctorNotifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                                {lab.patientNotifiedAt && (
                                  <span>✓ Sent to Patient at {new Date(lab.patientNotifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
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
