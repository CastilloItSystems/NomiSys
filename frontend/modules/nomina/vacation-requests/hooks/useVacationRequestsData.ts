import useSWR from "swr";
import { useCallback } from "react";
import { getVacationRequests } from "../services/vacationRequest.service";

export const useVacationRequestsData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["vacation-requests-list", params],
    ([, p]) => getVacationRequests(p as any),
    { revalidateOnFocus: false },
  );
  return {
    requests: data?.requests ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
