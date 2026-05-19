/**
 * PayrollPeriod Data Hooks - SWR for data fetching
 */

import useSWR from "swr";
import { useCallback } from "react";
import { getPayrollPeriods } from "@/modules/nomina/payroll-periods/services/payrollPeriod.service";
import { PayrollPeriodsListResponse } from "@/modules/nomina/payroll-periods/interfaces/payrollPeriod.interface";

/**
 * Hook to fetch payroll periods list
 */
export const usePayrollPeriodsData = (
  search?: string,
  status?: string,
  frequency?: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<PayrollPeriodsListResponse>(
    ["payroll-periods-list", search, status, frequency],
    ([, s, st, f]: [
      string,
      string | undefined,
      string | undefined,
      string | undefined,
    ]) => getPayrollPeriods(s, st, f),
    { revalidateOnFocus: false },
  );

  return {
    payrollPeriods: data?.payrollPeriods ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
