import { useEffect, useState } from 'react';
import { getMyInfo } from '@/apis/UserApi';
import type { DashboardRole } from './Sidebar';

export default function Topbar({ role }: { role: DashboardRole }) {
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
  return (
    <header className="dash-topbar">
      <div className="dash-heading">
        <span className="calendar-icon">▦</span>
        <span>DASHBOARD {role}</span>
      </div>
      <div className="dash-user">
        <button className="notification" aria-label="Thông báo">
          <svg viewBox="0 0 24 24">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
        </button>
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
          <small>Quản trị viên</small>
          <strong>{userName || 'Người dùng'}</strong>
        </span>
      </div>
    </header>
  );
}
