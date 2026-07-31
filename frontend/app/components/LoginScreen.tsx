import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface LoginScreenProps {
  toast: { message: string; isError?: boolean } | null;
  loginForm: { userId: string; role: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ userId: string; role: string; password: string }>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
}

export function LoginScreen({ toast, loginForm, setLoginForm, handleLogin }: LoginScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.isError ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}
      <div className="w-full max-w-md space-y-8 bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-2xl">
            🏥
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            SegueEMR
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Professional Practice Management &amp; Health Records
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                User ID / Username
              </label>
              <input
                id="userId"
                type="text"
                required
                placeholder="e.g. patient123 or dr.smith"
                value={loginForm.userId}
                onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                Select Role
              </label>
              <select
                id="role"
                required
                value={loginForm.role}
                onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
              >
                <option value="">-- Choose your role --</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="lab_technician">Laboratory Technician</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin_staff">Administrative Staff</option>
                <option value="management">Healthcare Management</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
            >
              Sign In Securely
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Demo Accounts:</p>
          <p>• Patient ID: <code className="bg-slate-200 px-1 py-0.5 rounded">patient123</code></p>
          <p>• Doctor ID: <code className="bg-slate-200 px-1 py-0.5 rounded">dr.smith</code></p>
          <p>• Other roles: Any ID can be used to simulate staff profiles.</p>
        </div>
      </div>
    </div>
  );
}
