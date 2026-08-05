'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { DoctorDashboard } from '../../components/dashboards/DoctorDashboard';

export default function DoctorPage() {
  const dashboardProps = useDashboard();
  return <DoctorDashboard {...dashboardProps} />;
}
