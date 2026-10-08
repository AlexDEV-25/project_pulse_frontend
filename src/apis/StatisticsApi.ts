import { httpGet } from './HttpClient';
import type { APIResponse } from '../dto/response';
import type {
  EmployeeStatisticsSummaryResponse,
  EmployeeTaskStatisticsResponse,
  InProgressProjectStatisticsResponse,
  ProjectEvAcStatisticResponse,
  ProjectStatusStatisticResponse,
  ProjectOverviewStatisticsResponse,
  StatisticsSummaryResponse,
} from '../dto/response';
import type { ProjectStatus } from '../dto/enum';

export const getStatisticsSummary = () =>
  httpGet<APIResponse<StatisticsSummaryResponse>>('/api/statistics/summary');
export const getProjectStatusStatistics = () =>
  httpGet<APIResponse<Record<ProjectStatus, ProjectStatusStatisticResponse>>>(
    '/api/statistics/projects/status-statistics'
  );
export const getProjectOverviewStatistics = () =>
  httpGet<APIResponse<ProjectOverviewStatisticsResponse>>(
    '/api/statistics/projects/overview'
  );
export const getProjectEvAcStatistics = () =>
  httpGet<APIResponse<Record<string, ProjectEvAcStatisticResponse>>>(
    '/api/statistics/projects/ev-ac-statistics'
  );
export const getInProgressProjectStatistics = () =>
  httpGet<APIResponse<InProgressProjectStatisticsResponse>>(
    '/api/statistics/projects/in-progress'
  );
export const getEmployeeStatisticsSummary = () =>
  httpGet<APIResponse<EmployeeStatisticsSummaryResponse>>(
    '/api/statistics/employee/summary'
  );
export const getEmployeeProjectPointStatistics = () =>
  httpGet<APIResponse<Record<string, number>>>(
    '/api/statistics/employee/project-points'
  );
export const getEmployeeTaskStatistics = () =>
  httpGet<APIResponse<EmployeeTaskStatisticsResponse>>(
    '/api/statistics/employee/tasks'
  );
