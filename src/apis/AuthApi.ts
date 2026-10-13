import { httpPost, httpPut } from './HttpClient';
import type {
  APIResponse,
  AuthResponse,
  CreateAccountResponse,
  IntrospectResponse,
} from '../dto/response';
import type {
  AuthRequest,
  ChangePasswordRequest,
  CreateAccountRequest,
  EmailForgotPasswordRequest,
  ForgotPasswordRequest,
  SelectGoogleRoleRequest,
  SelectRoleRequest,
  TokenRequest,
} from '../dto/request';

export const createAccount = (data: CreateAccountRequest) =>
  httpPost<APIResponse<CreateAccountResponse>>('/api/auth/admin', data);

export const login = (data: AuthRequest) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/log-in', data);

export const loginWithGoogle = (code: string) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/log-in-google', undefined, {
    params: { code },
  });

export const selectRole = (data: SelectRoleRequest) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/select-role', data);

export const selectGoogleRole = (data: SelectGoogleRoleRequest) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/select-role/google', data);

export const forgotPassword = (data: EmailForgotPasswordRequest) =>
  httpPost<APIResponse<void>>('/api/auth/forgot-password', data);

export const resetPassword = (data: ForgotPasswordRequest) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/reset-password', data);

export const refreshToken = (data: TokenRequest) =>
  httpPost<APIResponse<AuthResponse>>('/api/auth/refresh-token', data);

export const introspect = (data: TokenRequest) =>
  httpPost<APIResponse<IntrospectResponse>>('/api/auth/introspect', data);

export const changePassword = (data: ChangePasswordRequest) =>
  httpPut<APIResponse<void>>('/api/auth/change-password', data);
