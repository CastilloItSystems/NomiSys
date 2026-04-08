/**
 * Position Data Hooks - SWR for data fetching
 */

import useSWR from "swr";
import { useCallback } from "react";
import { getPositions } from "@/modules/nomina/positions/services/position.service";
import {
  Position,
  PositionsListResponse,
} from "@/modules/nomina/positions/interfaces/position.interface";

/**
 * Hook to fetch positions list
 */
export const usePositionsData = (search?: string) => {
  const { data, error, isLoading, mutate } = useSWR<PositionsListResponse>(
    ["positions-list", search],
    ([, s]) => getPositions(s),
    { revalidateOnFocus: false },
  );

  return {
    positions: data?.positions ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
