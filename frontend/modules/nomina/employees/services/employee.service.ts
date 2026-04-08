/**
 * Employee Service
 * API service layer for employee operations
 */

import apiClient from "@/app/api/apiClient";
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeesListResponse,
  EmployeeDetailsResponse,
} from "@/modules/nomina/employees/interfaces/employee.interface";

/**
 * Fetch all employees with pagination and filters
 */
export const getEmployees = async (
  page: number = 0,
  limit: number = 10,
  search?: string,
  departmentId?: string,
  positionId?: string,
  status?: string,
): Promise<EmployeesListResponse> => {
  const params = new URLSearchParams();
  params.append("skip", (page * limit).toString());
  params.append("take", limit.toString());
  if (search) params.append("search", search);
  if (departmentId) params.append("departmentId", departmentId);
  if (positionId) params.append("positionId", positionId);
  if (status) params.append("status", status);

  const response = await apiClient.get(
    `/nomina/employees?${params.toString()}`,
  );
  return response.data.data;
};

/**
 * Fetch single employee with full details
 */
export const getEmployee = async (
  id: string,
): Promise<EmployeeDetailsResponse> => {
  const response = await apiClient.get(`/nomina/employees/${id}`);
  return response.data.data;
};

/**
 * Create new employee
 */
export const createEmployee = async (
  data: CreateEmployeeRequest,
): Promise<Employee> => {
  const response = await apiClient.post("/nomina/employees", data);
  return response.data.data;
};

/**
 * Update existing employee
 */
export const updateEmployee = async (
  id: string,
  data: UpdateEmployeeRequest,
): Promise<Employee> => {
  const response = await apiClient.put(`/nomina/employees/${id}`, data);
  return response.data.data;
};

/**
 * Delete employee (soft delete via status change)
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/employees/${id}`);
};

/**
 * Get audit logs for employee
 */
export const getEmployeeAuditLogs = async (
  id: string,
): Promise<{ auditLogs: any[] }> => {
  const response = await apiClient.get(`/nomina/employees/${id}/audit-logs`);
  return response.data.data;
};

/**
 * Get salary history for employee
 */
export const getEmployeeSalaryHistory = async (id: string): Promise<any> => {
  const response = await apiClient.get(
    `/nomina/employees/${id}/salary-history`,
  );
  return response.data.data;
};

/**
 * Get job history for employee
 */
export const getEmployeeJobHistory = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/nomina/employees/${id}/job-history`);
  return response.data.data;
};

/**
 * Change employee status (Fase 2)
 */
export const changeEmployeeStatus = async (
  id: string,
  status: string,
  reason?: string,
  comments?: string,
): Promise<any> => {
  const response = await apiClient.post(`/nomina/employees/${id}/status`, {
    status,
    reason,
    comments,
  });
  return response.data.data;
};
