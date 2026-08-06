// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../../context/DashboardContext';
import { StaffLoginForm } from '../../components/StaffLoginForm';
import { getDashboardRoute } from '../../../utils/getDashboardRoute';

export default function StaffLogin() {
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
    <StaffLoginForm
      toast={toast}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      handleLogin={handleLogin}
    />
  );
}

