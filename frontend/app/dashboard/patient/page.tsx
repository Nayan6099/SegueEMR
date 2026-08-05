'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { PatientDashboard } from '../../components/dashboards/PatientDashboard';

export default function PatientPage() {
  const dashboardProps = useDashboard();
  return <PatientDashboard {...dashboardProps} />;
}
