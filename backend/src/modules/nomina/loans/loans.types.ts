export type LoanStatus = 'Activo' | 'Pagado' | 'Cancelado'

export interface CreateLoanDTO {
  employeeId: string
  amount: number
  installments: number
  startDate: string | Date
  reason?: string
}

export interface UpdateLoanDTO {
  amount?: number
  installments?: number
  startDate?: string | Date
  endDate?: string | Date
  reason?: string
  status?: LoanStatus
}

export interface LoanDTO {
  id: string
  companyId: string
  employeeId: string
  amount: number
  remainingBalance: number
  installments: number
  installmentAmount: number
  startDate: Date
  endDate: Date | null
  reason: string | null
  status: LoanStatus
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListLoansFilters {
  employeeId?: string
  status?: LoanStatus
  orderBy?: 'startDate' | 'createdAt' | 'amount'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
