/**
 * Employee Data Hooks - SWR for data fetching
 */

import useSWR from "swr";
import { useCallback } from "react";
import {
  getEmployees,
  getEmployee,
} from "@/modules/nomina/employees/services/employee.service";
import {
  Employee,
  EmployeesListResponse,
  EmployeeDetailsResponse,
} from "@/modules/nomina/employees/interfaces/employee.interface";

/**
 * Hook to fetch employees list with pagination and filters
 */
export const useEmployeesData = (
  page: number = 0,
  limit: number = 10,
  search?: string,
  departmentId?: string,
  positionId?: string,
  status?: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<EmployeesListResponse>(
    ["employees-list", page, limit, search, departmentId, positionId, status],
    ([, p, l, s, d, pos, st]) => getEmployees(p, l, s, d, pos, st),
    { revalidateOnFocus: false },
  );

  return {
    employees: data?.employees ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};

/**
 * Hook to fetch single employee details
 */
export const useEmployee = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<EmployeeDetailsResponse>(
    id ? `employee-${id}` : null,
    () => (id ? getEmployee(id) : Promise.resolve(null)),
    { revalidateOnFocus: false },
  );

  return {
    employee: data?.employee,
    jobInfo: data?.currentJobInfo,
    salaryHistory: data?.salaryHistory ?? [],
    jobHistory: data?.jobHistory ?? [],
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
