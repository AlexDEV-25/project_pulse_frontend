import { useEffect, useState } from 'react';
import {
  getMyAssignedTaskById,
  getMyAssignedTasks,
  updateMyTaskStatus,
} from '@/apis/TaskApi';
import { createTaskNote, getTaskNotes } from '@/apis/TaskNoteApi';
import type { CreateTaskNoteRequest } from '@/dto/request';
import type {
  ProjectResponse,
  TaskNoteResponse,
  TaskResponse,
} from '@/dto/response';
import { EarningTable } from '@/layouts/common/project-detail/EarningTable';
import Table from '@/layouts/common/components/ui/Table';

type Props = { projectId: number; project: ProjectResponse };

const statusLabels: Record<TaskResponse['taskStatus'], string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  CANCELED: 'Đã hủy',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('vi-VN');
};

const noteStatusLabels: Record<TaskNoteResponse['taskNoteStatus'], string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
};

function EmployeeTaskDetail({
  task: initialTask,
  onClose,
}: {
  task: TaskResponse;
  onClose: () => void;
}) {
  const [task, setTask] = useState(initialTask);
  const [notes, setNotes] = useState<TaskNoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
    setError('');
    void Promise.all([
      getMyAssignedTaskById(initialTask.projectId, initialTask.id),
      getTaskNotes(initialTask.id),
    ])
      .then(([taskResponse, notesResponse]) => {
        if (taskResponse.result) setTask(taskResponse.result);
        setNotes(notesResponse.resultList ?? []);
      })
      .catch(() =>
        setError('Không thể tải đầy đủ chi tiết nhiệm vụ và task note.')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Load the selected task and its notes when the detail view opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // The selected task id is stable while this detail view is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTask.id]);

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
    void createTaskNote(task.id, {
      ...noteForm,
      workingDate,
      content: noteForm.content.trim(),
    })
      .then((response) => {
        if (response.result)
          setNotes((current) => [...current, response.result!]);
        setNoteForm((current) => ({
          ...current,
          content: '',
          workingHours: 1,
        }));
      })
      .catch(() =>
        setError(
          'Không thể tạo task note. Task chỉ cho phép tạo note khi đang thực hiện.'
        )
      )
      .finally(() => setSavingNote(false));
  };

  const startTask = () => {
    if (task.taskStatus !== 'TODO') return;

    setUpdatingStatus(true);
    setError('');
    void updateMyTaskStatus(task.id, 'IN_PROGRESS')
      .then((response) => {
        if (response.result) setTask(response.result);
      })
      .catch(() =>
        setError('Không thể cập nhật trạng thái task. Vui lòng thử lại.')
      )
      .finally(() => setUpdatingStatus(false));
  };

  return (
    <div className="employee-task-detail">
      <div className="employee-task-detail-heading">
        <div>
          <p>Chi tiết công việc</p>
          <h3>{task.taskName}</h3>
          <span>
            {task.phaseName} · {formatDate(task.startAt)} -{' '}
            {formatDate(task.endAt)}
          </span>
        </div>
        <button type="button" onClick={onClose}>
          Đóng
        </button>
      </div>
      {error && <div className="employee-detail-error">{error}</div>}
      {loading ? (
        <div className="employee-detail-empty">Đang tải chi tiết...</div>
      ) : (
        <>
          <div className="employee-task-detail-info">
            <span
              className={`employee-task-detail-status ${task.taskStatus.toLowerCase()}`}
            >
              Trạng thái: <b>{statusLabels[task.taskStatus]}</b>
            </span>
            <span>
              Điểm: <b>{task.taskPoint}</b>
            </span>
            <span>
              Tiến độ: <b>{task.progress ?? 0}%</b>
            </span>
            <p>{task.description || 'Không có mô tả.'}</p>
          </div>
          {task.taskStatus === 'TODO' && (
            <button
              className="employee-task-start-button"
              type="button"
              onClick={startTask}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Đang cập nhật...' : 'Xác nhận nhận task'}
            </button>
          )}
          <h4>Người nhận task</h4>
          <div className="employee-task-assignment-list">
            {task.assignments.map((assignment) => (
              <div key={assignment.id}>
                <b>{assignment.employeeName}</b>
                <span>Contribution: {assignment.contributionPercentage}%</span>
              </div>
            ))}
          </div>
          <div className="employee-task-notes-heading">
            <h4>Task note ({notes.length})</h4>
            <button type="button" onClick={load}>
              Tải lại note
            </button>
          </div>
          <div className="employee-task-note-form">
            <input
              type="date"
              value={noteForm.workingDate ?? ''}
              onChange={(event) =>
                setNoteForm({ ...noteForm, workingDate: event.target.value })
              }
            />
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
            />
            <textarea
              value={noteForm.content}
              onChange={(event) =>
                setNoteForm({ ...noteForm, content: event.target.value })
              }
              placeholder="Nội dung công việc đã thực hiện..."
              rows={3}
            />
            <button type="button" onClick={saveNote} disabled={savingNote}>
              {savingNote ? 'Đang lưu...' : 'Tạo task note'}
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="employee-detail-empty">Chưa có task note.</div>
          ) : (
            <div className="employee-task-notes-list">
              {notes.map((note) => (
                <article key={note.id}>
                  <div>
                    <b>{note.employeeName}</b>
                    <small>
                      {formatDate(note.workingDate)} · {note.workingHours} giờ ·{' '}
                      {noteStatusLabels[note.taskNoteStatus]}
                    </small>
                  </div>
                  <p>{note.content}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmployeeTaskTable({ projectId }: { projectId: number }) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  useEffect(() => {
    let active = true;
    void getMyAssignedTasks(projectId)
      .then((response) => {
        if (!active) return;
        setTasks(response.resultList ?? []);
      })
      .catch(() => active && setError('Không thể tải danh sách nhiệm vụ.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [projectId]);

  const visibleTasks = tasks.filter((task) =>
    task.taskName.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  return (
    <section className="employee-detail-table-panel">
      {selectedTask ? (
        <EmployeeTaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      ) : (
        <>
          <div className="employee-detail-toolbar">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kiếm nhiệm vụ..."
            />
          </div>
          {error && <div className="employee-detail-error">{error}</div>}
          <div className="employee-detail-table-scroll">
            <Table className="employee-detail-table">
              <thead>
                <tr>
                  <th>Nhiệm vụ</th>
                  <th>Giai đoạn</th>
                  <th>Thời hạn</th>
                  <th>Tiến độ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="employee-detail-empty">
                      Đang tải nhiệm vụ...
                    </td>
                  </tr>
                ) : visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="employee-detail-empty">
                      Chưa có nhiệm vụ được giao.
                    </td>
                  </tr>
                ) : (
                  visibleTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <b>{task.taskName}</b>
                        <small>{task.description || 'Không có mô tả'}</small>
                      </td>
                      <td>{task.phaseName}</td>
                      <td>{formatDate(task.endAt)}</td>
                      <td>
                        <div className="employee-detail-progress">
                          <i
                            style={{
                              width: `${Math.max(0, Math.min(100, task.progress ?? 0))}%`,
                            }}
                          />
                          <span>{task.progress ?? 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`employee-task-status ${task.taskStatus.toLowerCase()}`}
                        >
                          {statusLabels[task.taskStatus]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="employee-task-detail-button"
                          type="button"
                          onClick={() => setSelectedTask(task)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}

export default function EmployeeProjectTabs({ projectId, project }: Props) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'earnings'>('tasks');

  return (
    <section className="employee-detail-tabs-card">
      <div className="employee-detail-tabs">
        <button
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          Nhiệm vụ
        </button>
        <button
          className={activeTab === 'earnings' ? 'active' : ''}
          onClick={() => setActiveTab('earnings')}
        >
          Giá trị thu được
        </button>
      </div>
      {activeTab === 'tasks' && <EmployeeTaskTable projectId={projectId} />}
      {activeTab === 'earnings' && (
        <EarningTable projectId={projectId} canTransfer={false} />
      )}
      <p className="employee-detail-note">
        {project.projectName} · Chỉ hiển thị dữ liệu bạn được phép xem.
      </p>
    </section>
  );
}
