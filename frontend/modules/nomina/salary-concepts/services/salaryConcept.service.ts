import apiClient from "@/app/api/apiClient";
import {
  SalaryConcept,
  CreateSalaryConceptRequest,
  UpdateSalaryConceptRequest,
  SalaryConceptsListResponse,
} from "../interfaces/salaryConcept.interface";

export const getSalaryConcepts = async (
  params?: Record<string, any>,
): Promise<SalaryConceptsListResponse> => {
  const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
  const res = await apiClient.get(`/nomina/salary-concepts${qs}`);
  return res.data.data;
};

export const getSalaryConcept = async (id: string): Promise<SalaryConcept> => {
  const res = await apiClient.get(`/nomina/salary-concepts/${id}`);
  return res.data.data;
};

export const createSalaryConcept = async (
  data: CreateSalaryConceptRequest,
): Promise<SalaryConcept> => {
  const res = await apiClient.post("/nomina/salary-concepts", data);
  return res.data.data;
};

export const updateSalaryConcept = async (
  id: string,
  data: UpdateSalaryConceptRequest,
): Promise<SalaryConcept> => {
  const res = await apiClient.put(`/nomina/salary-concepts/${id}`, data);
  return res.data.data;
};

export const deleteSalaryConcept = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/salary-concepts/${id}`);
};

export const validateConceptFormula = async (
  formula: string,
): Promise<{ valid: boolean; error?: string }> => {
  const res = await apiClient.post("/nomina/salary-concepts/validate-formula", {
    formula,
  });
  return res.data.data;
};

export interface VariableInfo {
  name: string;
  description: string;
  example: number;
}

export interface AvailableVariables {
  systemVars: VariableInfo[];
  attendanceVars: VariableInfo[];
  conceptCodes: string[];
  inputVars: string[];
}

export const getAvailableVariables = async (): Promise<AvailableVariables> => {
  const res = await apiClient.get("/nomina/salary-concepts/variables/available");
  return res.data.data;
};

export const seedCCPConcepts = async (): Promise<void> => {
  await apiClient.post("/nomina/salary-concepts/seed-ccp");
};
