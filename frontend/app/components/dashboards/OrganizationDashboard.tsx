// @ts-nocheck

import React from 'react';

export function OrganizationDashboard(props: any) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Organization Owner Desk</h1>
              <p className="text-sm text-slate-500 mt-1">Configure department list, set staff access levels, and audit system users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left Column: Organization & Departments */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                    🏥 Departments List
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {orgDetails?.departments?.map((dept: string) => (
                      <span key={dept} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
                        {dept}
                      </span>
                    )) || <span className="text-slate-400">Loading departments...</span>}
                  </div>

                  <form onSubmit={handleAddDepartment} className="flex gap-2 pt-4 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="New department name..."
                      required
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-950 flex-grow"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded px-4 py-2 cursor-pointer"
                    >
                      Add Department
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                    👥 Registered Staff Members
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Staff ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Assigned Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Affiliation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {orgStaff.map((usr) => (
                          <tr key={usr.userId}>
                            <td className="px-4 py-3 text-sm font-mono text-slate-950 font-semibold">{usr.userId}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{ROLE_LABELS[usr.role] || usr.role}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{usr.orgName.toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Access Level Rules & Policies */}
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4 h-fit">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                  🔐 Access Rules Config
                </h2>

                <div className="space-y-4">
                  {orgDetails?.accessRules?.map((rule: any) => (
                    <div key={rule.role} className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800 capitalize">{ROLE_LABELS[rule.role] || rule.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.permissions.map((p: string) => (
                          <span key={p} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleUpdatePermissions} className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Edit Permissions</h3>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Target Role</label>
                    <select
                      value={editingRolePermissions.role}
                      onChange={(e) => setEditingRolePermissions({ ...editingRolePermissions, role: e.target.value })}
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-900"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="lab_technician">Laboratory Technician</option>
                      <option value="pharmacist">Pharmacist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Permissions (comma-separated list)</label>
                    <input
                      type="text"
                      placeholder="e.g. read_ehr, log_vitals, check_in"
                      required
                      value={editingRolePermissions.permissions}
                      onChange={(e) => setEditingRolePermissions({ ...editingRolePermissions, permissions: e.target.value })}
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-950"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded py-2 cursor-pointer"
                  >
                    Save Access Rules
                  </button>
                </form>
              </div>
            </div>
          </div>
        
  );
}