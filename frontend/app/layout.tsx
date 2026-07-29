import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SegueEMR — Electronic Medical Records',
    template: '%s | SegueEMR',
  },
  description:
    'SegueEMR is a secure, enterprise-grade Electronic Medical Records system for modern healthcare providers. Manage patients, appointments, prescriptions, lab orders, and more.',
  keywords: ['EMR', 'EHR', 'Electronic Medical Records', 'Healthcare', 'Patient Management'],
  authors: [{ name: 'SegueEMR Team' }],
  robots: { index: false, follow: false }, // Private healthcare app — don't index
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
