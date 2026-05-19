import apiClient from "@/app/api/apiClient";
import {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceListResponse,
} from "../interfaces/attendance.interface";

export const getAttendance = async (
  params?: Record<string, any>,
): Promise<AttendanceListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/attendance${qs}`);
  return res.data.data;
};

export const createAttendance = async (
  data: CreateAttendanceRequest,
): Promise<Attendance> => {
  const res = await apiClient.post("/nomina/attendance", data);
  return res.data.data;
};

export const updateAttendance = async (
  id: string,
  data: UpdateAttendanceRequest,
): Promise<Attendance> => {
  const res = await apiClient.put(`/nomina/attendance/${id}`, data);
  return res.data.data;
};

export const deleteAttendance = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/attendance/${id}`);
};
