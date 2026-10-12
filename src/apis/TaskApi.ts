import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from './HttpClient';
import type { APIResponse, TaskResponse } from '../dto/response';
import type { CreateTaskRequest, UpdateTaskRequest } from '../dto/request';

export const createTask = (data: CreateTaskRequest) => {
  return httpPost<APIResponse<TaskResponse>>('/api/task', data);
};

export const updateTask = (id: number, data: UpdateTaskRequest) =>
  httpPut<APIResponse<TaskResponse>>(`/api/task/${id}`, data);

export const deleteTask = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/task/${id}`);

export const getTasksByProject = (
  projectId: number,
  keyword?: string,
  phaseId?: number
) => {
  const params = new URLSearchParams();
  if (keyword?.trim()) params.set('keyword', keyword.trim());
  if (phaseId !== undefined) params.set('phaseId', String(phaseId));
  const query = params.toString();
  return httpGet<APIResponse<TaskResponse>>(
    `/api/task/project/${projectId}${query ? `?${query}` : ''}`
  );
};

export const getTasksByProjectAndPhase = (projectId: number, phaseId: number) =>
  getTasksByProject(projectId, undefined, phaseId);

export const getTasksByEmployee = (projectId: number, employeeId: number) =>
  getTasksByProject(projectId).then((response) => ({
    ...response,
    resultList: (response.resultList ?? []).filter((task) =>
      task.assignments.some(
        (assignment) => assignment.employeeId === employeeId
      )
    ),
  }));

export const getTaskDetailForPm = (id: number) =>
  httpGet<APIResponse<TaskResponse>>(`/api/task/pm/detail/${id}`);

export const getMyAssignedTasks = (projectId: number) =>
  getTasksByProject(projectId);

export const getMyAssignedTaskById = (projectId: number, id: number) =>
  getTasksByProject(projectId).then((response) => ({
    ...response,
    result: response.resultList?.find((task) => task.id === id) ?? null,
  }));

export const getTaskDetailForEmployee = getMyAssignedTaskById;

export const updateMyTaskStatus = (
  id: number,
  taskStatus: TaskResponse['taskStatus']
) =>
  httpPatch<APIResponse<TaskResponse>>(`/api/task/${id}/status`, {
    taskStatus,
  });
