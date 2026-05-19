export type OvertimeType =
  | 'Diurna'
  | 'Nocturna'
  | 'Feriada Diurna'
  | 'Feriada Nocturna'
export type OvertimeStatus = 'Pendiente' | 'Aprobado' | 'Rechazado'

export interface CreateOvertimeDTO {
  employeeId: string
  date: string | Date
  hours: number
  type: OvertimeType
  reason?: string
}

export interface UpdateOvertimeDTO {
  date?: string | Date
  hours?: number
  type?: OvertimeType
  reason?: string
}

export interface ApproveOvertimeDTO {
  status: 'Aprobado' | 'Rechazado'
}

export interface OvertimeDTO {
  id: string
  companyId: string
  employeeId: string
  date: Date
  hours: number
  type: OvertimeType
  reason: string | null
  status: OvertimeStatus
  approvedBy: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListOvertimeFilters {
  employeeId?: string
  type?: OvertimeType
  status?: OvertimeStatus
  dateFrom?: string | Date
  dateTo?: string | Date
  orderBy?: 'date' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
