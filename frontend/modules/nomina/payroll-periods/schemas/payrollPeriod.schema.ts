/**
 * PayrollPeriod Module - Zod Schemas
 */

import { z } from "zod";

const FREQUENCIES = ["Semanal", "Quincenal", "Mensual"] as const;

const basePayrollPeriodSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(150, "Nombre no debe exceder 150 caracteres"),
  frequency: z.enum(FREQUENCIES, {
    errorMap: () => ({ message: "Selecciona una frecuencia válida" }),
  }),
  startDate: z.string().min(1, "Fecha de inicio es requerida"),
  endDate: z.string().min(1, "Fecha de fin es requerida"),
  paymentDate: z.string().min(1, "Fecha de pago es requerida"),
});

export const createPayrollPeriodSchema = basePayrollPeriodSchema
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
    path: ["endDate"],
  })
  .refine((d) => new Date(d.paymentDate) >= new Date(d.startDate), {
    message: "La fecha de pago debe ser igual o posterior a la fecha de inicio",
    path: ["paymentDate"],
  });

export const updatePayrollPeriodSchema = basePayrollPeriodSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID es requerido"),
    status: z.enum(["Borrador", "Abierto", "Cerrado", "Pagado"]).optional(),
    isActive: z.boolean().optional(),
  });

export type CreatePayrollPeriodFormData = z.infer<
  typeof createPayrollPeriodSchema
>;
export type UpdatePayrollPeriodFormData = z.infer<
  typeof updatePayrollPeriodSchema
>;
