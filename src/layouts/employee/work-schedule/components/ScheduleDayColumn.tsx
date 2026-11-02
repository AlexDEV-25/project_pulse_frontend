import type { WorkScheduleDayResponse } from '@/dto/response';
import AllocationCard from './AllocationCard';

type Props = {
  day: WorkScheduleDayResponse;
  selected: boolean;
  today: boolean;
  onSelect: () => void;
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

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function ScheduleDayColumn({
  day,
  selected,
  today,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      className={`schedule-day-column${selected ? ' selected' : ''}${today ? ' today' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="schedule-day-heading">
        <strong>{dayLabels[day.dayOfWeek] ?? day.dayOfWeek}</strong>
        <small>{formatDate(day.date)}</small>
        {today && <em>Hôm nay</em>}
      </span>
      <span className="schedule-day-cards">
        {day.allocations.length > 0 ? (
          day.allocations.map((allocation, index) => (
            <AllocationCard
              key={`${allocation.id ?? allocation.phaseId}-${index}`}
              allocation={allocation}
            />
          ))
        ) : (
          <span className="schedule-day-empty">Không có phân bổ</span>
        )}
      </span>
    </button>
  );
}
