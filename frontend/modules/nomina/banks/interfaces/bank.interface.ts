/**
 * Bank Module - Interfaces
 */

export interface Bank {
  id: string;
  name: string;
  code: string; // SUDEBAN code
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateBankRequest {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateBankRequest extends Partial<CreateBankRequest> {
  id: string;
}

export interface BanksListResponse {
  total: number;
  banks: Bank[];
}
