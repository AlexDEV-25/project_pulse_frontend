import type {
  EarningTransactionType,
  PhaseStatus,
  ProjectStatus,
  TaskNoteStatus,
  TaskStatus,
} from '../enum';

export interface APIResponse<T> {
  code: number;
  message: string;
  result: T | null;
  resultList: T[] | null;
}
export interface AllocationResponse {
  id: number;
  projectId: number;
  projectName: string;
  phaseId: number;
  phaseName: string;
  memberId: number;
  userId: number;
  userName: string;
  allocationPercentage: number;
  resourceRateSnapshot: number;
  allocationPoint: number;
}
export interface AuthResponse {
  authenticated: boolean;
  token: string;
}
export interface CreateAccountResponse {
  email: string;
  userName: string;
  position: string;
  resourceRate: number;
}
export interface DepartmentResponse {
  id: number;
  departmentName: string;
  hidden: boolean;
  employeeCount: number;
}
export interface DepartmentStatisticsResponse {
  totalDepartments: number;
  activeDepartments: number;
  hiddenDepartments: number;
}
export interface EmailResponse {
  messageId: string;
}
export interface EarningTransactionResponse {
  id: number;
  projectId: number;
  phaseId: number | null;
  phaseName: string | null;
  taskId: number | null;
  taskName: string | null;
  employeeId: number;
  employeeName: string;
  referenceTransactionId: number | null;
  points: number;
  earningTransactionType: EarningTransactionType;
  reason: string | null;
}
export interface ExchangeTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  tokenType: string;
}
export interface EvmHealthResponse {
  projectId: number;
  projectName: string;
  phaseId: number | null;
  phaseName: string | null;
  capturedAt: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  etc: number | null;
  vac: number | null;
  tcpi: number | null;
}
export interface IntrospectResponse {
  valid: boolean;
}
export interface OutboundUserResponse {
  id: string;
  email: string;
  verifiedEmail: boolean;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  locale: string;
}
export interface PermissionResponse {
  name: string;
  description: string;
}
export interface PhaseResponse {
  id: number;
  projectId: number;
  projectName: string;
  startAt: string;
  endAt: string;
  phaseName: string;
  makeUpDates: string[];
  offDates: string[];
  workdays: number;
  status: PhaseStatus;
  progress: number;
}
export interface ProjectMemberResponse {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  userName: string;
  userResourceRate: number;
  userPosition: string;
}
export interface ProjectResponse {
  id: number;
  projectName: string;
  pmId: number | null;
  pmName: string | null;
  startAt: string | null;
  endAt: string | null;
  clientBudget: number | null;
  projectBudget: number | null;
  description: string | null;
  projectStatus: ProjectStatus;
}
export interface RoleResponse {
  name: string;
  description: string;
  permissions: PermissionResponse[];
}
export interface TaskAssignmentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  contributionPercentage: number;
}
export interface TaskCostTransactionResponse {
  id: number;
  projectId: number;
  phaseId: number;
  phaseName: string;
  taskId: number;
  taskName: string;
  employeeId: number;
  employeeName: string;
  points: number;
  workdays: number;
  reason: string | null;
}
export interface TaskNoteResponse {
  id: number;
  taskId: number;
  employeeId: number;
  employeeName: string;
  employeeAvatarUrl: string;
  content: string;
  workingHours: number;
  workingDate: string;
  createdAt: string;
  updatedAt: string;
  taskNoteStatus: TaskNoteStatus;
}
export interface TaskResponse {
  id: number;
  projectId: number;
  projectName: string;
  phaseId: number;
  phaseName: string;
  taskName: string;
  description: string;
  startAt: string;
  endAt: string;
  taskStatus: TaskStatus;
  taskPoint: number;
  progress: number;
  assignments: TaskAssignmentResponse[];
}
export interface UserResponse {
  id: number;
  authId?: number;
  enabled: boolean;
  email?: string;
  userName: string;
  position: string;
  resourceRate: number;
  avatarUrl: string;
  departmentId: number;
  departmentName: string;
  roles: RoleResponse[];
}
export interface UserStatisticsResponse {
  totalUsers: number;
  usersByRole: Record<string, number>;
}
export interface UserWithoutCostResponse {
  id: number;
  authId?: number;
  enabled: boolean;
  email?: string;
  userName: string;
  position: string;
  resourceRate: number;
  avatarUrl: string;
  departmentName: string;
  roles: RoleResponse[];
}
export interface FileResponse {
  length: number;
  mediaType: string;
  fileName: string;
}
export interface StatisticsSummaryResponse {
  totalProject: number;
  totalUser: number | null;
  totalOverdueProject: number;
  totalNearingDeadlineProject: number;
}
export interface ProjectStatusStatisticResponse {
  count: number;
  percentage: number;
}
export interface ProjectOverviewStatisticsResponse {
  totalProject: number;
  projectStatusCounts: Record<ProjectStatus, number>;
}
export interface ProjectEvAcStatisticResponse {
  ev: number;
  ac: number;
}
export interface InProgressProjectStatisticsResponse {
  projectName: string;
  pmName: string | null;
  endAt: string;
  clientBudget: number | null;
  bac: number;
  cpi: number | null;
  spi: number | null;
  scheduleStatus: string;
}
export interface EmployeeStatisticsSummaryResponse {
  totalProject: number;
  totalEarnedPoint: number;
  totalAssignedTask: number;
  totalCompletedTask: number;
}
export interface EmployeeTaskStatisticsResponse {
  projectName: string;
  taskName: string;
  endAt: string;
  taskPoint: number;
  progress: number;
}
