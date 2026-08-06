// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LoginShell } from './LoginShell';

export interface StaffLoginFormProps {
  toast: { message: string; isError?: boolean } | null;
  loginForm: { userId: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ userId: string; password: string }>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
}

/**
 * StaffLoginForm — login form for clinical staff (doctors, nurses, admins, etc.).
 *
 * Intentionally differs from PatientLoginForm:
 * - No email address field (staff always log in by username/ID)
 * - Shows "Forgot Password?" link
 * - Shows footer certification/licensing links (regulatory requirement)
 * - Blue accent colour (distinguishes staff portal from patient portal)
 */
export function StaffLoginForm({ toast, loginForm, setLoginForm, handleLogin }: StaffLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setLoginForm((prev) => ({ ...prev, role: 'staff' }));
  }, [setLoginForm]);

  const hints = (
    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
      <p className="font-semibold text-slate-800">Demo Accounts:</p>
      <p>• Doctor ID: <code className="bg-slate-200 px-1 py-0.5 rounded">dr.smith</code></p>
      <p>• Other roles: Use any valid staff ID.</p>
    </div>
  );

  const footer = (
    <div className="mt-6 border-t border-slate-200 pt-6 flex justify-center gap-4 text-xs text-slate-500">
      <a href="#" className="hover:text-slate-800">Acknowledgements</a>
      <span>|</span>
      <a href="#" className="hover:text-slate-800">Licensing</a>
      <span>|</span>
      <a href="#" className="hover:text-slate-800">Certification</a>
    </div>
  );

  return (
    <LoginShell
      toast={toast}
      accentColor="bg-blue-600"
      hoverColor="hover:bg-blue-700"
      title="Staff Login"
      subtitle="The most popular open-source Electronic Health Record and Medical Practice Management solution."
      hints={hints}
      footer={footer}
    >
      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Username / Staff ID */}
          <div>
            <label htmlFor="staff-userId" className="block text-sm font-medium text-slate-700">
              Staff ID / Username
            </label>
            <input
              id="staff-userId"
              type="text"
              required
              placeholder="e.g. dr.smith"
              value={loginForm.userId}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, userId: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="staff-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                id="staff-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            Sign In Securely
          </button>
          <div className="mt-4 text-center">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
          </div>
        </div>
      </form>
    </LoginShell>
  );
}
