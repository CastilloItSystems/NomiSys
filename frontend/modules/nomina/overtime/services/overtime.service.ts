import apiClient from "@/app/api/apiClient";
import {
  Overtime,
  CreateOvertimeRequest,
  UpdateOvertimeRequest,
  OvertimeListResponse,
} from "../interfaces/overtime.interface";

export const getOvertime = async (
  params?: Record<string, any>,
): Promise<OvertimeListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/overtime${qs}`);
  return res.data.data;
};

export const createOvertime = async (
  data: CreateOvertimeRequest,
): Promise<Overtime> => {
  const res = await apiClient.post("/nomina/overtime", data);
  return res.data.data;
};

export const updateOvertime = async (
  id: string,
  data: UpdateOvertimeRequest,
): Promise<Overtime> => {
  const res = await apiClient.put(`/nomina/overtime/${id}`, data);
  return res.data.data;
};

export const approveOvertime = async (
  id: string,
  status: "Aprobado" | "Rechazado",
): Promise<Overtime> => {
  const res = await apiClient.post(`/nomina/overtime/${id}/approve`, {
    status,
  });
  return res.data.data;
};

export const deleteOvertime = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/overtime/${id}`);
};
