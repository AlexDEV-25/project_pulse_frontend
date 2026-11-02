import type { TaskResponse } from '@/dto/response';

const statusLabels: Record<string, string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  BLOCKED: 'Bị chặn',
  CANCELED: 'Đã hủy',
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function TaskCard({
  task,
  onClick,
}: {
  task: TaskResponse;
  onClick: () => void;
}) {
  return (
    <article
      className="schedule-task-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="schedule-task-card-title">
        <div>
          <strong>{task.taskName}</strong>
          <span>
            {task.projectName} · {task.phaseName}
          </span>
        </div>
        <span className={`schedule-task-status ${task.taskStatus.toLowerCase()}`}>
          {statusLabels[task.taskStatus] ?? task.taskStatus}
        </span>
      </div>
      {task.description && <p>{task.description}</p>}
      <dl>
        <div>
          <dt>Thời gian</dt>
          <dd>
            {formatDate(task.startAt)} - {formatDate(task.endAt)}
          </dd>
        </div>
        <div>
          <dt>Priority point</dt>
          <dd>{task.taskPoint}</dd>
        </div>
      </dl>
      <div className="schedule-task-progress">
        <span>Tiến độ</span>
        <div>
          <i style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }} />
        </div>
        <b>{task.progress}%</b>
      </div>
    </article>
  );
}
