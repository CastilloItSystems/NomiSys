// DTOs y tipos para Posiciones/Cargos
export interface CreatePositionDTO {
  name: string
  code?: string
  description?: string
  level?: string
}

export interface UpdatePositionDTO {
  name?: string
  code?: string
  description?: string
  level?: string
  isActive?: boolean
}

export interface PositionDTO {
  id: string
  companyId: string
  name: string
  code: string | null
  description: string | null
  level: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListPositionsFilters {
  search?: string | undefined // búsqueda en name o code
  isActive?: boolean
  orderBy?: 'name' | 'code' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
