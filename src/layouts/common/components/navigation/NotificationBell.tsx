import { useEffect, useRef, useState } from 'react';
import {
  getAllNotifications,
  readAllNotifications,
  readNotification,
} from '@/apis/NotificationApi';
import type { UserNotificationResponse } from '@/dto/response';
import '@/styles/dashboard/notification-bell.css';

type Props = {
  onMenuChange?: (label: string) => void;
};

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationBell({ onMenuChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationResponse[]>([]);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const [busyMarkAll, setBusyMarkAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getAllNotifications();
      if (response?.resultList) {
        setNotifications(response.resultList);
      }
    } catch {
      // Fail silently in background polling
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications(true);
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      void fetchNotifications(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      void fetchNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (busyMarkAll) return;
    setBusyMarkAll(true);
    try {
      await readAllNotifications();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // ignore
    } finally {
      setBusyMarkAll(false);
    }
  };

  const handleClickItem = async (item: UserNotificationResponse) => {
    // If unread, mark as read
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      try {
        await readNotification(item.id);
      } catch {
        // ignore
      }
    }

    // If notification has a link, navigate to target page and component
    if (item.notificationLink) {
      setIsOpen(false);
      const link = item.notificationLink;
      window.history.pushState({}, '', link);
      window.dispatchEvent(
        new CustomEvent('app:navigate', { detail: { link } })
      );

      const projectMatch = link.match(/\/projects\/(\d+)/);
      if (projectMatch) {
        const projectId = projectMatch[1];
        onMenuChange?.(`Chi tiết dự án ${projectId}`);
      } else if (link.startsWith('/projects')) {
        onMenuChange?.('Quản lý Dự án');
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    tab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        className={`notification-bell-btn${isOpen ? ' active' : ''}`}
        type="button"
        onClick={toggleOpen}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} thông báo chưa đọc`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <header className="notification-header">
            <div className="notification-header-top">
              <div className="notification-title-wrap">
                <h3 className="notification-title">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="notification-unread-pill">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notification-mark-all"
                  onClick={handleMarkAllAsRead}
                  disabled={busyMarkAll}
                >
                  ✓ Đã đọc tất cả
                </button>
              )}
            </div>

            <div className="notification-tabs">
              <button
                type="button"
                className={`notification-tab-btn${tab === 'all' ? ' active' : ''}`}
                onClick={() => setTab('all')}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                type="button"
                className={`notification-tab-btn${tab === 'unread' ? ' active' : ''}`}
                onClick={() => setTab('unread')}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
          </header>

          {loading ? (
            <div className="notification-loading">
              <div className="notification-skeleton" />
              <div className="notification-skeleton" />
              <div className="notification-skeleton" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <svg viewBox="0 0 24 24">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              <p>
                {tab === 'unread'
                  ? 'Tuyệt vời! Bạn không có thông báo chưa đọc nào.'
                  : 'Bạn chưa có thông báo nào.'}
              </p>
            </div>
          ) : (
            <ul className="notification-list">
              {filteredNotifications.map((item) => (
                <li
                  key={item.id}
                  className={`notification-item${!item.read ? ' unread' : ''}`}
                  onClick={() => handleClickItem(item)}
                >
                  <div
                    className={`notification-type-icon ${item.notificationType.toLowerCase()}`}
                  >
                    {item.notificationType === 'SUCCESS' ? (
                      <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : item.notificationType === 'WARNING' ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ) : item.notificationType === 'ERROR' ? (
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    )}
                  </div>

                  <div className="notification-item-content">
                    {item.senderName && (
                      <div className="notification-item-sender">
                        Từ: {item.senderName}
                      </div>
                    )}
                    <p className="notification-item-text">
                      {item.notificationContent}
                    </p>
                    <div className="notification-item-meta">
                      <span className="notification-item-time">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.notificationLink && (
                        <span className="notification-item-link-badge">
                          Chi tiết →
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.read && <span className="notification-unread-dot" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
