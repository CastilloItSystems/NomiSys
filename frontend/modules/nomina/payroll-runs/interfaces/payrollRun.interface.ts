export type PayrollRunStatus =
  | "Borrador"
  | "Procesando"
  | "Procesado"
  | "Aprobado"
  | "Pagado"
  | "Anulado";

export type PayrollRunType =
  | "Regular"
  | "Utilidades"
  | "VacacionesEspeciales"
  | "PrestacionesSociales";

export interface PayrollRun {
  id: string;
  companyId: string;
  periodId: string;
  runType: PayrollRunType;
  status: PayrollRunStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  notes: string | null;
  processedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PayrollRunLine {
  id: string;
  runId: string;
  employeeId: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  details: { concepts: { name: string; type: string; amount: number }[] };
}

export interface CreatePayrollRunRequest {
  periodId: string;
  runType?: PayrollRunType;
  notes?: string;
}
export interface PayrollRunsListResponse {
  total: number;
  runs: PayrollRun[];
}
