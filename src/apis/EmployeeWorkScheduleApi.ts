import { httpGet } from './HttpClient';
import type {
  APIResponse,
  TaskResponse,
  WeeklyWorkScheduleResponse,
} from '../dto/response';

export const getWeeklyWorkSchedule = (date: string) =>
  httpGet<APIResponse<WeeklyWorkScheduleResponse>>(
    `/api/employee/work-schedule?date=${encodeURIComponent(date)}`
  );

export const getMyTasksByDate = (date: string, phaseIds: number[]) => {
  const params = new URLSearchParams({ date });
  phaseIds.forEach((phaseId) => params.append('phaseIds', String(phaseId)));
  return httpGet<APIResponse<TaskResponse>>(
    `/api/employee/work-schedule/tasks?${params.toString()}`
  );
};
