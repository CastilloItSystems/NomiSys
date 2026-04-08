// ==================== Enums & Mappings ====================

// English (canonical) values
export enum ContractType {
  INDEFINITE = 'INDEFINITE',
  FIXED_TERM = 'FIXED_TERM',
  TEMPORARY = 'TEMPORARY',
  PROJECT = 'PROJECT',
}

export enum WorkSchedule {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  EVENING = 'EVENING',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  BIWEEKLY = 'BIWEEKLY',
  WEEKLY = 'WEEKLY',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

// Field name normalization (aliases)
export const fieldNameMap: Record<string, string> = {
  workShift: 'workSchedule',
  payFrequency: 'paymentFrequency',
  salaryAmount: 'currentSalary',
  isFaovEnrolled: 'faovRegistered',
  isIncesEnrolled: 'incesRegistered',
  dependents: 'familyCharges',
}

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

  // Labor Information (English values)
  employeeCode: string // Unique per company
  hireDate: string // ISO 8601 date
  departmentId: string
  positionId: string
  contractType: ContractType | string
  workSchedule: WorkSchedule | string

  // Salary Information (English values)
  currentSalary: number
  paymentFrequency?: PaymentFrequency | string
  salaryType?: string

  // Organizational
  supervisorId?: string // Optional self-reference to another Employee

  // Venezuela-specific (English field names and boolean values)
  ivssNumber?: string
  rifNumber?: string
  faovRegistered?: boolean
  incesRegistered?: boolean
  familyCharges?: number

  // Banking Information (English values)
  bankId: string
  accountType: AccountType | string
  accountNumber: string

  // Field aliases (for normalization)
  workShift?: WorkSchedule | string
  payFrequency?: PaymentFrequency | string
  salaryAmount?: number
  isFaovEnrolled?: boolean
  isIncesEnrolled?: boolean
  dependents?: number

  // Extra fields (ignored)
  middleName?: string
  secondLastName?: string
  maritalStatus?: string
  nationality?: string
  birthPlace?: string
  costCenter?: string
  currency?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  observations?: string
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

  // Labor Information (English values, optional on update)
  contractType?: ContractType | string
  workSchedule?: WorkSchedule | string
  supervisorId?: string

  // Salary (English values, optional)
  currentSalary?: number
  paymentFrequency?: PaymentFrequency | string

  // Venezuela-specific (English field names, all optional)
  ivssNumber?: string
  rifNumber?: string
  faovRegistered?: boolean
  incesRegistered?: boolean
  familyCharges?: number

  // Banking Information (English values, optional)
  bankId?: string
  accountType?: AccountType | string
  accountNumber?: string

  // Control
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED'
  isActive?: boolean

  // Field aliases (for normalization)
  workShift?: WorkSchedule | string
  payFrequency?: PaymentFrequency | string
  salaryAmount?: number
  isFaovEnrolled?: boolean
  isIncesEnrolled?: boolean
  dependents?: number
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

  // Labor Information (English values)
  employeeCode: string
  hireDate: string
  departmentId: string
  positionId: string
  contractType: string
  workSchedule: string

  // Salary Information
  currentSalary: number | string // Can be Decimal from DB
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

  // Control (English values)
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED'
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
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED'
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
