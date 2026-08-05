'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { PharmacistDashboard } from '../../components/dashboards/PharmacistDashboard';

export default function PharmacistPage() {
  const dashboardProps = useDashboard();
  return <PharmacistDashboard {...dashboardProps} />;
}
