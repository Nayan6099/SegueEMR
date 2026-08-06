// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../context/DashboardContext';
import { PatientLoginForm } from './components/PatientLoginForm';
import { getDashboardRoute } from '../utils/getDashboardRoute';

export default function Home() {
  const router = useRouter();
  const { currentUser, loginForm, setLoginForm, handleLogin, toast } = useDashboard();

  useEffect(() => {
    if (currentUser) {
      router.push(`/dashboard/${getDashboardRoute(currentUser.role)}`);
    }
  }, [currentUser, router]);

  if (currentUser) {
    return null;
  }

  return (
    <PatientLoginForm
      toast={toast}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      handleLogin={handleLogin}
    />
  );
}
