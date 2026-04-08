// DTOs y tipos para Bancos
export interface CreateBankDTO {
  name: string
  code: string
}

export interface UpdateBankDTO {
  name?: string
  code?: string
  isActive?: boolean
}

export interface BankDTO {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListBanksFilters {
  search?: string | undefined // búsqueda en name o code
  isActive?: boolean
  orderBy?: 'name' | 'code' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface PaginationParams {
  limit?: number
  offset?: number
}
