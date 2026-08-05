'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { OrganizationDashboard } from '../../components/dashboards/OrganizationDashboard';

export default function OrganizationPage() {
  const dashboardProps = useDashboard();
  return <OrganizationDashboard {...dashboardProps} />;
}
