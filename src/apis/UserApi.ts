import { httpGet, httpPut } from './HttpClient';
import type {
  APIResponse,
  UserResponse,
  UserStatisticsResponse,
} from '../dto/response';
import type { UpdateUserRequest } from '../dto/request';

export type UserFilters = {
  roleNames?: string[];
  departmentId?: number;
  departmentIds?: number[];
  keyword?: string;
};

export const getAllUsers = (filters: UserFilters = {}) =>
  httpGet<APIResponse<UserResponse>>(
    `/api/users?${(() => {
      const params = new URLSearchParams();
      filters.roleNames?.forEach((role) => params.append('roleNames', role));
      if (filters.departmentId != null)
        params.append('departmentIds', String(filters.departmentId));
      filters.departmentIds?.forEach((id) =>
        params.append('departmentIds', String(id))
      );
      if (filters.keyword) params.set('keyword', filters.keyword);
      return params.toString();
    })()}`
  );

export const getUserStatistics = () =>
  httpGet<APIResponse<UserStatisticsResponse>>('/api/users/statistics');

export const getAllUsersForPm = () => getAllUsers({ roleNames: ['EMPLOYEE'] });

export const getUserById = (id: number) =>
  httpGet<APIResponse<UserResponse>>(`/api/users/${id}`);

export const getMyInfo = () =>
  httpGet<APIResponse<UserResponse>>('/api/users/my-info');

export const updateAvatar = (avatar: File) => {
  const formData = new FormData();
  formData.append('avt', avatar);
  return httpPut<APIResponse<UserResponse>>(
    '/api/users/update-avatar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
};

export const updateUser = (data: UpdateUserRequest) => {
  return httpPut<APIResponse<UserResponse>>(
    '/api/users/admin/update-user',
    data
  );
};
