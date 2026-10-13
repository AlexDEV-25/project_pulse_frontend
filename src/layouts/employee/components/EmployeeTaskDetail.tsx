import { useEffect, useState } from 'react';
import {
  getMyAssignedTaskById,
  updateMyTaskStatus,
} from '@/apis/TaskApi';
import { createTaskNote, getTaskNotes } from '@/apis/TaskNoteApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import type { CreateTaskNoteRequest } from '@/dto/request';
import type {
  TaskNoteResponse,
  TaskResponse,
} from '@/dto/response';

export type EmployeeTaskDetailProps = {
  task: TaskResponse;
  onClose: () => void;
  variant?: 'inline' | 'modal';
};

const taskStatusLabels: Record<TaskResponse['taskStatus'], string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  CANCELED: 'Đã hủy',
};

const noteStatusLabels: Record<TaskNoteResponse['taskNoteStatus'], string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
};

function clampProgress(value: number | null | undefined): number {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

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

function formatNoteDate(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('vi-VN');
}

function CircularProgress({ percentage }: { percentage: number }) {
  const size = 38;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const strokeDashoffset = circumference - (validPercent / 100) * circumference;

  return (
    <div
      className="task-detail-circle-gauge"
      style={{ width: size, height: size }}
      aria-label={`${validPercent}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="task-detail-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="task-detail-circle-fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="task-detail-circle-text">{validPercent}%</span>
    </div>
  );
}

export function EmployeeTaskDetail({
  task: initialTask,
  onClose,
  variant = 'inline',
}: EmployeeTaskDetailProps) {
  const [task, setTask] = useState<TaskResponse>(initialTask);
  const [notes, setNotes] = useState<TaskNoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [noteForm, setNoteForm] = useState<
    Omit<CreateTaskNoteRequest, 'taskId'>
  >({
    workingDate: new Date().toISOString().slice(0, 10),
    content: '',
    workingHours: 1,
  });

  const load = () => {
    setLoading(true);
    setLoadingNotes(true);
    setError('');

    getMyAssignedTaskById(initialTask.projectId, initialTask.id)
      .then((taskResponse) => {
        if (taskResponse.result) setTask(taskResponse.result);
      })
      .catch((requestError: unknown) => {
        setError(
          getApiErrorMessage(requestError, 'Không thể tải chi tiết nhiệm vụ.')
        );
      })
      .finally(() => setLoading(false));

    getTaskNotes(initialTask.id)
      .then((notesResponse) => {
        setNotes(notesResponse.resultList ?? []);
      })
      .catch((requestError: unknown) => {
        setError(
          getApiErrorMessage(requestError, 'Không thể tải danh sách task note.')
        );
      })
      .finally(() => setLoadingNotes(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTask.id, initialTask.projectId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const saveNote = () => {
    if (
      !noteForm.content.trim() ||
      !noteForm.workingDate ||
      noteForm.workingHours <= 0
    ) {
      setError('Vui lòng nhập ngày làm việc, nội dung và số giờ hợp lệ.');
      return;
    }
    setSavingNote(true);
    setError('');
    const workingDate =
      noteForm.workingDate.length === 10
        ? `${noteForm.workingDate}T00:00:00`
        : noteForm.workingDate;

    createTaskNote(task.id, {
      ...noteForm,
      workingDate,
      content: noteForm.content.trim(),
    })
      .then((response) => {
        if (response.result) {
          setNotes((current) => [...current, response.result!]);
        }
        setNoteForm((current) => ({
          ...current,
          content: '',
          workingHours: 1,
        }));
      })
      .catch((requestError: unknown) => {
        setError(
          getApiErrorMessage(
            requestError,
            'Không thể tạo task note. Task chỉ cho phép tạo note khi đang thực hiện.'
          )
        );
      })
      .finally(() => setSavingNote(false));
  };

  const startTask = () => {
    if (task.taskStatus !== 'TODO') return;

    setUpdatingStatus(true);
    setError('');
    updateMyTaskStatus(task.id, 'IN_PROGRESS')
      .then((response) => {
        if (response.result) setTask(response.result);
      })
      .catch((requestError: unknown) => {
        setError(
          getApiErrorMessage(
            requestError,
            'Không thể cập nhật trạng thái nhiệm vụ. Vui lòng thử lại.'
          )
        );
      })
      .finally(() => setUpdatingStatus(false));
  };

  const progress = clampProgress(task.progress);

  const renderBody = () => (
    <>
      {error && <div className="task-detail-inline-error">{error}</div>}

      {/* Top Summary Box */}
      <div className="task-detail-summary-box">
        <div className="task-detail-summary-top">
          {/* Status Badge */}
          <div className="task-detail-chip">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>
              Trạng thái: {taskStatusLabels[task.taskStatus] || task.taskStatus}
            </span>
          </div>

          {/* Point Badge */}
          <div className="task-detail-chip">
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
              <path d="M6 9a6 6 0 1 0 12 0c0-1.5-.5-3-1.5-4L15 3H9L7.5 5C6.5 6 6 7.5 6 9Z" />
              <circle cx="12" cy="14" r="1.5" />
              <path d="M9 5h6" />
            </svg>
            <span>Điểm: {task.taskPoint ?? 0}</span>
          </div>

          {/* Phase Badge */}
          {task.phaseName && (
            <div className="task-detail-chip">
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
              <span>Giai đoạn: {task.phaseName}</span>
            </div>
          )}

          {/* Dates Badge */}
          {(task.startAt || task.endAt) && (
            <div className="task-detail-chip">
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                {formatDate(task.startAt)} – {formatDate(task.endAt)}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="task-detail-summary-progress">
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
            <span>
              Tiến độ: <b>{progress}%</b>
            </span>
            <div className="task-detail-progress-bar-track">
              <div
                className="task-detail-progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description Row */}
        <p className="task-detail-summary-desc">
          <span>
            Mô tả: {task.description || 'Chưa có mô tả cho công việc này.'}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </p>
      </div>

      {/* Section: Thành viên tham gia */}
      <section className="task-detail-section">
        <h3 className="task-detail-section-title">
          <svg
            width="18"
            height="18"
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
          <span>Thành viên tham gia</span>
        </h3>

        {task.assignments.length === 0 ? (
          <p className="task-detail-empty-hint">Chưa có thành viên tham gia.</p>
        ) : (
          <div className="task-detail-members-grid">
            {task.assignments.map((assignment) => (
              <div key={assignment.id} className="task-detail-member-card">
                <div className="task-detail-member-left">
                  <div className="task-detail-avatar">
                    {getInitials(assignment.employeeName, assignment.employeeId)}
                  </div>
                  <div className="task-detail-member-info">
                    <strong>{assignment.employeeName}</strong>
                    <small>ID: {assignment.employeeId}</small>
                  </div>
                </div>
                <div className="task-detail-member-right">
                  <span className="task-detail-contribution-label">
                    Contribution
                  </span>
                  <CircularProgress
                    percentage={assignment.contributionPercentage}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Nhật ký công việc */}
      <section className="task-detail-section">
        <div className="task-detail-section-header">
          <h3 className="task-detail-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Nhật ký công việc ({notes.length})</span>
          </h3>
          <button
            type="button"
            className="employee-task-reload-notes-btn"
            onClick={load}
            title="Tải lại nhật ký công việc"
          >
            ↻ Tải lại
          </button>
        </div>

        {/* Task Note Form for Employee */}
        <div className="employee-task-note-card">
          <div className="employee-task-note-form-title">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Thêm nhật ký công việc</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveNote();
            }}
          >
            <div className="employee-task-note-inputs">
              <div className="employee-task-note-field">
                <label>Ngày làm việc</label>
                <input
                  type="date"
                  value={noteForm.workingDate ?? ''}
                  onChange={(event) =>
                    setNoteForm({
                      ...noteForm,
                      workingDate: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="employee-task-note-field">
                <label>Số giờ</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={noteForm.workingHours}
                  onChange={(event) =>
                    setNoteForm({
                      ...noteForm,
                      workingHours: Number(event.target.value),
                    })
                  }
                  placeholder="Số giờ"
                  required
                />
              </div>
              <div className="employee-task-note-field employee-task-note-field-full">
                <label>Nội dung công việc</label>
                <textarea
                  value={noteForm.content}
                  onChange={(event) =>
                    setNoteForm({ ...noteForm, content: event.target.value })
                  }
                  placeholder="Nội dung công việc đã thực hiện..."
                  rows={2}
                  required
                />
              </div>
            </div>
            <div className="employee-task-note-actions">
              <button
                type="submit"
                className="employee-task-note-submit-btn"
                disabled={savingNote}
              >
                {savingNote ? 'Đang lưu...' : '+ Tạo task note'}
              </button>
            </div>
            {task.taskStatus !== 'IN_PROGRESS' && (
              <small className="employee-task-note-hint">
                * Ghi chú: Task chỉ cho phép tạo note khi đang thực hiện (IN_PROGRESS).
              </small>
            )}
          </form>
        </div>

        {loadingNotes ? (
          <div className="task-detail-empty-hint">Đang tải nhật ký...</div>
        ) : notes.length === 0 ? (
          <div className="task-detail-empty-hint">Chưa có nhật ký công việc nào.</div>
        ) : (
          <div className="task-detail-timeline-container">
            <div className="task-detail-timeline-track" />
            {notes.map((note, index) => {
              const isConcentric = index === 0;
              return (
                <div key={note.id} className="task-detail-timeline-item">
                  <div
                    className={`task-detail-timeline-node ${
                      isConcentric ? 'concentric' : 'solid'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="task-detail-timeline-content">
                    <div className="task-detail-timeline-header">
                      <div className="task-detail-timeline-user">
                        <div className="task-detail-avatar task-detail-timeline-avatar">
                          {getInitials(note.employeeName, note.employeeId)}
                        </div>
                        <div className="task-detail-timeline-meta">
                          <strong>{note.employeeName}</strong>
                          <small>
                            {formatNoteDate(note.workingDate)} • {note.workingHours} giờ
                          </small>
                        </div>
                      </div>
                      <div className="task-detail-timeline-status">
                        <span
                          className={`task-detail-timeline-badge ${
                            note.taskNoteStatus === 'CONFIRMED'
                              ? 'confirmed'
                              : 'pending'
                          }`}
                        >
                          {noteStatusLabels[note.taskNoteStatus] ||
                            note.taskNoteStatus}
                        </span>
                      </div>
                    </div>
                    {note.content?.trim() && (
                      <div className="task-detail-timeline-quote">
                        <span
                          className="task-detail-quote-mark"
                          aria-hidden="true"
                        >
                          “
                        </span>
                        <p>{note.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );

  if (variant === 'inline') {
    return (
      <div className="task-detail-inline-wrapper">
        <header className="task-detail-inline-header">
          <div className="task-detail-inline-title-group">
            <h2
              id="employee-task-detail-title"
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
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
              <span>Chi tiết công việc: {task.taskName}</span>
            </h2>
          </div>
          <div className="employee-task-header-actions">
            {task.taskStatus === 'TODO' && (
              <button
                className="employee-task-start-btn"
                type="button"
                onClick={startTask}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Đang cập nhật...' : '✓ Xác nhận nhận task'}
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
        </header>

        <div className="task-detail-inline-body">
          {loading ? (
            <div className="task-detail-empty-hint">Đang tải chi tiết...</div>
          ) : (
            renderBody()
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="task-detail-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-task-detail-modal-title"
    >
      <div
        className="task-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-detail-modal-header">
          <h2
            id="employee-task-detail-modal-title"
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
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 12h6" />
              <path d="M9 16h6" />
            </svg>
            <span>Chi tiết công việc: {task.taskName}</span>
          </h2>
          <div className="employee-task-header-actions">
            {task.taskStatus === 'TODO' && (
              <button
                className="employee-task-start-btn"
                type="button"
                onClick={startTask}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Đang cập nhật...' : '✓ Xác nhận nhận task'}
              </button>
            )}
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
          </div>
        </header>

        <div className="task-detail-modal-body">
          {loading ? (
            <div className="task-detail-empty-hint">Đang tải chi tiết...</div>
          ) : (
            renderBody()
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeTaskDetail;
