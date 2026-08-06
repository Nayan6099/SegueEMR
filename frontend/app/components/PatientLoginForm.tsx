// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LoginShell } from './LoginShell';

export interface PatientLoginFormProps {
  toast: { message: string; isError?: boolean } | null;
  loginForm: { userId: string; email?: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ userId: string; email?: string; password: string }>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
}

/**
 * PatientLoginForm — login form for patients accessing the patient portal.
 *
 * Intentionally differs from StaffLoginForm:
 * - Includes an optional email address field (patients may not know their ID)
 * - No footer regulatory links (patient-facing, not clinical)
 * - Emerald/green accent colour (distinct from blue staff portal)
 */
export function PatientLoginForm({ toast, loginForm, setLoginForm, handleLogin }: PatientLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setLoginForm((prev) => ({ ...prev, role: 'patient' }));
  }, [setLoginForm]);

  const hints = (
    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
      <p className="font-semibold text-slate-800">Demo Accounts:</p>
      <p>• Patient ID: <code className="bg-slate-200 px-1 py-0.5 rounded">patient123</code></p>
    </div>
  );

  return (
    <LoginShell
      toast={toast}
      accentColor="bg-emerald-600"
      hoverColor="hover:bg-emerald-700"
      title="Patient Portal"
      subtitle="Access your medical records and appointments"
      hints={hints}
    >
      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Patient ID */}
          <div>
            <label htmlFor="patient-userId" className="block text-sm font-medium text-slate-700">
              Patient ID / Username
            </label>
            <input
              id="patient-userId"
              type="text"
              required
              placeholder="e.g. patient123"
              value={loginForm.userId}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, userId: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Email (optional — patients may use this instead of their ID) */}
          <div>
            <label htmlFor="patient-email" className="block text-sm font-medium text-slate-700">
              Email Address <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="patient-email"
              type="email"
              placeholder="you@example.com"
              value={loginForm.email || ''}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="patient-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                id="patient-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none sm:text-sm pr-10"
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
            className="flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none"
          >
            Sign In Securely
          </button>
        </div>
      </form>
    </LoginShell>
  );
}
