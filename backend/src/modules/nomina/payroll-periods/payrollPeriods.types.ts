// DTOs y tipos para Períodos de Nómina

export type PayrollFrequency = 'Semanal' | 'Quincenal' | 'Mensual'
export type PayrollPeriodStatus = 'Borrador' | 'Abierto' | 'Cerrado' | 'Pagado'

export interface CreatePayrollPeriodDTO {
  name: string
  frequency: PayrollFrequency
  startDate: string | Date
  endDate: string | Date
  paymentDate: string | Date
}

export interface UpdatePayrollPeriodDTO {
  name?: string
  frequency?: PayrollFrequency
  startDate?: string | Date
  endDate?: string | Date
  paymentDate?: string | Date
  status?: PayrollPeriodStatus
  isActive?: boolean
}

export interface PayrollPeriodDTO {
  id: string
  companyId: string
  name: string
  frequency: PayrollFrequency
  startDate: Date
  endDate: Date
  paymentDate: Date
  status: PayrollPeriodStatus
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListPayrollPeriodsFilters {
  search?: string
  frequency?: PayrollFrequency
  status?: PayrollPeriodStatus
  isActive?: boolean
  orderBy?: 'name' | 'startDate' | 'paymentDate' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
