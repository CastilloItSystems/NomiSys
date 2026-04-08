// ==================== DTOs ====================

export interface CreateEmployeeDTO {
  // Personal Information
  firstName: string
  lastName: string
  documentType: 'V' | 'E' | 'P' // Venezolano, Extranjero, Pasaporte
  documentNumber: string
  birthDate: string // ISO 8601 date
  gender: 'M' | 'F' | 'O' // Male, Female, Other
  phone: string
  email: string
  address: string

  // Labor Information
  employeeCode: string // Unique per company
  hireDate: string // ISO 8601 date
  departmentId: string
  positionId: string
  contractType: 'Indefinido' | 'Fijo' | 'Temporal' | 'Obra' // Indefinite, Fixed, Temporary, Project-based
  workSchedule: 'Completo' | 'Medio' | 'Vespertino' // Full-time, Half-time, Evening

  // Salary Information
  currentSalary: number // Will be stored as Decimal in database
  salaryType?: 'Mensual' | 'Quincenal' | 'Semanal' // Monthly, Bi-weekly, Weekly
  paymentFrequency?: 'Mensual' | 'Quincenal' | 'Semanal'

  // Organizational
  supervisorId?: string // Optional self-reference to another Employee

  // Venezuela-specific
  ivssNumber?: string // IVSS number (Seguro Social Obligatorio)
  rifNumber?: string // RIF (Registro de Identificación Fiscal)
  faovRegistered?: boolean // FAOV (Fondo de Ahorro Obligatorio)
  incesRegistered?: boolean // INCES (Instituto Nacional de Capacitación y Educación Socialista)
  familyCharges?: number // Number of family members for deductions

  // Banking Information
  bankId: string
  accountType: 'Corriente' | 'Ahorro' // Current, Savings
  accountNumber: string
}

export interface UpdateEmployeeDTO {
  // Personal Information (some readonly on update)
  firstName?: string
  lastName?: string
  birthDate?: string
  gender?: 'M' | 'F' | 'O'
  phone?: string
  email?: string
  address?: string

  // Labor Information (departmentId, positionId handled separately via JobInfo)
  contractType?: 'Indefinido' | 'Fijo' | 'Temporal' | 'Obra'
  workSchedule?: 'Completo' | 'Medio' | 'Vespertino'
  supervisorId?: string

  // Salary (handled separately via SalaryHistory when changed)
  currentSalary?: number
  paymentFrequency?: 'Mensual' | 'Quincenal' | 'Semanal'

  // Venezuela-specific
  ivssNumber?: string
  rifNumber?: string
  faovRegistered?: boolean
  incesRegistered?: boolean
  familyCharges?: number

  // Banking Information
  bankId?: string
  accountType?: 'Corriente' | 'Ahorro'
  accountNumber?: string

  // Control
  status?: 'Activo' | 'Inactivo' | 'Suspendido' | 'Egresado'
  isActive?: boolean
}

export interface EmployeeDTO {
  id: string
  companyId: string

  // Personal Information
  firstName: string
  lastName: string
  documentType: 'V' | 'E' | 'P'
  documentNumber: string
  birthDate: string
  gender: 'M' | 'F' | 'O'
  phone: string
  email: string
  address: string

  // Labor Information
  employeeCode: string
  hireDate: string
  departmentId: string
  positionId: string
  contractType: string
  workSchedule: string

  // Salary Information
  currentSalary: number | string // Can be Decimal from DB
  salaryType?: string
  paymentFrequency?: string

  // Organizational
  supervisorId?: string

  // Venezuela-specific
  ivssNumber?: string
  rifNumber?: string
  faovRegistered?: boolean
  incesRegistered?: boolean
  familyCharges?: number

  // Banking Information
  bankId: string
  accountType: string
  accountNumber: string

  // Control
  status: 'Activo' | 'Inactivo' | 'Suspendido' | 'Egresado'
  isActive: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ==================== List/Filter Types ====================

export interface ListEmployeesFiltersInterface {
  search?: string // Search in firstName, lastName, documentNumber, employeeCode
  departmentId?: string
  positionId?: string
  status?: 'Activo' | 'Inactivo' | 'Suspendido' | 'Egresado'
  contractType?: string
  workSchedule?: string
  page?: number
  limit?: number
}

export interface ListEmployeesResponseInterface {
  data: EmployeeDTO[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}
