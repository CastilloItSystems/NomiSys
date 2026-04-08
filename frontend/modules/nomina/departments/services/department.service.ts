/**
 * Department Service
 * API service layer for department operations
 */

import apiClient from "@/app/api/apiClient";
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentsListResponse,
} from "@/modules/nomina/departments/interfaces/department.interface";

/**
 * Fetch all departments
 */
export const getDepartments = async (
  search?: string,
): Promise<DepartmentsListResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const response = await apiClient.get(
    `/nomina/departments${params.toString() ? `?${params.toString()}` : ""}`,
  );
  return response.data.data;
};

/**
 * Fetch single department
 */
export const getDepartment = async (id: string): Promise<Department> => {
  const response = await apiClient.get(`/nomina/departments/${id}`);
  return response.data.data;
};

/**
 * Create new department
 */
export const createDepartment = async (
  data: CreateDepartmentRequest,
): Promise<Department> => {
  const response = await apiClient.post("/nomina/departments", data);
  return response.data.data;
};

/**
 * Update existing department
 */
export const updateDepartment = async (
  id: string,
  data: UpdateDepartmentRequest,
): Promise<Department> => {
  const response = await apiClient.put(`/nomina/departments/${id}`, data);
  return response.data.data;
};

/**
 * Delete department
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/departments/${id}`);
};
