export type VacationStatus =
  | "Pendiente"
  | "Aprobado"
  | "Rechazado"
  | "Cancelado";

export interface VacationRequest {
  id: string;
  companyId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: VacationStatus;
  reason: string | null;
  approvedBy: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateVacationRequestRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}
export interface VacationRequestsListResponse {
  total: number;
  requests: VacationRequest[];
}
