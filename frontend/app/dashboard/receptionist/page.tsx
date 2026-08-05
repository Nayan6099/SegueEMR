'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { ReceptionistDashboard } from '../../components/dashboards/ReceptionistDashboard';

export default function ReceptionistPage() {
  const dashboardProps = useDashboard();
  return <ReceptionistDashboard {...dashboardProps} />;
}
