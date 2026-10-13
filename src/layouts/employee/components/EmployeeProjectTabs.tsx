import { useEffect, useState } from 'react';
import { getMyAssignedTasks } from '@/apis/TaskApi';
import type { ProjectResponse, TaskResponse } from '@/dto/response';
import { EarningTable } from '@/layouts/common/project-detail/EarningTable';
import Table from '@/layouts/common/components/ui/Table';
import { EmployeeTaskDetail } from './EmployeeTaskDetail';

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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="employee-detail-empty">
                      Đang tải nhiệm vụ...
                    </td>
                  </tr>
                ) : visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="employee-detail-empty">
                      Chưa có nhiệm vụ được giao.
                    </td>
                  </tr>
                ) : (
                  visibleTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="employee-task-row-clickable"
                      onClick={() => setSelectedTask(task)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem chi tiết công việc: ${task.taskName}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTask(task);
                        }
                      }}
                    >
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
