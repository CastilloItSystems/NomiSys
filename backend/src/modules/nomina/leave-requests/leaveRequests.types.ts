export type LeaveType =
  | 'Personal'
  | 'Médico'
  | 'Luto'
  | 'Maternidad'
  | 'Paternidad'
  | 'Judicial'
  | 'Otro'
export type LeaveStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado'

export interface CreateLeaveRequestDTO {
  employeeId: string
  type: LeaveType
  startDate: string | Date
  endDate: string | Date
  days: number
  reason?: string
}

export interface UpdateLeaveRequestDTO {
  type?: LeaveType
  startDate?: string | Date
  endDate?: string | Date
  days?: number
  reason?: string
}

export interface ApproveLeaveRequestDTO {
  status: 'Aprobado' | 'Rechazado' | 'Cancelado'
}

export interface LeaveRequestDTO {
  id: string
  companyId: string
  employeeId: string
  type: LeaveType
  startDate: Date
  endDate: Date
  days: number
  reason: string | null
  status: LeaveStatus
  approvedBy: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListLeaveRequestsFilters {
  employeeId?: string
  type?: LeaveType
  status?: LeaveStatus
  dateFrom?: string | Date
  dateTo?: string | Date
  orderBy?: 'startDate' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
