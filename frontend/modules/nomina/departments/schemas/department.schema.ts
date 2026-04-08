/**
 * Department Module - Zod Schemas
 */

import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no debe exceder 100 caracteres"),
  code: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, "ID es requerido"),
});

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;
