import { z } from "zod";
import {
  optionalPasswordValidator,
  passwordValidator,
} from "@/modules/users/schemas/password.schema";

export const baseUserSchema = {
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
  phone: z.string().optional().or(z.literal("")),
  departments: z
    .array(z.string())
    .min(1, "Seleccione al menos un departamento"),
  access: z.enum(["full", "limited", "none"]),
  status: z.enum(["active", "pending", "suspended"]),
  isTechnician: z.boolean().optional(),
};

export const createUserSchema = z
  .object({
    ...baseUserSchema,
    password: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const updateUserSchema = z
  .object({
    ...baseUserSchema,
    password: optionalPasswordValidator,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  );

export const profileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z
    .string()
    .nonempty("El teléfono es obligatorio")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede exceder los 20 dígitos")
    .regex(/^[\d\+\-\s]+$/, {
      message: "El teléfono solo puede contener números, guiones y el signo +",
    }),
  idRefineria: z.string().array().optional(),
});
