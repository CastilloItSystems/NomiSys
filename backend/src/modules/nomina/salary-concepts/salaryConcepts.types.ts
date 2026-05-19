export type ConceptType = 'Ingreso' | 'Deducción' | 'Aporte Patronal'

export interface CreateSalaryConceptDTO {
  name: string
  code: string
  type: ConceptType
  description?: string
  isTaxable?: boolean
  formula?: string
  executionOrder?: number
  inputVars?: string[]
  contractTypeId?: string | null
}

export interface UpdateSalaryConceptDTO {
  name?: string
  code?: string
  type?: ConceptType
  description?: string
  isTaxable?: boolean
  isActive?: boolean
  formula?: string
  executionOrder?: number
  inputVars?: string[]
  contractTypeId?: string | null
}

export interface SalaryConceptDTO {
  id: string
  companyId: string
  name: string
  code: string
  type: ConceptType
  description: string | null
  isTaxable: boolean
  isActive: boolean
  formula: string | null
  executionOrder: number
  inputVars: string[]
  contractTypeId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ListSalaryConceptsFilters {
  search?: string
  type?: ConceptType
  isActive?: boolean
  orderBy?: 'name' | 'code' | 'type' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
