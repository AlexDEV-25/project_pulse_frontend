import { httpDelete, httpGet, httpPost, httpPut } from './HttpClient';
import type {
  APIResponse,
  DepartmentResponse,
  DepartmentStatisticsResponse,
} from '../dto/response';
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../dto/request';

export const createDepartment = (data: CreateDepartmentRequest) =>
  httpPost<APIResponse<DepartmentResponse>>('/api/department', data);

export const updateDepartment = (id: number, data: UpdateDepartmentRequest) =>
  httpPut<APIResponse<DepartmentResponse>>(`/api/department/${id}`, data);

export const deleteDepartment = (id: number) =>
  httpDelete<APIResponse<void>>(`/api/department/${id}`);

export const getAllDepartments = () =>
  httpGet<APIResponse<DepartmentResponse>>('/api/department');

export const getDepartmentById = (id: number) =>
  httpGet<APIResponse<DepartmentResponse>>(`/api/department/${id}`);

export const getDepartmentStatistics = () =>
  httpGet<APIResponse<DepartmentStatisticsResponse>>(
    '/api/department/statistics'
  );
