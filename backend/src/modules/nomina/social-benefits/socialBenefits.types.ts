export interface SocialBenefitDTO {
  id: string
  companyId: string
  employeeId: string
  period: string
  year: number
  quarter: number
  salarioIntegral: number
  diasGarantia: number
  monto: number
  montoAcumulado: number
  status: string
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateSocialBenefitDTO {
  employeeId: string
  year: number
  quarter: number
  salarioIntegral: number
  notes?: string
}

export interface ListSocialBenefitsFilters {
  employeeId?: string
  year?: number
  quarter?: number
  status?: string
  orderBy?: 'createdAt' | 'year'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface AccrualResultDTO {
  processed: number
  skipped: number
  results: SocialBenefitDTO[]
}
