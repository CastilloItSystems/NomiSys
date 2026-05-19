import apiClient from "@/app/api/apiClient";
import {
  PayrollRun,
  PayrollRunLine,
  CreatePayrollRunRequest,
  PayrollRunsListResponse,
} from "../interfaces/payrollRun.interface";

export const getPayrollRuns = async (
  params?: Record<string, any>,
): Promise<PayrollRunsListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/payroll-runs${qs}`);
  return res.data.data;
};

export const getPayrollRun = async (id: string): Promise<PayrollRun> => {
  const res = await apiClient.get(`/nomina/payroll-runs/${id}`);
  return res.data.data;
};

export const getPayrollRunLines = async (
  id: string,
): Promise<PayrollRunLine[]> => {
  const res = await apiClient.get(`/nomina/payroll-runs/${id}/lines`);
  return res.data.data;
};

export const createPayrollRun = async (
  data: CreatePayrollRunRequest,
): Promise<PayrollRun> => {
  const res = await apiClient.post("/nomina/payroll-runs", data);
  return res.data.data;
};

export const processPayrollRun = async (id: string): Promise<PayrollRun> => {
  const res = await apiClient.post(`/nomina/payroll-runs/${id}/process`);
  return res.data.data;
};

export const approvePayrollRun = async (id: string): Promise<PayrollRun> => {
  const res = await apiClient.post(`/nomina/payroll-runs/${id}/approve`);
  return res.data.data;
};

export const payPayrollRun = async (id: string): Promise<PayrollRun> => {
  const res = await apiClient.post(`/nomina/payroll-runs/${id}/pay`);
  return res.data.data;
};

export const deletePayrollRun = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/payroll-runs/${id}`);
};

export const getRunInputs = async (
  id: string,
): Promise<
  { id: string; employeeId: string; vars: Record<string, number> }[]
> => {
  const res = await apiClient.get(`/nomina/payroll-runs/${id}/inputs`);
  return res.data.data;
};

export const upsertRunInputs = async (
  id: string,
  entries: { employeeId: string; vars: Record<string, number> }[],
): Promise<void> => {
  await apiClient.put(`/nomina/payroll-runs/${id}/inputs`, { entries });
};
