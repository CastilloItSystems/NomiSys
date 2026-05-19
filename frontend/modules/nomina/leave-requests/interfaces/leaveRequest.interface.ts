export type LeaveType =
  | "Personal"
  | "Médico"
  | "Luto"
  | "Maternidad"
  | "Paternidad"
  | "Judicial"
  | "Otro";
export type LeaveStatus = "Pendiente" | "Aprobado" | "Rechazado" | "Cancelado";

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string | null;
  approvedBy: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateLeaveRequestRequest {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}
export interface LeaveRequestsListResponse {
  total: number;
  requests: LeaveRequest[];
}
