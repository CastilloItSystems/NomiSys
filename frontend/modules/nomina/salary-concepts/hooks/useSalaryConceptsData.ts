import useSWR from "swr";
import { useCallback } from "react";
import { getSalaryConcepts } from "../services/salaryConcept.service";
import { SalaryConceptsListResponse } from "../interfaces/salaryConcept.interface";

export const useSalaryConceptsData = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useSWR<SalaryConceptsListResponse>(
    ["salary-concepts-list", params],
    ([, p]) => getSalaryConcepts(p as any),
    { revalidateOnFocus: false },
  );
  return {
    concepts: data?.salaryConcepts ?? data?.concepts ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
