import useSWR from "swr";
import { useCallback } from "react";
import { getPayrollRuns } from "../services/payrollRun.service";

export const usePayrollRunsData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["payroll-runs-list", params],
    ([, p]) => getPayrollRuns(p as any),
    { revalidateOnFocus: false },
  );
  return {
    runs: data?.runs ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
