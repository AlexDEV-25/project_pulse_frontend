import { useEffect, useState } from 'react';
import { getPhasesByProject } from '@/apis/PhaseApi';
import { getProjectMembers } from '@/apis/ProjectMemberApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import {
  createTask,
  deleteTask,
  getTasksByProject,
  updateTask,
} from '@/apis/TaskApi';
import type {
  CreateTaskRequest,
  TaskAssignmentRequest,
  UpdateTaskRequest,
} from '@/dto/request';
import type {
  PhaseResponse,
  ProjectMemberResponse,
  TaskResponse,
} from '@/dto/response';
import {
  ManagementFilterButton,
  ManagementSearch,
  ManagementSelect,
} from '@/layouts/common/components/dashboard/ManagementFilters';
import Table from '@/layouts/common/components/ui/Table';
import EditButton from '@/layouts/common/components/ui/EditButton';
import DeleteButton from '@/layouts/common/components/ui/DeleteButton';
import { TaskDetail } from './TaskDetail';

const taskStatusLabels: Record<TaskResponse['taskStatus'], string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  CANCELED: 'Đã hủy',
};
const clampProgress = (value: number | null | undefined) =>
  Math.max(0, Math.min(100, Number(value) || 0));
const date = (value: string) => {
  if (!value) return '—';
  const clean = value.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('vi-VN');
};
const dateInput = (value: string) => (value ? value.slice(0, 10) : '');
const requestDate = (value: string) => (value ? value.slice(0, 10) : '');

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
type Props = {
  projectId: number;
  canManage?: boolean;
  role?: 'ADMIN' | 'PM';
};
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

export function TaskComponent({ projectId, canManage = false, role }: Props) {
  const isPopup = role === 'ADMIN';
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [userId, setUserId] = useState('');
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskResponse | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const load = (
    nextKeyword = keyword,
    nextPhaseId = phaseId,
    nextUserId = userId
  ) => {
    setLoading(true);
    setError('');
    void getTasksByProject(
      projectId,
      nextKeyword,
      nextPhaseId ? Number(nextPhaseId) : undefined,
      nextUserId ? Number(nextUserId) : undefined
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
      startAt: dateInput(task.startAt),
      endAt: dateInput(task.endAt),
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
      startAt: requestDate(form.startAt),
      endAt: requestDate(form.endAt),
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

  const openDetail = (task: TaskResponse) => {
    setSelectedTask(task);
    setError('');
  };

  return (
    <section className="task-panel">
      {!formOpen && (!selectedTask || isPopup) && (
        <div className="task-toolbar">
          <ManagementSearch
            value={keyword}
            onChange={setKeyword}
            onSearch={() => load()}
            placeholder="Tìm kiếm nhiệm vụ..."
            className="detail-filter-search"
          />
          <ManagementSelect
            value={phaseId}
            onChange={(nextPhaseId) => {
              setPhaseId(nextPhaseId);
              load(keyword, nextPhaseId, userId);
            }}
            placeholder="Tất cả giai đoạn"
            options={phases.map((phase) => ({
              value: String(phase.id),
              label: phase.phaseName,
            }))}
            className="detail-filter-select"
          />
          <ManagementSelect
            value={userId}
            onChange={(nextUserId) => {
              setUserId(nextUserId);
              load(keyword, phaseId, nextUserId);
            }}
            placeholder="Tất cả thành viên"
            options={Array.from(
              new Map(members.map((m) => [m.userId, m])).values()
            ).map((member) => ({
              value: String(member.userId),
              label: member.userName,
            }))}
            className="detail-filter-select"
          />
          <ManagementFilterButton onClick={() => load()} />
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
                type="date"
                value={form.startAt}
                onChange={(event) =>
                  setForm({ ...form, startAt: event.target.value })
                }
              />
            </label>
            <label>
              <span>Ngày kết thúc</span>
              <input
                type="date"
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
      ) : selectedTask && !isPopup ? (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          canManage={canManage}
          variant="inline"
        />
      ) : (
        <Table
          className="task-table"
          wrapperClassName="task-table-scroll"
        >
          <thead>
            <tr>
              <th>Tên task</th>
              <th>Giai đoạn</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Tiến độ</th>
              <th>Điểm</th>
              {canManage && <th className="col-task-actions">Thao tác</th>}
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
                  <tr
                    key={task.id}
                    className="task-row-clickable"
                    onClick={() => openDetail(task)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem chi tiết công việc: ${task.taskName}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDetail(task);
                      }
                    }}
                  >
                    <td className="task-name-cell">
                      <span className="task-name-text">{task.taskName}</span>
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
                      <td className="col-task-actions">
                        <div
                          className="task-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EditButton
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(task);
                            }}
                            title="Sửa nhiệm vụ"
                            aria-label="Sửa nhiệm vụ"
                          />
                          <DeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(task);
                            }}
                            disabled={deletingId === task.id}
                            title="Xóa nhiệm vụ"
                            aria-label="Xóa nhiệm vụ"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}

      {selectedTask && isPopup && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          canManage={canManage}
          variant="modal"
        />
      )}
    </section>
  );
}
