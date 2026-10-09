import { httpDelete, httpGet, httpPost, httpPut } from './HttpClient';
import type { APIResponse, ProjectResponse } from '../dto/response';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../dto/request';

export const createProject = (data: CreateProjectRequest) =>
  httpPost<APIResponse<ProjectResponse>>('/api/project', data);

export const updateProject = (id: number, data: UpdateProjectRequest) =>
  httpPut<APIResponse<ProjectResponse>>(`/api/project/${id}`, data);

export const deleteProject = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/project/${id}`);

export type ProjectFilters = {
  keyword?: string;
  pmId?: number;
  projectStatus?: string;
};

export const getAllProjects = (filters: ProjectFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.pmId) params.set('pmId', String(filters.pmId));
  if (filters.projectStatus) params.set('projectStatus', filters.projectStatus);
  const query = params.toString();
  return httpGet<APIResponse<ProjectResponse>>(
    `/api/project${query ? `?${query}` : ''}`
  );
};

export const getProjectByIdForAdmin = (id: number) =>
  httpGet<APIResponse<ProjectResponse>>(`/api/project/${id}`);

export const getProjectDetailForPm = getProjectByIdForAdmin;
export const getProjectsForPm = getAllProjects;

/** Projects where the authenticated employee is a member. */
export const getMyProjects = (keyword?: string) => {
  const value = keyword?.trim();
  const query = value ? `?keyword=${encodeURIComponent(value)}` : '';
  return httpGet<APIResponse<ProjectResponse>>(`/api/project/my-projects${query}`);
};

/** The backend authorizes this endpoint for admin, PM and employee roles. */
export const getProjectDetailForEmployee = (id: number) =>
  httpGet<APIResponse<ProjectResponse>>(`/api/project/${id}`);
