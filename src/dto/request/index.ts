import type { PhaseStatus, ProjectStatus, TaskStatus } from '../enum';

export interface AuthRequest {
  email: string;
  password: string;
}
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
export interface CreateAccountRequest {
  email: string;
  password: string;
  roles: string[];
  userName: string;
  position: string;
  resourceRate: number;
  departmentId: number;
}
export interface CreateAllocationRequest {
  phaseId: number;
  memberId: number;
  allocationPercentage: number;
}
export interface CreateDepartmentRequest {
  departmentName: string;
}
export interface CreateEarningTransferRequest {
  sourceTransactionId: number;
  targetEmployeeId: number;
  points: number;
  reason?: string;
}
export interface CreatePhaseRequest {
  projectId: number;
  startAt: string;
  endAt: string;
  phaseName: string;
  makeUpDates?: string[];
  offDates?: string[];
}
export interface CreateProjectMemberRequest {
  projectId: number;
  userId: number;
}
export interface CreateProjectRequest {
  projectName: string;
  pmId: number;
  startAt: string;
  endAt: string;
  clientBudget: number;
  projectBudget: number;
  description: string;
}
export interface CreateTaskRequest {
  projectId: number;
  phaseId: number;
  taskName: string;
  description: string;
  startAt: string;
  endAt: string;
  taskPoint: number;
  assignments: TaskAssignmentRequest[];
}
export interface EmailRequest {
  sender: Sender;
  to: Recipient[];
  subject: string;
  htmlContent: string;
}
export interface ExchangeTokenRequest {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  grantType: string;
}
export interface ForgotPasswordRequest {
  email: string;
  forgotPasswordCode: string;
  password: string;
}
export interface EmailForgotPasswordRequest {
  email: string;
}
export interface Recipient {
  name: string;
  email: string;
}
export interface SelectRoleRequest {
  email: string;
  password: string;
  role: string;
}
export interface SelectGoogleRoleRequest {
  code: string;
  role: string;
}
export interface SendEmailRequest {
  to: Recipient;
  subject: string;
  htmlContent: string;
}
export interface Sender {
  name: string;
  email: string;
}
export interface TaskAssignmentRequest {
  employeeId: number;
  contributionPercentage: number;
}
export interface CreateTaskNoteRequest {
  taskId: number;
  /** ISO local date-time expected by the backend LocalDateTime field. */
  workingDate: string;
  content: string;
  workingHours: number;
}
export interface UpdateTaskNoteRequest {
  workingDate: string;
  content: string;
  workingHours: number;
}
export interface TokenRequest {
  token: string;
}
export interface UpdateAllocationRequest {
  allocationPercentage: number;
}
export interface UpdateDepartmentRequest {
  departmentName: string;
  hidden: boolean;
}
export interface UpdatePhaseRequest {
  startAt: string;
  endAt: string;
  phaseName: string;
  phaseStatus: PhaseStatus;
  makeUpDates?: string[];
  offDates?: string[];
}
export interface UpdatePhaseStatusRequest {
  status: PhaseStatus;
}
export interface UpdateProjectRequest {
  projectName: string;
  pmId: number;
  startAt: string;
  endAt: string;
  clientBudget: number;
  projectBudget: number;
  description: string;
  projectStatus: ProjectStatus;
}
export interface UpdateTaskAssignmentRequest {
  contributionPercentage: number;
}
export interface UpdateTaskRequest {
  taskName: string;
  description: string;
  startAt: string;
  endAt: string;
  taskStatus: TaskStatus;
  taskPoint: number;
  assignments: TaskAssignmentRequest[];
}
export interface UpdateUserRequest {
  id: number;
  userName: string;
  position: string;
  resourceRate: number;
  departmentId: number;
  roles: string[];
}
