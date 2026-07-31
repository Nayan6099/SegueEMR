// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Modals } from './components/Modals';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { NurseDashboard } from './components/dashboards/NurseDashboard';
import { ReceptionistDashboard } from './components/dashboards/ReceptionistDashboard';
import { LabTechnicianDashboard } from './components/dashboards/LabTechnicianDashboard';
import { PharmacistDashboard } from './components/dashboards/PharmacistDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ManagementDashboard } from './components/dashboards/ManagementDashboard';
import { OrganizationDashboard } from './components/dashboards/OrganizationDashboard';

export default function Home() {
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  
  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const state = useAppState(showToast);

  const { currentUser, loginForm, setLoginForm, handleLogin } = state;

  if (!currentUser) {
    return (
      <LoginScreen
        toast={toast}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
      />
    );
  }

  const dashboardProps = { ...state, showToast };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.isError ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <Header {...dashboardProps} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {currentUser?.role === 'patient' && <PatientDashboard {...dashboardProps} />}
        {currentUser?.role === 'doctor' && <DoctorDashboard {...dashboardProps} />}
        {currentUser?.role === 'nurse' && <NurseDashboard {...dashboardProps} />}
        {currentUser?.role === 'receptionist' && <ReceptionistDashboard {...dashboardProps} />}
        {currentUser?.role === 'lab_technician' && <LabTechnicianDashboard {...dashboardProps} />}
        {currentUser?.role === 'pharmacist' && <PharmacistDashboard {...dashboardProps} />}
        {(currentUser?.role === 'admin_staff' || currentUser?.role === 'admin') && <AdminDashboard {...dashboardProps} />}
        {currentUser?.role === 'management' && <ManagementDashboard {...dashboardProps} />}
        {currentUser?.role === 'organization' && <OrganizationDashboard {...dashboardProps} />}
      </main>

      <Modals {...dashboardProps} />

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SegueEMR. Secured Practice Management Ecosystem. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
