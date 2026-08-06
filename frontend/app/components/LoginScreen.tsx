import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Globe } from 'lucide-react';
import { AUTH_CONFIG, LoginVariant } from '../../config/authConfig';

export interface LoginScreenProps {
  toast: { message: string; isError?: boolean } | null;
  loginForm: { userId: string; email?: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ userId: string; email?: string; password: string }>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  variant: LoginVariant;
}

export function LoginScreen({ toast, loginForm, setLoginForm, handleLogin, variant }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('en');

  React.useEffect(() => {
    setLoginForm(prev => ({ ...prev, role: variant }));
  }, [variant, setLoginForm]);

  const config = AUTH_CONFIG[variant];

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
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${config.accentColor} text-white font-bold text-2xl`}>
            🏥
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            SegueEMR
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {config.title}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {config.subtitle}
          </p>
          <div className="mt-4 flex justify-center items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border-none bg-transparent text-slate-600 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
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
                onChange={(e) => setLoginForm(prev => ({ ...prev, userId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>

            {variant !== 'staff' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com (optional)"
                  value={loginForm.email || ''}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`flex w-full justify-center rounded-md ${config.accentColor} px-3 py-2.5 text-sm font-medium text-white shadow-sm ${config.hoverColor} focus:outline-none`}
            >
              Sign In Securely
            </button>
            {config.showForgotPassword && (
              <div className="mt-4 text-center">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </a>
              </div>
            )}
          </div>
        </form>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Demo Accounts:</p>
          {config.demoHints.map((hint, i) => {
            const split = hint.split(': ');
            return (
              <p key={i}>
                • {split[0]}: {split[1] ? <code className="bg-slate-200 px-1 py-0.5 rounded">{split[1]}</code> : null}
              </p>
            );
          })}
        </div>

        {config.showFooterLinks && (
          <div className="mt-6 border-t border-slate-200 pt-6 flex justify-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-800">Acknowledgements</a>
            <span>|</span>
            <a href="#" className="hover:text-slate-800">Licensing</a>
            <span>|</span>
            <a href="#" className="hover:text-slate-800">Certification</a>
          </div>
        )}
      </div>
    </div>
  );
}
