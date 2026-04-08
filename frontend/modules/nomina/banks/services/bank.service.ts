/**
 * Bank Service
 * API service layer for bank operations
 */

import apiClient from "@/app/api/apiClient";
import {
  Bank,
  CreateBankRequest,
  UpdateBankRequest,
  BanksListResponse,
} from "@/modules/nomina/banks/interfaces/bank.interface";

/**
 * Fetch all banks
 */
export const getBanks = async (search?: string): Promise<BanksListResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const response = await apiClient.get(
    `/nomina/banks${params.toString() ? `?${params.toString()}` : ""}`,
  );
  return response.data.data;
};

/**
 * Fetch single bank
 */
export const getBank = async (id: string): Promise<Bank> => {
  const response = await apiClient.get(`/nomina/banks/${id}`);
  return response.data.data;
};

/**
 * Create new bank
 */
export const createBank = async (data: CreateBankRequest): Promise<Bank> => {
  const response = await apiClient.post("/nomina/banks", data);
  return response.data.data;
};

/**
 * Update existing bank
 */
export const updateBank = async (
  id: string,
  data: UpdateBankRequest,
): Promise<Bank> => {
  const response = await apiClient.put(`/nomina/banks/${id}`, data);
  return response.data.data;
};

/**
 * Delete bank
 */
export const deleteBank = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/banks/${id}`);
};
