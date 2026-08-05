'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { ManagementDashboard } from '../../components/dashboards/ManagementDashboard';

export default function ManagementPage() {
  const dashboardProps = useDashboard();
  return <ManagementDashboard {...dashboardProps} />;
}
