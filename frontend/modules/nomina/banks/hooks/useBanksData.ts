/**
 * Bank Data Hooks - SWR for data fetching
 */

import useSWR from "swr";
import { useCallback } from "react";
import { getBanks } from "@/modules/nomina/banks/services/bank.service";
import {
  Bank,
  BanksListResponse,
} from "@/modules/nomina/banks/interfaces/bank.interface";

/**
 * Hook to fetch banks list
 */
export const useBanksData = (search?: string) => {
  const { data, error, isLoading, mutate } = useSWR<BanksListResponse>(
    ["banks-list", search],
    ([, s]) => getBanks(s),
    { revalidateOnFocus: false },
  );

  return {
    banks: data?.banks ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
