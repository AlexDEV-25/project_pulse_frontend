import { useEffect, useState } from 'react';
import { confirmTaskNote, getTaskNotes } from '../../../apis/TaskNoteApi';
import { getPhasesByProject } from '../../../apis/PhaseApi';
import { getProjectMembers } from '../../../apis/ProjectMemberApi';
import { getApiErrorMessage } from '../../../apis/HttpClient';
import {
  createTask,
  deleteTask,
  getTaskDetailForPm,
  getTasksByProject,
  updateTask,
} from '../../../apis/TaskApi';
import type {
  CreateTaskRequest,
  TaskAssignmentRequest,
  UpdateTaskRequest,
} from '../../../dto/request';
import type {
  PhaseResponse,
  ProjectMemberResponse,
  TaskNoteResponse,
  TaskResponse,
} from '../../../dto/response';

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
const clampProgress = (value: number | null | undefined) =>
  Math.max(0, Math.min(100, Number(value) || 0));
const date = (value: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('vi-VN');
};
const dateTimeInput = (value: string) => (value ? value.slice(0, 16) : '');
const requestDateTime = (value: string) =>
  value.length === 10 ? `${value}T00:00:00` : value;

type FormState = {
  phaseId: string;
  taskName: string;
  description: string;
  startAt: string;
  endAt: string;
  taskPoint: string;
  taskStatus: TaskResponse['taskStatus'];
  assignments: TaskAssignmentRequest[];
};
type Props = { projectId: number; canManage?: boolean };
const blankForm = (): FormState => ({
  phaseId: '',
  taskName: '',
  description: '',
  startAt: '',
  endAt: '',
  taskPoint: '',
  taskStatus: 'TODO',
  assignments: [],
});

