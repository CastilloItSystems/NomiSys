export interface SocialBenefit {
  id: string;
  companyId: string;
  employeeId: string;
  period: string;
  year: number;
  quarter: number;
  salarioIntegral: number;
  diasGarantia: number;
  monto: number;
  montoAcumulado: number;
  status: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SocialBenefitsListResponse {
  total: number;
  limit: number;
  offset: number;
  count: number;
  benefits: SocialBenefit[];
}

export interface SocialBenefitsByEmployeeResponse {
  benefits: SocialBenefit[];
  totalAcumulado: number;
}

export interface AccrueQuarterRequest {
  year: number;
  quarter: number;
}

export interface AccrueQuarterResponse {
  processed: number;
  results: {
    employeeId: string;
    year: number;
    quarter: number;
    monto: number;
    status: "created" | "already_exists" | "error";
    error?: string;
  }[];
}
