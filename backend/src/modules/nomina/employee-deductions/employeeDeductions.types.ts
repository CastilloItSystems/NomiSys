export type CalcType = 'Porcentaje' | 'Monto Fijo'

export interface CreateEmployeeDeductionDTO {
  employeeId: string
  conceptId: string
  calcType: CalcType
  amount?: number
  percentage?: number
  description?: string
  startDate: string | Date
  endDate?: string | Date
}

export interface UpdateEmployeeDeductionDTO {
  calcType?: CalcType
  amount?: number
  percentage?: number
  description?: string
  startDate?: string | Date
  endDate?: string | Date
  isActive?: boolean
}

export interface EmployeeDeductionDTO {
  id: string
  companyId: string
  employeeId: string
  conceptId: string
  calcType: CalcType
  amount: number | null
  percentage: number | null
  description: string | null
  startDate: Date
  endDate: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListEmployeeDeductionsFilters {
  employeeId?: string
  conceptId?: string
  isActive?: boolean
  orderBy?: 'startDate' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