export function TaskComponent({ projectId, canManage = false }: Props) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskResponse | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [notes, setNotes] = useState<TaskNoteResponse[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [updatingAssignmentId] = useState<number | null>(null);
  const changeContribution = () =>
    setError('Hãy chỉnh contribution trong biểu mẫu sửa task.');

  const load = (nextKeyword = keyword, nextPhaseId = phaseId) => {
    setLoading(true);
    setError('');
    void getTasksByProject(
      projectId,
      nextKeyword,
      nextPhaseId ? Number(nextPhaseId) : undefined
    )
      .then((response) => setTasks(response.resultList ?? []))
      .catch((requestError: unknown) =>
        setError(
          getApiErrorMessage(requestError, 'Không thể tải danh sách nhiệm vụ.')
        )
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getTasksByProject(projectId),
      getPhasesByProject(projectId),
      getProjectMembers(projectId),
    ])
      .then(([taskResult, phaseResult, memberResult]) => {
        if (!active) return;
        if (taskResult.status === 'fulfilled')
          setTasks(taskResult.value.resultList ?? []);
        if (phaseResult.status === 'fulfilled')
          setPhases(phaseResult.value.resultList ?? []);
        if (memberResult.status === 'fulfilled')
          setMembers(memberResult.value.resultList ?? []);
        if (taskResult.status === 'rejected')
          setError(
            getApiErrorMessage(
              taskResult.reason,
              'Không thể tải danh sách nhiệm vụ.'
            )
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm());
    setFormOpen(true);
    setSelectedTask(null);
    setError('');
  };
  const openEdit = (task: TaskResponse) => {
    setEditing(task);
    setForm({
      phaseId: String(task.phaseId),
      taskName: task.taskName,
      description: task.description ?? '',
      startAt: dateTimeInput(task.startAt),
      endAt: dateTimeInput(task.endAt),
      taskPoint: String(task.taskPoint),
      taskStatus: task.taskStatus,
      assignments: task.assignments.map((assignment) => ({
        employeeId: assignment.employeeId,
        contributionPercentage: assignment.contributionPercentage,
      })),
    });
    setFormOpen(true);
    setSelectedTask(null);
    setError('');
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };
  const toggleAssignment = (employeeId: number) =>
    setForm((current) =>
      current.assignments.some((item) => item.employeeId === employeeId)
        ? {
            ...current,
            assignments: current.assignments.filter(
              (item) => item.employeeId !== employeeId
            ),
          }
        : {
            ...current,
            assignments: [
              ...current.assignments,
              { employeeId, contributionPercentage: 0 },
            ],
          }
    );
  const setContribution = (employeeId: number, value: string) =>
    setForm((current) => ({
      ...current,
      assignments: current.assignments.map((item) =>
        item.employeeId === employeeId
          ? { ...item, contributionPercentage: Number(value) }
          : item
      ),
    }));

  const save = () => {
    const point = Number(form.taskPoint);
    if (
      (!editing && !form.phaseId) ||
      !form.taskName.trim() ||
      !form.startAt ||
      !form.endAt ||
      !point ||
      point <= 0 ||
      form.assignments.length === 0
    ) {
      setError(
        'Vui lòng nhập đủ thông tin task, chọn phase, điểm task và ít nhất một người nhận.'
      );
      return;
    }
    if (new Date(form.startAt).getTime() > new Date(form.endAt).getTime()) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }
    if (
      form.assignments.some(
        (item) =>
          item.contributionPercentage < 0 || item.contributionPercentage > 100
      )
    ) {
      setError('Contribution percentage phải từ 0 đến 100%.');
      return;
    }
    setSaving(true);
    setError('');
    const base = {
      taskName: form.taskName.trim(),
      description: form.description.trim(),
      startAt: requestDateTime(form.startAt),
      endAt: requestDateTime(form.endAt),
      taskPoint: point,
      assignments: form.assignments,
    };
    const request = editing
      ? updateTask(editing.id, {
          ...base,
          taskStatus: form.taskStatus,
        } satisfies UpdateTaskRequest)
      : createTask({
          projectId,
          phaseId: Number(form.phaseId),
          ...base,
        } satisfies CreateTaskRequest);
    void request
      .then(() => {
        closeForm();
        load();
      })
      .catch((requestError: unknown) =>
        setError(
          getApiErrorMessage(
            requestError,
            editing
              ? 'Không thể cập nhật nhiệm vụ.'
              : 'Không thể thêm nhiệm vụ.'
          )
        )
      )
      .finally(() => setSaving(false));
  };
  const remove = (task: TaskResponse) => {
    if (!window.confirm(`Xóa nhiệm vụ "${task.taskName}"?`)) return;
    setDeletingId(task.id);
    setError('');
    void deleteTask(task.id)
      .then(() =>
        setTasks((current) => current.filter((item) => item.id !== task.id))
      )
      .catch((requestError: unknown) =>
        setError(getApiErrorMessage(requestError, 'Không thể xóa nhiệm vụ.'))
      )
      .finally(() => setDeletingId(null));
  };
  const reloadNotes = (taskId: number) => {
    setLoadingNotes(true);
    void getTaskNotes(taskId)
      .then((response) => setNotes(response.resultList ?? []))
      .catch((requestError: unknown) =>
        setError(getApiErrorMessage(requestError, 'Không thể tải task note.'))
      )
      .finally(() => setLoadingNotes(false));
  };
  const openDetail = (task: TaskResponse) => {
    setSelectedTask(task);
    setNotes([]);
    setLoadingDetail(true);
    setError('');
    void getTaskDetailForPm(task.id)
      .then((response) => {
        if (response.result) setSelectedTask(response.result);
      })
      .catch((requestError: unknown) =>
        setError(
          getApiErrorMessage(requestError, 'Không thể tải chi tiết nhiệm vụ.')
        )
      )
      .finally(() => setLoadingDetail(false));
    reloadNotes(task.id);
  };
  const confirmNote = (note: TaskNoteResponse) => {
    void confirmTaskNote(note.id)
      .then((response) => {
        setNotes((current) =>
          current.map((item) =>
            item.id === note.id ? (response.result ?? item) : item
          )
        );
      })
      .catch((requestError: unknown) =>
        setError(
          getApiErrorMessage(requestError, 'Không thể xác nhận task note.')
        )
      );
  };

  return (
    <section className="task-panel">
      {!formOpen && !selectedTask && (
        <div className="task-toolbar">
          <label className="task-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') load();
              }}
              placeholder="Tìm kiếm nhiệm vụ..."
              aria-label="Tìm kiếm nhiệm vụ"
            />
          </label>
          <select
            className="task-phase-filter"
            value={phaseId}
            onChange={(event) => {
              const nextPhaseId = event.target.value;
              setPhaseId(nextPhaseId);
              load(keyword, nextPhaseId);
            }}
            aria-label="Lọc theo giai đoạn"
          >
            <option value="">Tất cả giai đoạn</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.phaseName}
              </option>
            ))}
          </select>
          {canManage && (
            <button
              className="task-add-button"
              type="button"
              onClick={openCreate}
            >
              + Thêm task
            </button>
          )}
        </div>
      )}
      {error && <div className="task-error">{error}</div>}
      {formOpen ? (
        <div className="task-form">
          <h3>{editing ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'}</h3>
          <div className="task-form-fields">
            <label>
              <span>Giai đoạn</span>
              <select
                value={form.phaseId}
                onChange={(event) =>
                  setForm({ ...form, phaseId: event.target.value })
                }
                disabled={Boolean(editing)}
              >
                <option value="">Chọn giai đoạn</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.phaseName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tên task</span>
              <input
                value={form.taskName}
                onChange={(event) =>
                  setForm({ ...form, taskName: event.target.value })
                }
              />
            </label>
            <label>
              <span>Điểm task</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.taskPoint}
                onChange={(event) =>
                  setForm({ ...form, taskPoint: event.target.value })
                }
              />
            </label>
            <label>
              <span>Ngày bắt đầu</span>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(event) =>
                  setForm({ ...form, startAt: event.target.value })
                }
              />
            </label>
            <label>
              <span>Ngày kết thúc</span>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(event) =>
                  setForm({ ...form, endAt: event.target.value })
                }
              />
            </label>
            {editing && (
              <label>
                <span>Trạng thái</span>
                <select
                  value={form.taskStatus}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      taskStatus: event.target
                        .value as TaskResponse['taskStatus'],
                    })
                  }
                >
                  {Object.entries(taskStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="task-description-field">
              <span>Mô tả</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
          </div>
          <div className="task-assignment-editor">
            <strong>Người nhận task</strong>
            {members.length === 0 ? (
              <p>Chưa có thành viên trong dự án.</p>
            ) : (
              members.map((member) => {
                const assignment = form.assignments.find(
                  (item) => item.employeeId === member.userId
                );
                return (
                  <label key={member.userId} className="task-assignment-option">
                    <input
                      type="checkbox"
                      checked={Boolean(assignment)}
                      onChange={() => toggleAssignment(member.userId)}
                    />
                    <span>{member.userName}</span>
                    {assignment && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assignment.contributionPercentage}
                        onChange={(event) =>
                          setContribution(member.userId, event.target.value)
                        }
                        aria-label={`Contribution của ${member.userName}`}
                      />
                    )}{' '}
                    {assignment && <small>%</small>}
                  </label>
                );
              })
            )}
          </div>
          <div className="task-form-actions">
            <button type="button" onClick={closeForm} disabled={saving}>
              Hủy
            </button>
            <button
              className="task-save-button"
              type="button"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : selectedTask ? (
        <div className="task-detail">
          <div className="task-detail-heading">
            <div>
              <h3>{selectedTask.taskName}</h3>
              <p>
                {selectedTask.phaseName} · {date(selectedTask.startAt)} -{' '}
                {date(selectedTask.endAt)}
              </p>
            </div>
            <button type="button" onClick={() => setSelectedTask(null)}>
              Đóng
            </button>
          </div>
          {loadingDetail ? (
            <div className="task-empty">Đang tải chi tiết...</div>
          ) : (
            <>
              <div className="task-detail-info">
                <span>
                  Trạng thái: <b>{taskStatusLabels[selectedTask.taskStatus]}</b>
                </span>
                <span>
                  Điểm: <b>{selectedTask.taskPoint}</b>
                </span>
                <span>
                  Tiến độ: <b>{clampProgress(selectedTask.progress)}%</b>
                </span>
                <p>{selectedTask.description || 'Không có mô tả.'}</p>
              </div>
              <h4>Người nhận task</h4>
              <div className="task-assignment-list">
                {selectedTask.assignments.length === 0 ? (
                  <p>Chưa có người nhận.</p>
                ) : (
                  selectedTask.assignments.map((assignment) => (
                    <div className="task-assignment-row" key={assignment.id}>
                      <span>
                        <b>{assignment.employeeName}</b>
                        <small>ID: {assignment.employeeId}</small>
                      </span>
                      <label>
                        Contribution{' '}
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={assignment.contributionPercentage}
                          onBlur={changeContribution}
                          disabled={
                            !canManage || updatingAssignmentId === assignment.id
                          }
                        />
                        %
                      </label>
                    </div>
                  ))
                )}
              </div>
              <div className="task-notes-heading">
                <h4>
                  Task note{' '}
                  <span className="task-note-count">
                    ({loadingNotes ? '...' : notes.length})
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => reloadNotes(selectedTask.id)}
                  disabled={loadingNotes}
                >
                  {loadingNotes ? 'Đang tải...' : 'Tải lại note'}
                </button>
              </div>
              {loadingNotes ? (
                <div className="task-note-loading">
                  Đang tải danh sách task note...
                </div>
              ) : notes.length === 0 ? (
                <div className="task-note-empty">
                  Task chưa có note hoặc không tải được dữ liệu note.
                </div>
              ) : (
                <div className="task-notes">
                  {notes.map((note) => (
                    <article className="task-note" key={note.id}>
                      <div>
                        <b>{note.employeeName}</b>
                        <small>
                          {date(note.workingDate)} · {note.workingHours} giờ ·{' '}
                          {noteStatusLabels[note.taskNoteStatus]}
                        </small>
                      </div>
                      <p>{note.content}</p>
                      {canManage &&
                        note.taskNoteStatus === 'PENDING_CONFIRMATION' && (
                          <button
                            className="task-confirm-note-button"
                            type="button"
                            onClick={() => confirmNote(note)}
                          >
                            ✓ Xác nhận note
                          </button>
                        )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="task-table-scroll">
          <table className="task-table">
            <thead>
              <tr>
                <th>Tên task</th>
                <th>Giai đoạn</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Tiến độ</th>
                <th>Điểm</th>
                {canManage && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="task-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="task-empty">
                    Chưa có nhiệm vụ nào.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const value = clampProgress(task.progress);
                  return (
                    <tr key={task.id}>
                      <td className="task-name-cell">
                        <button type="button" onClick={() => openDetail(task)}>
                          {task.taskName}
                        </button>
                      </td>
                      <td>{task.phaseName}</td>
                      <td>
                        {date(task.startAt)} - {date(task.endAt)}
                      </td>
                      <td>
                        <span
                          className={`task-status task-status-${task.taskStatus.toLowerCase()}`}
                        >
                          {taskStatusLabels[task.taskStatus]}
                        </span>
                      </td>
                      <td>
                        <div className="task-progress">
                          <div>
                            <i style={{ width: `${value}%` }} />
                          </div>
                          <b>{value}%</b>
                        </div>
                      </td>
                      <td>{task.taskPoint}</td>
                      {canManage && (
                        <td>
                          <div className="task-actions">
                            <button
                              type="button"
                              onClick={() => openDetail(task)}
                            >
                              Chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(task)}
                            >
                              Sửa
                            </button>
                            <button
                              className="danger"
                              type="button"
                              onClick={() => remove(task)}
                              disabled={deletingId === task.id}
                            >
                              {deletingId === task.id ? '...' : 'Xóa'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
