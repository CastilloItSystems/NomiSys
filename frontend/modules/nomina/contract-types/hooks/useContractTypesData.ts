import useSWR from "swr";
import { useCallback } from "react";
import { getContractTypes } from "../services/contractType.service";

export const useContractTypesData = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "contract-types-list",
    getContractTypes,
    { revalidateOnFocus: false },
  );
  return {
    contractTypes: data?.contractTypes ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
