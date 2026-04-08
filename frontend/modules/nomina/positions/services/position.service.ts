/**
 * Position Service
 * API service layer for position operations
 */

import apiClient from "@/app/api/apiClient";
import {
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionsListResponse,
} from "@/modules/nomina/positions/interfaces/position.interface";

/**
 * Fetch all positions
 */
export const getPositions = async (
  search?: string,
): Promise<PositionsListResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const response = await apiClient.get(
    `/nomina/positions${params.toString() ? `?${params.toString()}` : ""}`,
  );
  return response.data.data;
};

/**
 * Fetch single position
 */
export const getPosition = async (id: string): Promise<Position> => {
  const response = await apiClient.get(`/nomina/positions/${id}`);
  return response.data.data;
};

/**
 * Create new position
 */
export const createPosition = async (
  data: CreatePositionRequest,
): Promise<Position> => {
  const response = await apiClient.post("/nomina/positions", data);
  return response.data.data;
};

/**
 * Update existing position
 */
export const updatePosition = async (
  id: string,
  data: UpdatePositionRequest,
): Promise<Position> => {
  const response = await apiClient.put(`/nomina/positions/${id}`, data);
  return response.data.data;
};

/**
 * Delete position
 */
export const deletePosition = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/positions/${id}`);
};
