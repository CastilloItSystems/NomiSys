export type CalcType = "Porcentaje" | "Monto Fijo";

export interface EmployeeDeduction {
  id: string;
  companyId: string;
  employeeId: string;
  conceptId: string;
  calcType: CalcType;
  amount: number | null;
  percentage: number | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateEmployeeDeductionRequest {
  employeeId: string;
  conceptId: string;
  calcType: CalcType;
  amount?: number;
  percentage?: number;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateEmployeeDeductionRequest
  extends Partial<Omit<CreateEmployeeDeductionRequest, "employeeId">> {
  isActive?: boolean;
}

export interface EmployeeDeductionsListResponse {
  total: number;
  deductions: EmployeeDeduction[];
}
