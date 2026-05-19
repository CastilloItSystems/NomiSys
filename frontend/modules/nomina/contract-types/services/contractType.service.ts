import apiClient from "@/app/api/apiClient";
import {
  ContractType,
  CreateContractTypeRequest,
  UpdateContractTypeRequest,
  ContractTypesListResponse,
} from "../interfaces/contractType.interface";

export const getContractTypes =
  async (): Promise<ContractTypesListResponse> => {
    const res = await apiClient.get("/nomina/contract-types");
    return res.data.data;
  };

export const createContractType = async (
  data: CreateContractTypeRequest,
): Promise<ContractType> => {
  const res = await apiClient.post("/nomina/contract-types", data);
  return res.data.data;
};

export const updateContractType = async (
  id: string,
  data: UpdateContractTypeRequest,
): Promise<ContractType> => {
  const res = await apiClient.put(`/nomina/contract-types/${id}`, data);
  return res.data.data;
};

export const deleteContractType = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/contract-types/${id}`);
};
