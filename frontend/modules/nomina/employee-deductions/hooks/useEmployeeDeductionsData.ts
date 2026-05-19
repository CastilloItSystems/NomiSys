import useSWR from "swr";
import { useCallback } from "react";
import { getEmployeeDeductions } from "../services/employeeDeduction.service";

export const useEmployeeDeductionsData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["employee-deductions-list", params],
    ([, p]) => getEmployeeDeductions(p as any),
    { revalidateOnFocus: false },
  );
  return {
    deductions: data?.deductions ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
