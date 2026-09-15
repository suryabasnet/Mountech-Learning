import React from 'react';
import { useLMS } from '../../context/LMSContext';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ParentDashboard } from './ParentDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';

export const DashboardView: React.FC = () => {
  const { currentUser } = useLMS();

  switch (currentUser?.role) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'institution_admin':
      return <AdminDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};
