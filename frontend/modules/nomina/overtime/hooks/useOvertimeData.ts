import useSWR from "swr";
import { useCallback } from "react";
import { getOvertime } from "../services/overtime.service";

export const useOvertimeData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["overtime-list", params],
    ([, p]) => getOvertime(p as any),
    { revalidateOnFocus: false },
  );
  return {
    overtime: data?.overtime ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
