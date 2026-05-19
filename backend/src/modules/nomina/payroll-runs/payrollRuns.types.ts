export type PayrollRunStatus =
  | 'Borrador'
  | 'Procesando'
  | 'Procesado'
  | 'Aprobado'
  | 'Pagado'
  | 'Anulado'

export type PayrollRunType =
  | 'Regular'
  | 'Utilidades'
  | 'VacacionesEspeciales'
  | 'PrestacionesSociales'

export interface CreatePayrollRunDTO {
  periodId: string
  runType?: PayrollRunType
  notes?: string
}

export interface UpdatePayrollRunDTO {
  notes?: string
}

export interface PayrollRunDTO {
  id: string
  companyId: string
  periodId: string
  runType: PayrollRunType
  status: PayrollRunStatus
  totalGross: number
  totalDeductions: number
  totalNet: number
  employeeCount: number
  notes: string | null
  processedAt: Date | null
  approvedAt: Date | null
  paidAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PayrollRunLineDTO {
  id: string
  companyId: string
  runId: string
  employeeId: string
  grossSalary: number
  totalDeductions: number
  netSalary: number
  details: any
  createdAt: Date
  updatedAt: Date
}

export interface ListPayrollRunsFilters {
  periodId?: string
  status?: PayrollRunStatus
  runType?: PayrollRunType
  orderBy?: 'createdAt' | 'processedAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
