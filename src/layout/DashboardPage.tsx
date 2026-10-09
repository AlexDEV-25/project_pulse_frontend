import { useState } from 'react';
import type { DashboardRole } from './components/Sidebar';
import EmployeeDashboard from './employee/EmployeeDashboard';
import PmDashboard from './pm/PmDashboard';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import DepartmentManagement from './admin/DepartmentManagement';
import ProjectManagement from './common/ProjectManagement';
import DetailProject from './common/DetailProject';
import EmployeeProjects from './employee/EmployeeProjects';
import EmployeeProjectDetail from './employee/EmployeeProjectDetail';
import Settings from './common/Settings';
export default function DashboardPage({
  role,
  onLogout,
}: {
  role: DashboardRole;
  onLogout: () => void;
}) {
  const [activeMenu, setActiveMenu] = useState('Bảng điều khiển');
  if (activeMenu === 'Cài đặt') {
    return <Settings role={role} onLogout={onLogout} onMenuChange={setActiveMenu} />;
  }
  if (role === 'EMPLOYEE' && activeMenu.startsWith('Chi tiết')) {
    const projectId = Number(activeMenu.match(/(\d+)$/)?.[1]);
    return (
      <EmployeeProjectDetail
        projectId={projectId}
        onLogout={onLogout}
        onMenuChange={setActiveMenu}
      />
    );
  }
  if (role === 'EMPLOYEE' && activeMenu === 'Dự án tham gia') {
    return <EmployeeProjects onLogout={onLogout} onMenuChange={setActiveMenu} />;
  }
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
    <EmployeeDashboard
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
    />
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
