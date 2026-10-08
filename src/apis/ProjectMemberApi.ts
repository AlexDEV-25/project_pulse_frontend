import { httpDelete, httpGet, httpPost } from './HttpClient';
import type { APIResponse, ProjectMemberResponse } from '../dto/response';
import type { CreateProjectMemberRequest } from '../dto/request';

export const getProjectMembers = (projectId: number, params?: { keyword?: string }) => {
  const query = new URLSearchParams();
  if (params?.keyword?.trim()) query.set('keyword', params.keyword.trim());
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpGet<APIResponse<ProjectMemberResponse>>(`/api/project-member/project/${projectId}${suffix}`);
};

export const getMyProjects = () =>
  httpGet<APIResponse<ProjectMemberResponse>>('/api/project-member/my-projects');

export const createProjectMember = (data: CreateProjectMemberRequest) =>
  httpPost<APIResponse<ProjectMemberResponse>>('/api/project-member', data);

export const deleteProjectMember = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/project-member/${id}`);
