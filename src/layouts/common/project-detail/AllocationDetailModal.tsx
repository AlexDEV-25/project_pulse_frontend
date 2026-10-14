import { useEffect } from 'react';
import type { AllocationResponse } from '@/dto/response';

export type AllocationDetailModalProps = {
  allocation: AllocationResponse;
  onClose: () => void;
  onEdit?: () => void;
};

const point = (value: number) =>
  Number(value ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

const formatDate = (value: string) => {
  if (!value) return '';
  const clean = value.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return value;
};

function getInitials(name?: string, id?: number): string {
  if (!name || !name.trim()) return id ? `E${id}` : 'U';
  const clean = name.trim();
  const empMatch = clean.match(/^Employee\s*([0-9]+)$/i);
  if (empMatch) return `E${empMatch[1]}`;

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AllocationDetailModal({
  allocation,
  onClose,
  onEdit,
}: AllocationDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const percentage = Math.max(0, Math.min(100, allocation.allocationPercentage));
  const tone =
    percentage >= 100
      ? 'full'
      : percentage >= 70
        ? 'high'
        : percentage >= 40
          ? 'medium'
          : 'low';

  const overloadedCount = allocation.overloadedDates?.length ?? 0;

  return (
    <div
      className="task-detail-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="allocation-detail-modal-title"
    >
      <div
        className="task-detail-modal allocation-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-detail-modal-header">
          <h2
            id="allocation-detail-modal-title"
            className="task-detail-modal-title"
          >
            <svg
              className="task-detail-title-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Chi tiết phân bổ nhân sự</span>
          </h2>
          <button
            type="button"
            className="task-detail-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="task-detail-modal-body allocation-modal-body">
          {/* Hero Profile Info */}
          <div className="allocation-modal-hero">
            <div className="allocation-modal-user">
              <div className="allocation-avatar allocation-modal-avatar">
                {getInitials(allocation.userName, allocation.userId)}
              </div>
              <div className="allocation-modal-user-info">
                <h3 className="allocation-modal-user-name">
                  {allocation.userName || 'Chưa cập nhật'}
                </h3>
                <div className="allocation-modal-user-sub">
                  <span className="allocation-modal-chip id">
                    ID: {allocation.userId}
                  </span>
                  <span className="allocation-modal-chip phase">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                    </svg>
                    {allocation.phaseName || 'Chưa rõ giai đoạn'}
                  </span>
                </div>
              </div>
            </div>

            <div className="allocation-modal-badge-container">
              {overloadedCount > 0 ? (
                <span className="allocation-status-chip danger">
                  ⚠️ Quá tải {overloadedCount} ngày
                </span>
              ) : (
                <span className="allocation-status-chip success">
                  ✓ Tải hợp lệ
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="allocation-modal-stats-grid">
            <div className="allocation-stat-card">
              <span className="allocation-stat-label">Tỷ lệ phân bổ</span>
              <div className="allocation-stat-val-group">
                <span className={`allocation-stat-value percent ${tone}`}>
                  {percentage}%
                </span>
              </div>
              <div className="allocation-stat-progress">
                <i style={{ width: `${percentage}%` }} />
              </div>
            </div>

            <div className="allocation-stat-card">
              <span className="allocation-stat-label">Point Resource</span>
              <div className="allocation-stat-val-group">
                <span className="allocation-stat-value point">
                  {point(Number(allocation.resourceRateSnapshot))}
                </span>
                <small className="allocation-stat-unit">point/ngày</small>
              </div>
              <span className="allocation-stat-hint">Tỷ giá snapshot phase</span>
            </div>

            <div className="allocation-stat-card">
              <span className="allocation-stat-label">Point phân bổ</span>
              <div className="allocation-stat-val-group">
                <span className="allocation-stat-value total">
                  {point(Number(allocation.allocationPoint))}
                </span>
                <small className="allocation-stat-unit">point</small>
              </div>
              <span className="allocation-stat-hint">
                % × ngày làm việc × rate
              </span>
            </div>

            <div
              className={`allocation-stat-card ${
                overloadedCount > 0 ? 'overloaded' : 'normal'
              }`}
            >
              <span className="allocation-stat-label">Số ngày quá tải</span>
              <div className="allocation-stat-val-group">
                <span
                  className={`allocation-stat-value ${
                    overloadedCount > 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {overloadedCount}
                </span>
                <small className="allocation-stat-unit">ngày</small>
              </div>
              <span className="allocation-stat-hint">
                {overloadedCount > 0 ? 'Tổng phân bổ > 100%' : 'Không quá tải'}
              </span>
            </div>
          </div>

          {/* Overload Section */}
          {overloadedCount > 0 ? (
            <div className="allocation-modal-overload-box">
              <div className="allocation-modal-overload-header">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <strong>
                  Danh sách {overloadedCount} ngày quá tải trong phase
                </strong>
              </div>
              <p className="allocation-modal-overload-text">
                Tổng tỷ lệ phân bổ của nhân sự trên tất cả các giai đoạn vượt quá
                100% vào các ngày làm việc sau:
              </p>
              <div className="allocation-modal-dates-grid">
                {allocation.overloadedDates!.map((date) => (
                  <span key={date} className="allocation-modal-date-pill">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {formatDate(date)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="allocation-modal-safe-box">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Tải làm việc tối ưu</strong>
                <p>
                  Nhân sự không có ngày nào bị quá tải trong giai đoạn này (tổng
                  phân bổ hàng ngày luôn ≤ 100%).
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="allocation-modal-footer">
          {onEdit && (
            <button
              type="button"
              className="allocation-modal-edit-action"
              onClick={onEdit}
            >
              Sửa phân bổ
            </button>
          )}
          <button
            type="button"
            className="allocation-modal-close-action"
            onClick={onClose}
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
