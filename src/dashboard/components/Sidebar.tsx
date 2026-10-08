import { useState } from 'react';

export type DashboardRole = 'EMPLOYEE' | 'PM' | 'ADMIN';

type Props = {
  role: DashboardRole;
  onLogout: () => void;
  activeMenu?: string;
  onMenuChange?: (label: string) => void;
};
const menus: Record<DashboardRole, { label: string; icon: string }[]> = {
  EMPLOYEE: [
    { label: 'Bảng điều khiển', icon: 'grid' },
    { label: 'Dự án tham gia', icon: 'files' },
    { label: 'Cài đặt', icon: 'gear' },
  ],
  PM: [
    { label: 'Bảng điều khiển', icon: 'grid' },
    { label: 'Quản lý Dự án', icon: 'briefcase' },
    { label: 'Bản cáo EVM', icon: 'chart' },
    { label: 'Cài đặt', icon: 'gear' },
  ],
  ADMIN: [
    { label: 'Bảng điều khiển', icon: 'grid' },
    { label: 'Quản lý Dự án', icon: 'briefcase' },
    { label: 'Quản lý nhân sự', icon: 'users' },
    { label: 'Quản lý Phòng ban', icon: 'org' },
    { label: 'Báo cáo EVM', icon: 'chart' },
    { label: 'Cài đặt', icon: 'gear' },
  ],
};

const path: Record<string, string> = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  files: 'M7 3h9l4 4v14H7zM16 3v5h4M4 7v14h3',
  gear: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5 1 3 3 1 3-1 2 3-2 2 1 3-2 2-3-1-3 1-1 3-3 1-3-1-2-3-1-2-3 2-2-1-3 2-2 3 1 3-1 1-3 3-1 3 1 2 3 1',
  briefcase: 'M4 7h16v13H4zM9 7V4h6v3M4 12h16',
  chart: 'M4 19V5M4 19h17M8 15l3-4 3 2 5-7',
  users:
    'M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M18 8a3 3 0 0 1 0 6M18 16a4 4 0 0 1 3 4',
  org: 'M12 3v5M5 21v-5h14v5M12 8H5v4M12 8h7v4M3 12h4M17 12h4',
};

export default function Sidebar({
  role,
  onLogout,
  activeMenu = 'Bảng điều khiển',
  onMenuChange,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`dash-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="dash-brand">
        <span className="dash-brand-mark">⌁</span>
        <span>Project Pulse</span>
      </div>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? 'Mở sidebar' : 'Đóng sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
      <nav>
        {menus[role].map((item) => (
          <button
            className={item.label === activeMenu ? 'active' : ''}
            key={item.label}
            onClick={() => onMenuChange?.(item.label)}
          >
            <svg viewBox="0 0 24 24">
              <path d={path[item.icon]} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="dash-logout" onClick={onLogout}>
        <svg viewBox="0 0 24 24">
          <path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
}
