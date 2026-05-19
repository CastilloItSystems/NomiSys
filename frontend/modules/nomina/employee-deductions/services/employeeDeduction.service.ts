import apiClient from "@/app/api/apiClient";
import {
  EmployeeDeduction,
  CreateEmployeeDeductionRequest,
  UpdateEmployeeDeductionRequest,
  EmployeeDeductionsListResponse,
} from "../interfaces/employeeDeduction.interface";

export const getEmployeeDeductions = async (
  params?: Record<string, any>,
): Promise<EmployeeDeductionsListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/employee-deductions${qs}`);
  return res.data.data;
};

export const createEmployeeDeduction = async (
  data: CreateEmployeeDeductionRequest,
): Promise<EmployeeDeduction> => {
  const res = await apiClient.post("/nomina/employee-deductions", data);
  return res.data.data;
};

export const updateEmployeeDeduction = async (
  id: string,
  data: UpdateEmployeeDeductionRequest,
): Promise<EmployeeDeduction> => {
  const res = await apiClient.put(`/nomina/employee-deductions/${id}`, data);
  return res.data.data;
};

export const deleteEmployeeDeduction = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/employee-deductions/${id}`);
};
