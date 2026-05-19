import { z } from "zod";

export const createSalaryConceptSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  code: z.string().min(1, "Código es requerido").max(20),
  type: z.enum(["Ingreso", "Deducción", "Aporte Patronal"], {
    required_error: "Tipo es requerido",
  }),
  description: z.string().max(500).optional(),
  isTaxable: z.boolean().default(false),
  formula: z.string().max(2000).optional().or(z.literal("")),
  executionOrder: z.number().int().min(0).optional(),
  inputVars: z.array(z.string()).optional(),
  contractTypeId: z.string().optional().nullable(),
});

export const updateSalaryConceptSchema = createSalaryConceptSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type CreateSalaryConceptFormData = z.infer<
  typeof createSalaryConceptSchema
>;
export type UpdateSalaryConceptFormData = z.infer<
  typeof updateSalaryConceptSchema
>;
