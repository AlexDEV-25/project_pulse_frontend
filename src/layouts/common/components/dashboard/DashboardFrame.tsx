import type { ReactNode } from 'react';
import Sidebar from '@/layouts/common/components/navigation/Sidebar';
import Topbar from '@/layouts/common/components/navigation/Topbar';

type DashboardFrameProps = {
  role: 'EMPLOYEE' | 'PM' | 'ADMIN';
  onLogout: () => void;
  children: ReactNode;
  activeMenu?: string;
  onMenuChange?: (label: string) => void;
};

export default function DashboardFrame({
  role,
  onLogout,
  children,
  activeMenu,
  onMenuChange,
}: DashboardFrameProps) {
  return (
    <div className="dashboard-shell">
      <Sidebar
        role={role}
        onLogout={onLogout}
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
      />
      <div className="dashboard-workspace">
        <Topbar role={role} onMenuChange={onMenuChange} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
