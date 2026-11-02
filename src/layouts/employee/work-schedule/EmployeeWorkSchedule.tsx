import { useEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/apis/HttpClient';
import {
  getMyTasksByDate,
  getWeeklyWorkSchedule,
} from '@/apis/EmployeeWorkScheduleApi';
import type {
  TaskResponse,
  WeeklyWorkScheduleResponse,
} from '@/dto/response';
import DashboardFrame from '@/layouts/common/components/dashboard/DashboardFrame';
import State from '@/layouts/common/components/ui/State';
import ScheduleHeader from './components/ScheduleHeader';
import TaskDetailPanel from './components/TaskDetailPanel';
import WeeklySchedule from './components/WeeklySchedule';
import './work-schedule.css';

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (value: string, amount: number) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toDateValue(date);
};

const emptySchedule: WeeklyWorkScheduleResponse = {
  weekStart: toDateValue(new Date()),
  weekEnd: toDateValue(new Date()),
  days: [],
};

export default function EmployeeWorkSchedule({
  onLogout,
  activeMenu,
  onMenuChange,
}: {
  onLogout: () => void;
  activeMenu?: string;
  onMenuChange?: (label: string) => void;
}) {
  const today = toDateValue(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<WeeklyWorkScheduleResponse>(emptySchedule);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [tasksDate, setTasksDate] = useState('');
  const [error, setError] = useState('');
  const scheduleRequestId = useRef(0);
  const taskRequestId = useRef(0);

  const selectedDay = useMemo(
    () => schedule.days.find((day) => day.date === selectedDate),
    [schedule.days, selectedDate]
  );
  const phaseIds = useMemo(
    () => [...new Set((selectedDay?.allocations ?? []).map((allocation) => allocation.phaseId))],
    [selectedDay]
  );
  const loadingSchedule = scheduleDate !== selectedDate;
  const loadingTasks =
    Boolean(selectedDay) && phaseIds.length > 0 && tasksDate !== selectedDate;

  const selectDate = (date: string) => {
    setError('');
    setSelectedDate(date);
  };

  useEffect(() => {
    const currentRequest = ++scheduleRequestId.current;
    getWeeklyWorkSchedule(selectedDate)
      .then((response) => {
        if (currentRequest !== scheduleRequestId.current) return;
        const nextSchedule = response.result ?? emptySchedule;
        setSchedule(nextSchedule);
        setScheduleDate(selectedDate);
        if (!nextSchedule.days.some((day) => day.date === selectedDate)) {
          setSelectedDate(nextSchedule.weekStart);
        }
      })
      .catch((requestError: unknown) => {
        if (currentRequest === scheduleRequestId.current) {
          setError(getApiErrorMessage(requestError));
          setSchedule(emptySchedule);
          setTasks([]);
          setScheduleDate(selectedDate);
          setTasksDate(selectedDate);
        }
      });
  }, [selectedDate]);

  useEffect(() => {
    const currentRequest = ++taskRequestId.current;
    if (!selectedDay || phaseIds.length === 0) {
      return;
    }
    getMyTasksByDate(selectedDate, phaseIds)
      .then((response) => {
        if (currentRequest === taskRequestId.current) {
          setTasks(response.resultList ?? []);
          setTasksDate(selectedDate);
        }
      })
      .catch((requestError: unknown) => {
        if (currentRequest === taskRequestId.current) {
          setError(getApiErrorMessage(requestError));
          setTasks([]);
          setTasksDate(selectedDate);
        }
      });
  }, [phaseIds, selectedDate, selectedDay]);

  const changeWeek = (amount: number) =>
    selectDate(addDays(selectedDate, amount * 7));

  const openTaskDetail = (task: TaskResponse) => {
    const link = `/projects/${task.projectId}?tab=tasks&taskId=${task.id}`;
    window.history.pushState({}, '', link);
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { link } }));
    onMenuChange?.(`Chi tiết dự án ${task.projectId}`);
  };

  return (
    <DashboardFrame
      role="EMPLOYEE"
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
    >
      <div className="employee-work-schedule">
        <ScheduleHeader
          weekStart={schedule.weekStart}
          weekEnd={schedule.weekEnd}
          selectedDate={selectedDate}
          onPreviousWeek={() => changeWeek(-1)}
          onToday={() => selectDate(today)}
          onNextWeek={() => changeWeek(1)}
          onDateChange={selectDate}
        />
        {error && <State error>{error}</State>}
        {loadingSchedule ? (
          <div className="schedule-loading">Đang tải lịch làm việc...</div>
        ) : (
          <div className="work-schedule-layout">
            <WeeklySchedule
              days={schedule.days}
              selectedDate={selectedDate}
              today={today}
              onSelectDate={selectDate}
            />
            <TaskDetailPanel
              selectedDate={selectedDate}
              dayOfWeek={selectedDay?.dayOfWeek}
              tasks={tasksDate === selectedDate ? tasks : []}
              hasAllocations={phaseIds.length > 0}
              loading={loadingTasks}
              onTaskClick={openTaskDetail}
            />
          </div>
        )}
      </div>
    </DashboardFrame>
  );
}
