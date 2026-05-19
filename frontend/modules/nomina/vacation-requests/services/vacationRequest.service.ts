import apiClient from "@/app/api/apiClient";
import {
  VacationRequest,
  CreateVacationRequestRequest,
  VacationRequestsListResponse,
} from "../interfaces/vacationRequest.interface";

export const getVacationRequests = async (
  params?: Record<string, any>,
): Promise<VacationRequestsListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/vacation-requests${qs}`);
  return res.data.data;
};

export const createVacationRequest = async (
  data: CreateVacationRequestRequest,
): Promise<VacationRequest> => {
  const res = await apiClient.post("/nomina/vacation-requests", data);
  return res.data.data;
};

export const approveVacationRequest = async (
  id: string,
  status: "Aprobado" | "Rechazado",
): Promise<VacationRequest> => {
  const res = await apiClient.post(`/nomina/vacation-requests/${id}/approve`, {
    status,
  });
  return res.data.data;
};

export const deleteVacationRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/vacation-requests/${id}`);
};
