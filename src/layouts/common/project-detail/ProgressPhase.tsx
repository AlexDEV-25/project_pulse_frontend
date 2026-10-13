import { useEffect, useState } from 'react';
import { getPhasesByProject } from '@/apis/PhaseApi';
import { getTasksByProjectAndPhase } from '@/apis/TaskApi';
import type { PhaseResponse, TaskResponse } from '@/dto/response';

const phaseStatusLabel: Record<PhaseResponse['status'], string> = {
  PLANNED: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
};
const taskStatusLabel: Record<TaskResponse['taskStatus'], string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  CANCELED: 'Đã hủy',
};
const progressValue = (value: number | null | undefined) =>
  Math.max(0, Math.min(100, Number(value) || 0));
const date = (value: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="phase-progress-track" aria-label={`Tiến độ ${value}%`}>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

export function ProgressPhase({ projectId }: { projectId: number }) {
  const [phases, setPhases] = useState<PhaseResponse[]>([]);
  const [tasks, setTasks] = useState<Record<number, TaskResponse[]>>({});
  const [openPhaseId, setOpenPhaseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    // Reset cached phase details whenever the selected project changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');
    setOpenPhaseId(null);
    setTasks({});
    void getPhasesByProject(projectId)
      .then((response) => {
        if (active) setPhases(response.resultList ?? []);
      })
      .catch(() => {
        if (active) setError('Không thể tải danh sách giai đoạn.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const togglePhase = (phaseId: number) => {
    if (openPhaseId === phaseId) {
      setOpenPhaseId(null);
      return;
    }
    setOpenPhaseId(phaseId);
    if (tasks[phaseId]) return;
    setLoadingTasks(phaseId);
    setError('');
    void getTasksByProjectAndPhase(projectId, phaseId)
      .then((response) => {
        setTasks((current) => ({
          ...current,
          [phaseId]: response.resultList ?? [],
        }));
      })
      .catch(() => setError('Không thể tải danh sách công việc của giai đoạn.'))
      .finally(() => setLoadingTasks(null));
  };

  if (loading)
    return <div className="phase-empty">Đang tải tiến độ dự án...</div>;
  if (error && phases.length === 0)
    return <div className="phase-error">{error}</div>;
  if (phases.length === 0)
    return <div className="phase-empty">Dự án chưa có giai đoạn nào.</div>;

  return (
    <section className="progress-phase-panel">
      <div className="progress-phase-heading">
        <div>
          <h2>Tiến độ &amp; Giai đoạn</h2>
          <p>Chọn một giai đoạn để xem các công việc bên trong.</p>
        </div>
        <span className="phase-overall-label">{phases.length} giai đoạn</span>
      </div>
      {error && <div className="phase-inline-error">{error}</div>}
      <div className="phase-list">
        {phases.map((phase, index) => {
          const phaseProgress = progressValue(phase.progress);
          const isOpen = openPhaseId === phase.id;
          const phaseTasks = tasks[phase.id] ?? [];
          return (
            <article
              className={`phase-item ${isOpen ? 'open' : ''}`}
              key={phase.id}
            >
              <button
                className="phase-summary"
                type="button"
                aria-expanded={isOpen}
                onClick={() => togglePhase(phase.id)}
              >
                <span
                  className={`phase-index phase-index-${phase.status.toLowerCase()}`}
                >
                  {isOpen ? '⌄' : index + 1}
                </span>
                <span className="phase-summary-main">
                  <span className="phase-title-row">
                    <strong>
                      Giai đoạn {index + 1}: {phase.phaseName}
                    </strong>
                    <span>
                      {date(phase.startAt)} – {date(phase.endAt)}
                    </span>
                  </span>
                  <span className="phase-progress-row">
                    <ProgressBar value={phaseProgress} />
                    <b>{phaseProgress}%</b>
                  </span>
                </span>
                <span
                  className={`phase-status phase-status-${phase.status.toLowerCase()}`}
                >
                  {phaseStatusLabel[phase.status]}
                </span>
                <span className="phase-chevron" aria-hidden="true">
                  ⌄
                </span>
              </button>
              {isOpen && (
                <div className="phase-task-list">
                  {loadingTasks === phase.id ? (
                    <div className="phase-task-empty">
                      Đang tải công việc...
                    </div>
                  ) : phaseTasks.length === 0 ? (
                    <div className="phase-task-empty">
                      Giai đoạn này chưa có công việc.
                    </div>
                  ) : (
                    phaseTasks.map((task) => {
                      const taskProgress = progressValue(task.progress);
                      return (
                        <div className="phase-task-row" key={task.id}>
                          <span className="task-branch" aria-hidden="true">
                            └
                          </span>
                          <span className="phase-task-name">
                            <strong>{task.taskName}</strong>
                            <small>
                              {date(task.startAt)} – {date(task.endAt)}
                            </small>
                          </span>
                          <ProgressBar value={taskProgress} />
                          <b className="phase-task-percent">{taskProgress}%</b>
                          <span
                            className={`task-status task-status-${task.taskStatus.toLowerCase()}`}
                          >
                            {taskStatusLabel[task.taskStatus]}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
