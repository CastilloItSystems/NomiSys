export interface EmployeeConceptDTO {
  id: string
  companyId: string
  employeeId: string
  conceptId: string
  manualAmount: number | null
  disabled: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  concept?: {
    id: string
    code: string
    name: string
    type: string
    isTaxable: boolean
  }
}

export interface CreateEmployeeConceptDTO {
  employeeId: string
  conceptId: string
  manualAmount?: number
  disabled?: boolean
  notes?: string
}

export interface UpdateEmployeeConceptDTO {
  manualAmount?: number
  disabled?: boolean
  notes?: string
}

export interface ListEmployeeConceptsFilters {
  employeeId?: string
  conceptId?: string
  disabled?: boolean
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
