import apiClient from "@/app/api/apiClient";

interface EmployeeConcept {
  id: string;
  companyId: string;
  employeeId: string;
  conceptId: string;
  manualAmount: number | null;
  disabled: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  concept?: {
    id: string;
    code: string;
    name: string;
    type: string;
    isTaxable: boolean;
  };
}

interface UpsertEmployeeConceptData {
  employeeId: string;
  conceptId: string;
  manualAmount?: number;
  disabled?: boolean;
  notes?: string;
}

interface BulkUpsertData {
  employeeId: string;
  concepts: Array<{
    conceptId: string;
    manualAmount?: number;
    disabled?: boolean;
    notes?: string;
  }>;
}

export const getEmployeeConcepts = async (
  employeeId: string
): Promise<EmployeeConcept[]> => {
  const res = await apiClient.get(
    `/nomina/employee-concepts/employee/${employeeId}`
  );
  return res.data.data.concepts || [];
};

export const upsertEmployeeConcept = async (
  data: UpsertEmployeeConceptData
): Promise<EmployeeConcept> => {
  const res = await apiClient.post(
    "/nomina/employee-concepts",
    data
  );
  return res.data.data;
};

export const upsertManyEmployeeConcepts = async (
  data: BulkUpsertData
): Promise<EmployeeConcept[]> => {
  const res = await apiClient.post(
    "/nomina/employee-concepts/bulk",
    data
  );
  return res.data.data.concepts || [];
};

export const deleteEmployeeConcept = async (id: string): Promise<void> => {
  await apiClient.delete(`/nomina/employee-concepts/${id}`);
};
