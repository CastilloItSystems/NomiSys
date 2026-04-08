// DTOs y tipos para Departamentos
export interface CreateDepartmentDTO {
  name: string
  code?: string
  description?: string
}

export interface UpdateDepartmentDTO {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
}

export interface DepartmentDTO {
  id: string
  companyId: string
  name: string
  code: string | null
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListDepartmentsFilters {
  search?: string | undefined // búsqueda en name o code
  isActive?: boolean
  orderBy?: 'name' | 'code' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
