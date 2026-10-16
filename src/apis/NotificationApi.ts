import { httpGet, httpPut } from './HttpClient';
import type { APIResponse, UserNotificationResponse } from '@/dto/response';

export const getAllNotifications = () =>
  httpGet<APIResponse<UserNotificationResponse>>(
    '/api/user-notifications/receiver'
  );

export const getUnreadNotifications = () =>
  httpGet<APIResponse<UserNotificationResponse>>(
    '/api/user-notifications/receiver/unread'
  );

export const readNotification = (id: number) =>
  httpPut<APIResponse<UserNotificationResponse>>(
    `/api/user-notifications/read/${id}`
  );

export const readAllNotifications = () =>
  httpPut<APIResponse<void>>('/api/user-notifications/read-all');
