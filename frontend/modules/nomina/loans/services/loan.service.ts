import apiClient from "@/app/api/apiClient";
import {
  Loan,
  CreateLoanRequest,
  UpdateLoanRequest,
  LoansListResponse,
} from "../interfaces/loan.interface";

export const getLoans = async (
  params?: Record<string, any>,
): Promise<LoansListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/loans${qs}`);
  return res.data.data;
};

export const createLoan = async (data: CreateLoanRequest): Promise<Loan> => {
  const res = await apiClient.post("/nomina/loans", data);
  return res.data.data;
};

export const updateLoan = async (
  id: string,
  data: UpdateLoanRequest,
): Promise<Loan> => {
  const res = await apiClient.put(`/nomina/loans/${id}`, data);
  return res.data.data;
};

export const deleteLoan = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/loans/${id}`);
};
