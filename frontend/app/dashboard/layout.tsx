'use client';

import React, { useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Header } from '../components/Header';
import { Modals } from '../components/Modals';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const dashboardProps = useDashboard();
  const { currentUser, toast } = dashboardProps;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Basic auth check
    if (!currentUser) {
      router.push('/');
    } else {
      // Role-based route check
      const role = currentUser.role;
      const currentRouteRole = pathname.split('/')[2];
      
      if (currentRouteRole && role) {
          const isAllowed = role === currentRouteRole || (role === 'admin_staff' && currentRouteRole === 'admin');
          if (!isAllowed) {
              const targetRoute = role === 'admin_staff' ? 'admin' : role;
              router.push(`/dashboard/${targetRoute}`);
          }
      }
    }
  }, [currentUser, router, pathname]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.isError ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <Header {...dashboardProps} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {children}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
