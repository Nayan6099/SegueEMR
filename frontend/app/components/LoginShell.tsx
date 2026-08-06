// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Globe } from 'lucide-react';

export interface LoginShellProps {
  /** Displayed toast notification (success or error) */
  toast: { message: string; isError?: boolean } | null;
  /** Accent color class applied to the icon badge and submit button */
  accentColor: string;
  /** Hover color class for the submit button */
  hoverColor: string;
  /** Title displayed below the logo */
  title: string;
  /** Subtitle displayed below the title */
  subtitle: string;
  /** The form fields, specific to each login variant */
  children: React.ReactNode;
  /** Footer links section (optional) */
  footer?: React.ReactNode;
  /** Demo hints box (optional) */
  hints?: React.ReactNode;
}

/**
 * LoginShell — shared structural wrapper for all login screens.
 * Renders the branded card, toast notification, and language selector.
 * The form fields are injected as children by the specific login form components.
 */
export function LoginShell({
  toast,
  accentColor,
  title,
  subtitle,
  children,
  footer,
  hints,
}: LoginShellProps) {
  const [language, setLanguage] = useState('en');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.isError ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
        {/* Branding */}
        <div className="text-center flex flex-col items-center">
          <img src="/logo.png" alt="SegueEMR Logo" className="h-16 mb-2 object-contain" />
          <p className="mt-2 text-sm text-slate-500 font-medium">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>

          {/* Language selector */}
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

        {/* Form fields — injected by the specific login component */}
        {children}

        {/* Optional demo hints */}
        {hints}

        {/* Optional footer links */}
        {footer}
      </div>
    </div>
  );
}
