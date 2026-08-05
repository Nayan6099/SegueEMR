'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { NurseDashboard } from '../../components/dashboards/NurseDashboard';

export default function NursePage() {
  const dashboardProps = useDashboard();
  return <NurseDashboard {...dashboardProps} />;
}
