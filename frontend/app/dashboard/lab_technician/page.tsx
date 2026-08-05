'use client';
import { useDashboard } from '../../../context/DashboardContext';
import { LabTechnicianDashboard } from '../../components/dashboards/LabTechnicianDashboard';

export default function LabTechnicianPage() {
  const dashboardProps = useDashboard();
  return <LabTechnicianDashboard {...dashboardProps} />;
}
