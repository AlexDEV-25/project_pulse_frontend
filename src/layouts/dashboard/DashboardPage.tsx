import { useState } from 'react';
import type { DashboardRole } from '../common/components/navigation/Sidebar';
import EmployeeDashboard from '../employee/dashboard/EmployeeDashboard';
import PmDashboard from '../pm/dashboard/PmDashboard';
import AdminDashboard from '../admin/dashboard/AdminDashboard';
import UserManagement from '../admin/pages/UserManagement';
import DepartmentManagement from '../admin/pages/DepartmentManagement';
import ProjectManagement from '../common/pages/ProjectManagement';
import DetailProject from '../common/pages/DetailProject';
import EmployeeProjects from '../employee/pages/EmployeeProjects';
import EmployeeProjectDetail from '../employee/pages/EmployeeProjectDetail';
import Settings from '../common/pages/Settings';
import EvmReportPage from '../common/pages/EvmReportPage';
export default function DashboardPage({
  role,
  onLogout,
}: {
  role: DashboardRole;
  onLogout: () => void;
}) {
  const [activeMenu, setActiveMenu] = useState('Bảng điều khiển');
  if (activeMenu === 'Cài đặt') {
    return (
      <Settings role={role} onLogout={onLogout} onMenuChange={setActiveMenu} />
    );
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
    return (
      <EmployeeProjects onLogout={onLogout} onMenuChange={setActiveMenu} />
    );
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
  if (activeMenu === 'Báo cáo EVM' && (role === 'ADMIN' || role === 'PM')) {
    return (
      <EvmReportPage
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
