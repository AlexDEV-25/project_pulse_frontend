import { useState } from 'react';
import type { DashboardRole } from './components/Sidebar';
import EmployeeDashboard from './EmployeeDashboard';
import PmDashboard from './PmDashboard';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import ProjectManagement from './ProjectManagement';
import DetailProject from './DetailProject';
export default function DashboardPage({
  role,
  onLogout,
}: {
  role: DashboardRole;
  onLogout: () => void;
}) {
  const [activeMenu, setActiveMenu] = useState('Bảng điều khiển');
  // Keep detail navigation compatible with the label emitted by the project list.
  if ((role === 'ADMIN' || role === 'PM') && activeMenu.startsWith('Chi')) {
    const projectId = Number(activeMenu.match(/(\d+)$/)?.[1]);
    return (
      <DetailProject
        role={role}
        onLogout={onLogout}
        onMenuChange={setActiveMenu}
        projectId={projectId}
      />
    );
  }
  if (activeMenu === 'Quản lý Dự án' && (role === 'ADMIN' || role === 'PM')) {
    return (
      <ProjectManagement
        role={role}
        onLogout={onLogout}
        onMenuChange={setActiveMenu}
      />
    );
  }
  if (role === 'ADMIN' && activeMenu === 'Quản lý nhân sự') {
    return <UserManagement onLogout={onLogout} onMenuChange={setActiveMenu} />;
  }
  if (role === 'ADMIN' && activeMenu === 'Quản lý Phòng ban') {
    return (
      <DepartmentManagement onLogout={onLogout} onMenuChange={setActiveMenu} />
    );
  }
  return role === 'EMPLOYEE' ? (
    <EmployeeDashboard onLogout={onLogout} />
  ) : role === 'PM' ? (
    <PmDashboard
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
    />
  ) : (
    <AdminDashboard
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
    />
  );
}
