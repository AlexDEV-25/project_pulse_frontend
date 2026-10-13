import { useEffect, useState } from 'react';
import { getTasksByProject } from '@/apis/TaskApi';
import { getPhasesByProject } from '@/apis/PhaseApi';
import { getMyInfo } from '@/apis/UserApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import type {
  PhaseResponse,
  ProjectResponse,
  TaskResponse,
} from '@/dto/response';
import { EarningTable } from '@/layouts/common/project-detail/EarningTable';
import {
  ManagementFilterButton,
  ManagementSearch,
  ManagementSelect,
} from '@/layouts/common/components/dashboard/ManagementFilters';
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
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const load = async (
    nextKeyword = keyword,
    nextPhaseId = phaseId,
    nextUserFilter = userFilter
  ) => {
    setLoading(true);
    setError('');
    try {
      let resolvedUserId: number | undefined = undefined;
      if (nextUserFilter === 'MINE') {
        let uid = currentUserId;
        if (!uid) {
          const myInfo = await getMyInfo();
          if (myInfo.result?.id) {
            uid = myInfo.result.id;
            setCurrentUserId(uid);
          }
        }
        resolvedUserId = uid ?? undefined;
      }
      const response = await getTasksByProject(
        projectId,
        nextKeyword,
        nextPhaseId ? Number(nextPhaseId) : undefined,
        resolvedUserId
      );
      setTasks(response.resultList ?? []);
    } catch (requestError: unknown) {
      setError(
        getApiErrorMessage(requestError, 'Không thể tải danh sách nhiệm vụ.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.allSettled([
      getTasksByProject(projectId),
      getPhasesByProject(projectId),
      getMyInfo(),
    ])
      .then(([taskResult, phaseResult, userResult]) => {
        if (!active) return;
        if (taskResult.status === 'fulfilled') {
          setTasks(taskResult.value.resultList ?? []);
        } else {
          setError(
            getApiErrorMessage(
              taskResult.reason,
              'Không thể tải danh sách nhiệm vụ.'
            )
          );
        }
        if (phaseResult.status === 'fulfilled') {
          setPhases(phaseResult.value.resultList ?? []);
        }
        if (userResult.status === 'fulfilled' && userResult.value.result?.id) {
          setCurrentUserId(userResult.value.result.id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const availablePhases =
    phases.length > 0
      ? phases
      : Array.from(
          new Map(
            tasks
              .filter((t) => t.phaseId && t.phaseName)
              .map((t) => [
                t.phaseId,
                { id: t.phaseId, phaseName: t.phaseName } as PhaseResponse,
              ])
          ).values()
        );

  return (
    <section className="employee-detail-table-panel">
      {selectedTask ? (
        <EmployeeTaskDetail
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            void load();
          }}
        />
      ) : (
        <>
          <div className="employee-detail-toolbar">
            <ManagementSearch
              value={keyword}
              onChange={setKeyword}
              onSearch={() => void load()}
              placeholder="Tìm kiếm nhiệm vụ..."
              className="detail-filter-search"
            />
            <ManagementSelect
              value={phaseId}
              onChange={(nextPhaseId) => {
                setPhaseId(nextPhaseId);
                void load(keyword, nextPhaseId, userFilter);
              }}
              placeholder="Tất cả giai đoạn"
              options={availablePhases.map((phase) => ({
                value: String(phase.id),
                label: phase.phaseName,
              }))}
              className="detail-filter-select"
            />
            <ManagementSelect
              value={userFilter}
              onChange={(nextUserFilter) => {
                setUserFilter(nextUserFilter);
                void load(keyword, phaseId, nextUserFilter);
              }}
              placeholder="Tất cả"
              options={[{ value: 'MINE', label: 'Của tôi' }]}
              className="detail-filter-select"
            />
            <ManagementFilterButton onClick={() => void load()} />
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
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="employee-detail-empty">
                      Chưa có nhiệm vụ nào.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
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
                          <div>
                            <i
                              style={{
                                width: `${Math.max(0, Math.min(100, task.progress ?? 0))}%`,
                              }}
                            />
                          </div>
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
