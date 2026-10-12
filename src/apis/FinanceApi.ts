import { httpGet, httpPost } from './HttpClient';
import type { CreateEarningTransferRequest } from '../dto/request';
import type {
  APIResponse,
  EarningTransactionResponse,
  EvmHealthResponse,
  TaskCostTransactionResponse,
} from '../dto/response';
import type { EarningTransactionType } from '../dto';

export const getProjectEvm = (projectId: number) =>
  httpGet<APIResponse<EvmHealthResponse>>(`/api/evm/project/${projectId}`);

export const getPhaseEvm = (phaseId: number) =>
  httpGet<APIResponse<EvmHealthResponse>>(`/api/evm/phase/${phaseId}`);

export const getTaskCosts = (id: number) =>
  httpGet<APIResponse<TaskCostTransactionResponse>>(
    `/api/task-cost-transactions/${id}`
  );

export const getProjectTaskCosts = (projectId: number) =>
  httpGet<APIResponse<TaskCostTransactionResponse>>(
    `/api/task-cost-transactions/project/${projectId}`
  );

export const getProjectTaskCostsFiltered = (
  projectId: number,
  params?: { keyword?: string; phaseId?: number }
) => {
  const query = new URLSearchParams();
  if (params?.keyword) query.set('keyword', params.keyword);
  if (params?.phaseId) query.set('phaseId', String(params.phaseId));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpGet<APIResponse<TaskCostTransactionResponse>>(
    `/api/task-cost-transactions/project/${projectId}${suffix}`
  );
};

export const getProjectEarnings = (projectId: number) =>
  getProjectEarningsFiltered(projectId);

export const getProjectEarningsFiltered = (
  projectId: number,
  params?: {
    keyword?: string;
    phaseId?: number;
    earningTransactionType?: EarningTransactionType;
  }
) => {
  const query = new URLSearchParams();
  if (params?.keyword) query.set('keyword', params.keyword);
  if (params?.phaseId) query.set('phaseId', String(params.phaseId));
  if (params?.earningTransactionType) {
    query.set('earningTransactionType', params.earningTransactionType);
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpGet<APIResponse<EarningTransactionResponse>>(
    `/api/earning-transactions/project/${projectId}${suffix}`
  );
};

export const getEarningById = (projectId: number, id: number) =>
  httpGet<APIResponse<EarningTransactionResponse>>(
    `/api/earning-transactions/project/${projectId}/${id}`
  );

export const transferProjectEarning = (
  projectId: number,
  data: CreateEarningTransferRequest
) =>
  httpPost<APIResponse<EarningTransactionResponse>>(
    `/api/earning-transactions/project/${projectId}/transfer`,
    data
  );
