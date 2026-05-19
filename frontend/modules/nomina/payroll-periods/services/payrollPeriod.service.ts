/**
 * PayrollPeriod Service
 * API service layer for payroll period operations
 */

import apiClient from "@/app/api/apiClient";
import {
  PayrollPeriod,
  CreatePayrollPeriodRequest,
  UpdatePayrollPeriodRequest,
  PayrollPeriodsListResponse,
} from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";

/**
 * Fetch all payroll periods (filtered)
 */
export const getPayrollPeriods = async (
  search?: string,
  status?: string,
  frequency?: string,
): Promise<PayrollPeriodsListResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (frequency) params.append("frequency", frequency);

  const response = await apiClient.get(
    `/nomina/payroll-periods${
      params.toString() ? `?${params.toString()}` : ""
    }`,
  );
  return response.data.data;
};

/**
 * Fetch single payroll period
 */
export const getPayrollPeriod = async (id: string): Promise<PayrollPeriod> => {
  const response = await apiClient.get(`/nomina/payroll-periods/${id}`);
  return response.data.data;
};

/**
 * Create new payroll period
 */
export const createPayrollPeriod = async (
  data: CreatePayrollPeriodRequest,
): Promise<PayrollPeriod> => {
  const response = await apiClient.post("/nomina/payroll-periods", data);
  return response.data.data;
};

/**
 * Update existing payroll period
 */
export const updatePayrollPeriod = async (
  id: string,
  data: UpdatePayrollPeriodRequest,
): Promise<PayrollPeriod> => {
  const response = await apiClient.put(`/nomina/payroll-periods/${id}`, data);
  return response.data.data;
};

/**
 * Delete payroll period (soft delete, only Borrador status)
 */
export const deletePayrollPeriod = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/payroll-periods/${id}`);
};
