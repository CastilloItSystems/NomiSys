import useSWR from "swr";
import { useCallback } from "react";
import { getAttendance } from "../services/attendance.service";

export const useAttendanceData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["attendance-list", params],
    ([, p]) => getAttendance(p as any),
    { revalidateOnFocus: false },
  );
  return {
    attendance: data?.attendance ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
