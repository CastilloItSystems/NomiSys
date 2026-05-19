export type AttendanceStatus =
  | "Presente"
  | "Ausente"
  | "Tardanza"
  | "Permiso"
  | "Vacaciones"
  | "Feriado";

export interface Attendance {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAttendanceRequest {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}
export interface UpdateAttendanceRequest
  extends Partial<Omit<CreateAttendanceRequest, "employeeId">> {}
export interface AttendanceListResponse {
  total: number;
  attendance: Attendance[];
}
