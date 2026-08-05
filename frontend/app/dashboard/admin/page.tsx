'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { AdminDashboard } from '../../components/dashboards/AdminDashboard';

export default function AdminPage() {
  const dashboardProps = useDashboard();
  return <AdminDashboard {...dashboardProps} />;
}
