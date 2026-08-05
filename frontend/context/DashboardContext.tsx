'use client';

import React, { createContext, useContext, useState } from 'react';
import { useAppState } from '../hooks/useAppState';

type DashboardContextType = ReturnType<typeof useAppState> & {
  toast: { message: string; isError: boolean } | null;
  showToast: (message: string, isError?: boolean) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  
  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const state = useAppState(showToast);

  const value = {
    ...state,
    toast,
    showToast,
  };

  return (
    <DashboardContext.Provider value={value as any}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
