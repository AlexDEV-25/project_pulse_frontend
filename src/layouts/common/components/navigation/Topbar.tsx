import { useEffect, useState } from 'react';
import { getMyInfo } from '@/apis/UserApi';
import type { DashboardRole } from './Sidebar';
import NotificationBell from './NotificationBell';

type TopbarProps = {
  role: DashboardRole;
  onMenuChange?: (label: string) => void;
};

export default function Topbar({ role, onMenuChange }: TopbarProps) {
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState('');
  useEffect(() => {
    getMyInfo()
      .then((response) => {
        if (response.result) {
          setUserName(response.result.userName);
          setAvatar(response.result.avatarUrl);
        }
      })
      .catch(() => undefined);
  }, []);

  const roleLabel =
    role === 'ADMIN'
      ? 'Quản trị viên'
      : role === 'PM'
        ? 'Quản lý dự án'
        : 'Nhân viên';

  return (
    <header className="dash-topbar">
      <div className="dash-heading">
        <span className="calendar-icon">▦</span>
        <span>DASHBOARD {role}</span>
      </div>
      <div className="dash-user">
        <NotificationBell onMenuChange={onMenuChange} />
        {avatar ? (
          <img
            className="user-avatar"
            src={avatar}
            alt={userName || 'Người dùng'}
          />
        ) : (
          <span className="user-avatar">
            {userName.slice(0, 2).toUpperCase() || 'U'}
          </span>
        )}
        <span className="user-copy">
          <small>{roleLabel}</small>
          <strong>{userName || 'Người dùng'}</strong>
        </span>
      </div>
    </header>
  );
}
