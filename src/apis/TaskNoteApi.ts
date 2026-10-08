import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from './HttpClient';
import type { APIResponse, TaskNoteResponse } from '../dto/response';
import type { TaskNoteRequest } from '../dto/request';

export const createTaskNote = (taskId: number, data: TaskNoteRequest) =>
  httpPost<APIResponse<TaskNoteResponse>>(`/api/task/${taskId}/notes`, data);

export const updateTaskNote = (noteId: number, data: TaskNoteRequest) =>
  httpPut<APIResponse<TaskNoteResponse>>(`/api/task-note/${noteId}`, data);

export const deleteTaskNote = (noteId: number) =>
  httpDelete<APIResponse<void>>(`/api/task-note/${noteId}`);

export const getTaskNotes = (taskId: number) =>
  httpGet<APIResponse<TaskNoteResponse>>(`/api/task/${taskId}/notes`);

export const confirmTaskNote = (noteId: number) =>
  httpPatch<APIResponse<TaskNoteResponse>>(`/api/task-note/${noteId}/confirm`);

export const getTaskNotesForPm = getTaskNotes;
export const confirmTaskNotes = (noteId: number, _data?: unknown) =>
  confirmTaskNote(noteId);
