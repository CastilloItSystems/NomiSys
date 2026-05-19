import useSWR from "swr";
import { useCallback } from "react";
import { getLeaveRequests } from "../services/leaveRequest.service";

export const useLeaveRequestsData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["leave-requests-list", params],
    ([, p]) => getLeaveRequests(p as any),
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
