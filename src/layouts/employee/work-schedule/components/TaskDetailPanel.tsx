import type { TaskResponse } from '@/dto/response';
import TaskCard from './TaskCard';

type Props = {
  selectedDate: string;
  dayOfWeek?: string;
  tasks: TaskResponse[];
  hasAllocations: boolean;
  loading: boolean;
  onTaskClick: (task: TaskResponse) => void;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const dayLabels: Record<string, string> = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ nhật',
};

export default function TaskDetailPanel({
  selectedDate,
  dayOfWeek,
  tasks,
  hasAllocations,
  loading,
  onTaskClick,
}: Props) {
  return (
    <aside className="schedule-task-panel dash-panel">
      <div className="schedule-panel-heading">
        <div>
          <p>Chi tiết ngày:</p>
          <h2>
            {dayLabels[dayOfWeek ?? '']
              ? `${dayLabels[dayOfWeek ?? '']} (${formatDate(selectedDate)})`
              : formatDate(selectedDate)}
          </h2>
        </div>
        <span aria-hidden="true">✦</span>
      </div>
      {loading ? (
        <div className="schedule-panel-state">Đang tải task...</div>
      ) : !hasAllocations ? (
        <div className="schedule-panel-state">Ngày này chưa có phase được phân bổ.</div>
      ) : tasks.length === 0 ? (
        <div className="schedule-panel-state">Ngày này chưa có task được giao.</div>
      ) : (
        <div className="schedule-task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      )}
    </aside>
  );
}
