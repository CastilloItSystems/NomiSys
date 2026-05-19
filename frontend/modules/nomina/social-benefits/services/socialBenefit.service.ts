import apiClient from "@/app/api/apiClient";
import {
  SocialBenefitsListResponse,
  SocialBenefitsByEmployeeResponse,
  AccrueQuarterRequest,
  AccrueQuarterResponse,
} from "../interfaces/socialBenefit.interface";

export const getSocialBenefits = async (
  employeeId?: string,
  year?: number,
  quarter?: number,
  limit?: number,
  offset?: number,
): Promise<SocialBenefitsListResponse> => {
  const params = new URLSearchParams();
  if (employeeId) params.set("employeeId", employeeId);
  if (year !== undefined) params.set("year", String(year));
  if (quarter !== undefined) params.set("quarter", String(quarter));
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));
  const query = params.toString();
  const res = await apiClient.get(
    `/nomina/social-benefits${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getSocialBenefitsByEmployee = async (
  employeeId: string,
): Promise<SocialBenefitsByEmployeeResponse> => {
  const res = await apiClient.get(
    `/nomina/social-benefits/employee/${employeeId}`,
  );
  return res.data;
};

export const accrueQuarter = async (
  data: AccrueQuarterRequest,
): Promise<AccrueQuarterResponse> => {
  const res = await apiClient.post(
    "/nomina/social-benefits/accrue-quarter",
    data,
  );
  return res.data;
};

export const createSocialBenefit = async (data: Record<string, any>) => {
  const res = await apiClient.post("/nomina/social-benefits", data);
  return res.data;
};
