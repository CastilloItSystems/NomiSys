/**
 * PayrollPeriod Module - Interfaces
 */

export type PayrollFrequency = "Semanal" | "Quincenal" | "Mensual";
export type PayrollPeriodStatus = "Borrador" | "Abierto" | "Cerrado" | "Pagado";

export interface PayrollPeriod {
  id: string;
  companyId: string;
  name: string;
  frequency: PayrollFrequency;
  startDate: string | Date;
  endDate: string | Date;
  paymentDate: string | Date;
  status: PayrollPeriodStatus;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePayrollPeriodRequest {
  name: string;
  frequency: PayrollFrequency;
  startDate: string;
  endDate: string;
  paymentDate: string;
}

export interface UpdatePayrollPeriodRequest
  extends Partial<CreatePayrollPeriodRequest> {
  id: string;
  status?: PayrollPeriodStatus;
  isActive?: boolean;
}

export interface PayrollPeriodsListResponse {
  total: number;
  payrollPeriods: PayrollPeriod[];
}
