import { z } from "zod";

export const membershipSchema = z.object({
  empresaId: z.string().min(1, "La empresa es requerida"),
  roleId: z.string().min(1, "El rol es requerido"),
  status: z.enum(["active", "invited", "suspended"]),
});
