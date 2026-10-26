import api, { httpGet, httpPost } from './HttpClient';
import type { CreateEarningTransferRequest } from '../dto/request';
import type {
  APIResponse,
  EarningTransactionResponse,
  EmployeeEvmPerformanceResponse,
  EvmHealthResponse,
  PhaseEvmDetailResponse,
  ProjectEvmFinancialResponse,
  TaskCostTransactionResponse,
} from '../dto/response';
import type { EarningTransactionType } from '../dto';

export const getProjectEvm = (projectId: number) =>
  httpGet<APIResponse<EvmHealthResponse>>(`/api/evm/project/${projectId}`);

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

export const getProjectPhasesEvm = (projectId: number) =>
  httpGet<APIResponse<PhaseEvmDetailResponse>>(
    `/api/evm/project/${projectId}/phases`
  );

export const getProjectEmployeesEvm = (projectId: number) =>
  httpGet<APIResponse<EmployeeEvmPerformanceResponse>>(
    `/api/evm/project/${projectId}/employees`
  );

export const getProjectFinancialSummary = (projectId: number) =>
  httpGet<APIResponse<ProjectEvmFinancialResponse>>(
    `/api/evm/project/${projectId}/financial-summary`
  );

export const downloadProjectEvmCsv = async (
  projectId: number,
  projectName: string
) => {
  const response = await api.get(`/api/evm/project/${projectId}/export-csv`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedName = projectName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
  a.download = `Bao_cao_EVM_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
