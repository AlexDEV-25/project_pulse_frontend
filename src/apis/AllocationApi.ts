import { httpDelete, httpGet, httpPost, httpPut } from './HttpClient';
import type { APIResponse, AllocationResponse } from '../dto/response';
import type {
  CreateAllocationRequest,
  UpdateAllocationRequest,
} from '../dto/request';

export const getMyAllocations = (projectId: number) =>
  httpGet<APIResponse<AllocationResponse>>(
    `/api/allocation/employee/me/${projectId}`
  );

export type AllocationFilters = { phaseId?: number; keyword?: string };

/** GET /api/allocation/{projectId}?phaseId=...&keyword=... */
export const getAllocationsByProject = (
  projectId: number,
  filters: AllocationFilters = {}
) => {
  const params = new URLSearchParams();
  if (filters.phaseId) params.set('phaseId', String(filters.phaseId));
  if (filters.keyword?.trim()) params.set('keyword', filters.keyword.trim());
  const query = params.toString();
  return httpGet<APIResponse<AllocationResponse>>(
    `/api/allocation/${projectId}${query ? `?${query}` : ''}`
  );
};

export const getAllocationsByProjectAndPhase = (
  projectId: number,
  phaseId?: number,
  keyword?: string
) => getAllocationsByProject(projectId, { phaseId, keyword });

export const createAllocation = (data: CreateAllocationRequest) =>
  httpPost<APIResponse<AllocationResponse>>('/api/allocation', data);

export const updateAllocation = (id: number, data: UpdateAllocationRequest) =>
  httpPut<APIResponse<AllocationResponse>>(`/api/allocation/${id}`, data);

export const deleteAllocation = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/allocation/${id}`);
