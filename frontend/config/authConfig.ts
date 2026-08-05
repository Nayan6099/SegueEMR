export type LoginVariant = 'patient' | 'staff';

export interface AuthConfig {
  title: string;
  subtitle: string;
  accentColor: string;
  hoverColor: string;
  showForgotPassword: boolean;
  showFooterLinks: boolean;
  demoHints: string[];
}

export const AUTH_CONFIG: Record<LoginVariant, AuthConfig> = {
  patient: {
    title: 'Patient Portal',
    subtitle: 'Access your medical records and appointments',
    accentColor: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    showForgotPassword: false,
    showFooterLinks: false,
    demoHints: ['Patient ID: patient123']
  },
  staff: {
    title: 'Staff Login',
    subtitle: 'The most popular open-source Electronic Health Record and Medical Practice Management solution.',
    accentColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    showForgotPassword: true,
    showFooterLinks: true,
    demoHints: [
      'Doctor ID: dr.smith',
      'Other roles: Use any valid staff ID.'
    ]
  }
};
