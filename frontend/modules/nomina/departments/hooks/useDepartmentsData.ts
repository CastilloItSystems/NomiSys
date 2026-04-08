/**
 * Department Data Hooks - SWR for data fetching
 */

import useSWR from "swr";
import { useCallback } from "react";
import { getDepartments } from "@/modules/nomina/departments/services/department.service";
import {
  Department,
  DepartmentsListResponse,
} from "@/modules/nomina/departments/interfaces/department.interface";

/**
 * Hook to fetch departments list
 */
export const useDepartmentsData = (search?: string) => {
  const { data, error, isLoading, mutate } = useSWR<DepartmentsListResponse>(
    ["departments-list", search],
    ([, s]) => getDepartments(s),
    { revalidateOnFocus: false },
  );

  return {
    departments: data?.departments ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
