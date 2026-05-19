export type LoanStatus = "Activo" | "Pagado" | "Cancelado";

export interface Loan {
  id: string;
  companyId: string;
  employeeId: string;
  amount: number;
  remainingBalance: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  reason: string | null;
  status: LoanStatus;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateLoanRequest {
  employeeId: string;
  amount: number;
  installments: number;
  startDate: string;
  reason?: string;
}
export interface UpdateLoanRequest {
  status?: LoanStatus;
  reason?: string;
}
export interface LoansListResponse {
  total: number;
  loans: Loan[];
}
