/**
 * Department Module - Interfaces
 */

export interface Department {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentRequest
  extends Partial<CreateDepartmentRequest> {
  id: string;
}

export interface DepartmentsListResponse {
  total: number;
  departments: Department[];
}
