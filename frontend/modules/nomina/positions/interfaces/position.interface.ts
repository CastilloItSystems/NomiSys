/**
 * Position Module - Interfaces
 */

export interface Position {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  description?: string;
  level?: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePositionRequest {
  name: string;
  code?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface UpdatePositionRequest extends Partial<CreatePositionRequest> {
  id: string;
}

export interface PositionsListResponse {
  total: number;
  positions: Position[];
}
