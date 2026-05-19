export type OvertimeType =
  | "Diurna"
  | "Nocturna"
  | "Feriada Diurna"
  | "Feriada Nocturna";
export type OvertimeStatus = "Pendiente" | "Aprobado" | "Rechazado";

export interface Overtime {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  hours: number;
  type: OvertimeType;
  status: OvertimeStatus;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOvertimeRequest {
  employeeId: string;
  date: string;
  hours: number;
  type: OvertimeType;
  notes?: string;
}
export interface UpdateOvertimeRequest
  extends Partial<Omit<CreateOvertimeRequest, "employeeId">> {}
export interface OvertimeListResponse {
  total: number;
  overtime: Overtime[];
}
