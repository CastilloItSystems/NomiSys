import useSWR from "swr";
import { useCallback } from "react";
import { getLoans } from "../services/loan.service";

export const useLoansData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["loans-list", params],
    ([, p]) => getLoans(p as any),
    { revalidateOnFocus: false },
  );
  return {
    loans: data?.loans ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
