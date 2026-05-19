import apiClient from "@/app/api/apiClient";
import {
  LeaveRequest,
  CreateLeaveRequestRequest,
  LeaveRequestsListResponse,
} from "../interfaces/leaveRequest.interface";

export const getLeaveRequests = async (
  params?: Record<string, any>,
): Promise<LeaveRequestsListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/leave-requests${qs}`);
  return res.data.data;
};

export const createLeaveRequest = async (
  data: CreateLeaveRequestRequest,
): Promise<LeaveRequest> => {
  const res = await apiClient.post("/nomina/leave-requests", data);
  return res.data.data;
};

export const approveLeaveRequest = async (
  id: string,
  status: "Aprobado" | "Rechazado",
): Promise<LeaveRequest> => {
  const res = await apiClient.post(`/nomina/leave-requests/${id}/approve`, {
    status,
  });
  return res.data.data;
};

export const deleteLeaveRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/leave-requests/${id}`);
};
