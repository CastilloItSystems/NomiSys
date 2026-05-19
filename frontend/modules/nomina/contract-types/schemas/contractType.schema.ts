import { z } from "zod";

export const createContractTypeSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(100),
  description: z.string().max(500).optional(),
});

export const updateContractTypeSchema = createContractTypeSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export type CreateContractTypeFormData = z.infer<
  typeof createContractTypeSchema
>;
