import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from './HttpClient';
import type {
  APIResponse,
  TaskAssignmentResponse,
  TaskResponse,
} from '../dto/response';
import type {
  CreateTaskRequest,
  UpdateTaskAssignmentRequest,
  UpdateTaskRequest,
} from '../dto/request';

export const createTask = (data: CreateTaskRequest) => {
  return httpPost<APIResponse<TaskResponse>>('/api/task', data);
};

export const updateTask = (id: number, data: UpdateTaskRequest) =>
  httpPut<APIResponse<TaskResponse>>(`/api/task/${id}`, data);

export const deleteTask = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/task/${id}`);

export const getTasksByProject = (projectId: number) =>
  httpGet<APIResponse<TaskResponse>>(`/api/task/project/${projectId}`);

export const getTasksByProjectAndPhase = (projectId: number, phaseId: number) =>
  httpGet<APIResponse<TaskResponse>>(
    `/api/task/project/${projectId}/phase/${phaseId}`
  );

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

export const getMyAssignedTasks = () =>
  httpGet<APIResponse<TaskResponse>>('/api/task/employee/me');

export const getMyAssignedTaskById = (id: number) =>
  httpGet<APIResponse<TaskResponse>>(`/api/task/employee/me/${id}`);

export const updateAssignmentContribution = (
  assignmentId: number,
  data: UpdateTaskAssignmentRequest
) =>
  httpPatch<APIResponse<TaskAssignmentResponse>>(
    `/api/task-assignment/${assignmentId}/contribution`,
    data
  );
