import { httpDelete, httpGet, httpPost, httpPut } from './HttpClient';
import type { APIResponse, PhaseResponse } from '../dto/response';
import type {
  CreatePhaseRequest,
  UpdatePhaseRequest,
  UpdatePhaseStatusRequest,
} from '../dto/request';

export const createPhase = (data: CreatePhaseRequest) => {
  return httpPost<APIResponse<PhaseResponse>>('/api/phase', data);
};

export const updatePhase = (id: number, data: UpdatePhaseRequest) => {
  return httpPut<APIResponse<PhaseResponse>>(`/api/phase/${id}`, data);
};

export const deletePhase = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/phase/${id}`);

export const getPhasesByProject = (projectId: number, keyword?: string) => {
  const params = new URLSearchParams();
  if (keyword?.trim()) params.set('keyword', keyword.trim());
  const query = params.toString();
  return httpGet<APIResponse<PhaseResponse>>(
    `/api/phase/project/${projectId}${query ? `?${query}` : ''}`
  );
};

export const getPhaseDetail = (phaseId: number) =>
  httpGet<APIResponse<PhaseResponse>>(`/api/phase/detail/${phaseId}`);

// Kept as compatibility aliases for existing screens; these endpoints use the
// same backend project/phase routes.
export const getPhasesByProjectForPm = getPhasesByProject;
export const getPhaseDetailForPm = (_projectId: number, phaseId: number) =>
  getPhaseDetail(phaseId);

export const updatePhaseStatus = (id: number, data: UpdatePhaseStatusRequest) =>
  Promise.reject<APIResponse<PhaseResponse>>(
    new Error(
      `Backend does not expose phase status endpoint (${id}, ${data.status})`
    )
  );
