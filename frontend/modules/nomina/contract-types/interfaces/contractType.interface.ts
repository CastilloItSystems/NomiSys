export interface ContractType {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateContractTypeRequest {
  name: string;
  description?: string;
}
export interface UpdateContractTypeRequest
  extends Partial<CreateContractTypeRequest> {
  isActive?: boolean;
}
export interface ContractTypesListResponse {
  total: number;
  contractTypes: ContractType[];
}
