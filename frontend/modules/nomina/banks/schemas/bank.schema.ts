/**
 * Bank Module - Zod Schemas
 */

import { z } from "zod";

export const createBankSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no debe exceder 100 caracteres"),
  code: z
    .string()
    .min(2, "Código debe tener al menos 2 caracteres")
    .max(10, "Código no debe exceder 10 caracteres"),
  isActive: z.boolean().default(true),
});

export const updateBankSchema = createBankSchema.extend({
  id: z.string().min(1, "ID es requerido"),
});

export type CreateBankFormData = z.infer<typeof createBankSchema>;
export type UpdateBankFormData = z.infer<typeof updateBankSchema>;
