import type { WorkScheduleDayResponse } from '@/dto/response';
import ScheduleDayColumn from './ScheduleDayColumn';

type Props = {
  days: WorkScheduleDayResponse[];
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
};

export default function WeeklySchedule({
  days,
  selectedDate,
  today,
  onSelectDate,
}: Props) {
  return (
    <section
      className="weekly-schedule-board dash-panel"
      aria-label="Lịch làm việc theo tuần"
    >
      {days.map((day) => (
        <ScheduleDayColumn
          key={day.date}
          day={day}
          selected={day.date === selectedDate}
          today={day.date === today}
          onSelect={() => onSelectDate(day.date)}
        />
      ))}
    </section>
  );
}
