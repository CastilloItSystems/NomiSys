export type AttendanceStatus =
  | 'Presente'
  | 'Ausente'
  | 'Tardanza'
  | 'Permiso'
  | 'Vacaciones'
  | 'Feriado'

export interface CreateAttendanceDTO {
  employeeId: string
  date: string | Date
  status: AttendanceStatus
  checkIn?: string | Date
  checkOut?: string | Date
  notes?: string
}

export interface UpdateAttendanceDTO {
  status?: AttendanceStatus
  checkIn?: string | Date | null
  checkOut?: string | Date | null
  notes?: string
}

export interface AttendanceDTO {
  id: string
  companyId: string
  employeeId: string
  date: Date
  status: AttendanceStatus
  checkIn: Date | null
  checkOut: Date | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListAttendanceFilters {
  employeeId?: string
  status?: AttendanceStatus
  dateFrom?: string | Date
  dateTo?: string | Date
  orderBy?: 'date' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
