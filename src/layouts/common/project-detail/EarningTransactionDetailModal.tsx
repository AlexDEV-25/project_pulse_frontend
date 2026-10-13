import { useEffect, useState } from 'react';
import { getEarningById } from '@/apis/FinanceApi';
import type { EarningTransactionResponse } from '@/dto/response';

export type EarningTransactionDetailModalProps = {
  projectId: number;
  transaction: EarningTransactionResponse;
  onClose: () => void;
  onOpenTransfer?: () => void;
};

const formatPoints = (value: number) =>
  Number(value ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

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

export function EarningTransactionDetailModal({
  projectId,
  transaction: initialTransaction,
  onClose,
  onOpenTransfer,
}: EarningTransactionDetailModalProps) {
  const [transaction, setTransaction] =
    useState<EarningTransactionResponse>(initialTransaction);

  useEffect(() => {
    let active = true;
    getEarningById(projectId, initialTransaction.id)
      .then((res) => {
        if (active && res.result) {
          setTransaction(res.result);
        }
      })
      .catch(() => {
        // Fallback to initialTransaction if request fails
      });
    return () => {
      active = false;
    };
  }, [projectId, initialTransaction.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isEarn = transaction.earningTransactionType === 'EARN';

  return (
    <div
      className="task-detail-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="earning-detail-modal-title"
    >
      <div
        className="task-detail-modal earning-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-detail-modal-header">
          <h2
            id="earning-detail-modal-title"
            className="task-detail-modal-title"
          >
            <svg
              className="task-detail-title-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span>
              Chi tiết giao dịch #{String(transaction.id).padStart(3, '0')}
            </span>
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

        <div className="task-detail-modal-body earning-detail-modal-body">
          {/* Top Hero Box */}
          <div className="earning-detail-hero">
            <div className="earning-detail-points-box">
              <span className="earning-detail-points-label">
                Giá trị giao dịch
              </span>
              <div className="earning-detail-points-value">
                <span
                  className={`earning-detail-points-amount ${transaction.earningTransactionType.toLowerCase()}`}
                >
                  {isEarn ? '+' : ''}
                  {formatPoints(transaction.points)}
                </span>
                <span className="earning-detail-points-unit">point</span>
              </div>
            </div>

            <div className="earning-detail-type-badge-container">
              <span
                className={`earning-type ${transaction.earningTransactionType.toLowerCase()}`}
              >
                {isEarn ? 'Earn (Thu được)' : 'Transfer (Chuyển)'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="earning-detail-grid">
            {/* Person Card */}
            <div className="earning-detail-card">
              <span className="earning-detail-card-label">
                Nhân viên thụ hưởng
              </span>
              <div className="earning-detail-person">
                <div className="task-detail-avatar">
                  {getInitials(
                    transaction.employeeName,
                    transaction.employeeId
                  )}
                </div>
                <div className="earning-detail-person-info">
                  <strong>
                    {transaction.employeeName || 'Chưa cập nhật'}
                  </strong>
                  <small>ID: {transaction.employeeId}</small>
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="earning-detail-card">
              <span className="earning-detail-card-label">Mã giao dịch</span>
              <div className="earning-detail-card-value">
                <strong>#{String(transaction.id).padStart(3, '0')}</strong>
              </div>
            </div>

            {/* Phase Card */}
            <div className="earning-detail-card">
              <span className="earning-detail-card-label">Giai đoạn</span>
              <div className="earning-detail-card-value">
                {transaction.phaseName ? (
                  <span className="earning-detail-with-icon">
                    <svg
                      width="15"
                      height="15"
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
                    <span>{transaction.phaseName}</span>
                  </span>
                ) : (
                  <span className="earning-detail-empty-text">
                    Không áp dụng
                  </span>
                )}
              </div>
            </div>

            {/* Task Card */}
            <div className="earning-detail-card">
              <span className="earning-detail-card-label">
                Nhiệm vụ liên quan
              </span>
              <div className="earning-detail-card-value">
                {transaction.taskName ? (
                  <span className="earning-detail-with-icon">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    <span>{transaction.taskName}</span>
                  </span>
                ) : (
                  <span className="earning-detail-empty-text">
                    Không gắn nhiệm vụ
                  </span>
                )}
              </div>
            </div>

            {/* Reference Transaction */}
            <div className="earning-detail-card earning-detail-card-full">
              <span className="earning-detail-card-label">
                Giao dịch tham chiếu
              </span>
              <div className="earning-detail-card-value">
                {transaction.referenceTransactionId ? (
                  <span className="earning-detail-ref-badge">
                    #{String(transaction.referenceTransactionId).padStart(3, '0')}{' '}
                    (Giao dịch gốc nguồn)
                  </span>
                ) : (
                  <span className="earning-detail-empty-text">
                    Không có (Giao dịch gốc)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="earning-detail-reason-box">
            <span className="earning-detail-card-label">
              Ghi chú / Lý do giao dịch
            </span>
            <div className="earning-detail-reason-content">
              <span className="task-detail-quote-mark" aria-hidden="true">
                “
              </span>
              <p>
                {transaction.reason?.trim()
                  ? transaction.reason
                  : 'Không có ghi chú thêm cho giao dịch này.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="earning-detail-modal-footer">
          {onOpenTransfer && (
            <button
              type="button"
              className="earning-detail-transfer-btn"
              onClick={onOpenTransfer}
            >
              ⇄ Chuyển point từ giao dịch này
            </button>
          )}
          <button
            type="button"
            className="task-detail-inline-close-btn"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default EarningTransactionDetailModal;
