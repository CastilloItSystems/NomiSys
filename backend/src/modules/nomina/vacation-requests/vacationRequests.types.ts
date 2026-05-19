export type VacationStatus =
  | 'Pendiente'
  | 'Aprobado'
  | 'Rechazado'
  | 'Cancelado'

export interface CreateVacationRequestDTO {
  employeeId: string
  startDate: string | Date
  endDate: string | Date
  days: number
  reason?: string
}

export interface UpdateVacationRequestDTO {
  startDate?: string | Date
  endDate?: string | Date
  days?: number
  reason?: string
}

export interface ApproveVacationRequestDTO {
  status: 'Aprobado' | 'Rechazado' | 'Cancelado'
}

export interface VacationRequestDTO {
  id: string
  companyId: string
  employeeId: string
  startDate: Date
  endDate: Date
  days: number
  reason: string | null
  status: VacationStatus
  approvedBy: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListVacationRequestsFilters {
  employeeId?: string
  status?: VacationStatus
  dateFrom?: string | Date
  dateTo?: string | Date
  orderBy?: 'startDate' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
