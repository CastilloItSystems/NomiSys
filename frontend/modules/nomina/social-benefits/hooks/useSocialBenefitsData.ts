import useSWR from "swr";
import { useCallback } from "react";
import { getSocialBenefits } from "../services/socialBenefit.service";
import { SocialBenefitsListResponse } from "../interfaces/socialBenefit.interface";

export const useSocialBenefitsData = (
  employeeId?: string,
  year?: number,
  quarter?: number,
) => {
  const { data, error, isLoading, mutate } = useSWR<SocialBenefitsListResponse>(
    ["social-benefits-list", employeeId, year, quarter],
    ([, eid, y, q]: [
      string,
      string | undefined,
      number | undefined,
      number | undefined,
    ]) => getSocialBenefits(eid, y, q),
    { revalidateOnFocus: false },
  );

  return {
    benefits: data?.benefits ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate: useCallback(() => mutate(), [mutate]),
  };
};
