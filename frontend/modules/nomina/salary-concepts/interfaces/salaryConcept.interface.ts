export type ConceptType = "Ingreso" | "Deducción" | "Aporte Patronal";

export interface SalaryConcept {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: ConceptType;
  description: string | null;
  isTaxable: boolean;
  isActive: boolean;
  formula: string | null;
  executionOrder: number;
  inputVars: string[];
  contractTypeId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateSalaryConceptRequest {
  name: string;
  code: string;
  type: ConceptType;
  description?: string;
  isTaxable?: boolean;
  formula?: string;
  executionOrder?: number;
  inputVars?: string[];
  contractTypeId?: string | null;
}

export interface UpdateSalaryConceptRequest
  extends Partial<CreateSalaryConceptRequest> {
  isActive?: boolean;
}

export interface SalaryConceptsListResponse {
  total: number;
  salaryConcepts: SalaryConcept[];
  concepts?: SalaryConcept[]; // legacy alias
}
