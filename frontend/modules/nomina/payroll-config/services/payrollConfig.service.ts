import apiClient from "@/app/api/apiClient";

export interface PayrollConfig {
  companyId: string;
  salarioMinimo: number;
  salarioMinimoBs: number;
  tasaCambio: number;
  ivssRate: number;
  faovRate: number;
  incesRate: number;
  ivssMaxSalarios: number;
  // Bono de Alimentación
  bonoAlimentacion: number;
  bonoAlimentacionAplica: boolean;
  // Utilidades
  utilidadesDias: number;
  // ISLR
  islrAplica: boolean;
  islrUMT: number;
  // Prestaciones Sociales
  prestacionesDiasGarantia: number;
}

export const getPayrollConfig = async (): Promise<PayrollConfig> => {
  const res = await apiClient.get("/nomina/payroll-config");
  return res.data.data;
};

export const updatePayrollConfig = async (
  data: Partial<PayrollConfig>,
): Promise<PayrollConfig> => {
  const res = await apiClient.put("/nomina/payroll-config", data);
  return res.data.data;
};
