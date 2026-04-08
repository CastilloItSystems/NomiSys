/**
 * Employee Module - Interfaces
 * Tipos para Employee, EmployeeJobInfo, EmployeeSalaryHistory, EmployeeBankAccount
 */

export type DocumentType = "V" | "E" | "P";
export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "ONBOARDING";
export type ContractType =
  | "INDEFINITE"
  | "FIXED_TERM"
  | "PROJECT"
  | "INTERNSHIP";
export type WorkShift = "FULL_TIME" | "PART_TIME" | "MIXED" | "NIGHT";
export type PayFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";
export type Currency = "VES" | "USD";
export type AccountType = "SAVINGS" | "CHECKING";
export type TerminationReason =
  | "RESIGNATION"
  | "DISMISSAL"
  | "MUTUAL_AGREEMENT"
  | "RETIREMENT";

export interface Employee {
  id: string;
  companyId: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string | Date;
  gender: string;
  maritalStatus?: string;
  nationality?: string;
  phone: string;
  email?: string;
  address: string;
  birthPlace?: string;
  dependents: number;
  ivssNumber?: string;
  rifNumber?: string;
  isFaovEnrolled: boolean;
  isIncesEnrolled: boolean;
  status: EmployeeStatus;
  hireDate: string | Date;
  terminationDate?: string | Date;
  terminationReason?: TerminationReason;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  observations?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy?: string;
}

export interface EmployeeJobInfo {
  id: string;
  employeeId: string;
  positionId: string;
  departmentId: string;
  costCenter?: string;
  contractType: ContractType;
  workShift: WorkShift;
  payFrequency: PayFrequency;
  supervisorId?: string;
  effectiveDate: string | Date;
  endDate?: string | Date;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string | Date;
}

export interface EmployeeSalaryHistory {
  id: string;
  employeeId: string;
  salaryAmount: number;
  currency: Currency;
  effectiveDate: string | Date;
  endDate?: string | Date;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string | Date;
}

export interface EmployeeBankAccount {
  id: string;
  employeeId: string;
  bankId: string;
  accountType: AccountType;
  accountNumber: string;
  isPrimary: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EmployeeStatusHistory {
  id: string;
  employeeId: string;
  status: EmployeeStatus;
  effectiveDate: string | Date;
  reason?: string;
  comments?: string;
  createdBy: string;
  createdAt: string | Date;
}

// DTOs for API requests
export interface CreateEmployeeRequest {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  gender: string;
  maritalStatus?: string;
  nationality?: string;
  phone: string;
  email?: string;
  address: string;
  birthPlace?: string;
  dependents?: number;
  ivssNumber?: string;
  rifNumber?: string;
  isFaovEnrolled?: boolean;
  isIncesEnrolled?: boolean;
  hireDate: string;
  positionId: string;
  departmentId: string;
  costCenter?: string;
  contractType: ContractType;
  workShift: WorkShift;
  payFrequency: PayFrequency;
  supervisorId?: string;
  salaryAmount: number;
  currency: Currency;
  bankId: string;
  accountType: AccountType;
  accountNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  observations?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: string;
}

export interface EmployeesListResponse {
  total: number;
  employees: Employee[];
}

export interface EmployeeDetailsResponse {
  employee: Employee;
  currentJobInfo?: EmployeeJobInfo;
  currentSalaryHistory?: EmployeeSalaryHistory;
  bankAccount?: EmployeeBankAccount;
  salaryHistory: EmployeeSalaryHistory[];
  jobHistory: EmployeeJobInfo[];
}
