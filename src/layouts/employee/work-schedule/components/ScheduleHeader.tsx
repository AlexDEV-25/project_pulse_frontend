import Icon from '@/layouts/common/components/ui/Icon';

type Props = {
  weekStart: string;
  weekEnd: string;
  selectedDate: string;
  onPreviousWeek: () => void;
  onToday: () => void;
  onNextWeek: () => void;
  onDateChange: (date: string) => void;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function ScheduleHeader({
  weekStart,
  weekEnd,
  selectedDate,
  onPreviousWeek,
  onToday,
  onNextWeek,
  onDateChange,
}: Props) {
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const selectedLabel = selectedDate === todayValue ? 'Today' : formatDate(selectedDate);

  return (
    <header className="work-schedule-header">
      <div>
        <p className="work-schedule-eyebrow">LỊCH LÀM VIỆC CỦA BẠN</p>
        <h1>Weekly Work Schedule</h1>
      </div>
      <div className="work-schedule-controls">
        <strong>
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </strong>
        <div className="work-schedule-nav" aria-label="Điều hướng tuần">
          <button type="button" onClick={onPreviousWeek} aria-label="Tuần trước">
            ‹
          </button>
          <button type="button" className="today-button" onClick={onToday}>
            {selectedLabel}
          </button>
          <button type="button" onClick={onNextWeek} aria-label="Tuần sau">
            ›
          </button>
        </div>
        <label className="work-schedule-date-picker" aria-label="Chọn ngày">
          <Icon name="calendar-days" size={19} />
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>
      </div>
    </header>
  );
}

