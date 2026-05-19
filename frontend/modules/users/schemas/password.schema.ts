import { z } from "zod";

export const passwordValidator = z
  .string()
  .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  .refine(
    (val) => {
      let conditionsMet = 0;
      if (/[A-Z]/.test(val)) conditionsMet++;
      if (/[a-z]/.test(val)) conditionsMet++;
      if (/[0-9]/.test(val)) conditionsMet++;
      if (/[^A-Za-z0-9]/.test(val)) conditionsMet++;
      return conditionsMet >= 2;
    },
    {
      message:
        "Debe combinar al menos 2 tipos: mayúsculas, minúsculas, números o símbolos",
    },
  );

export const optionalPasswordValidator = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val))
  .refine((val) => val === undefined || val.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      let conditionsMet = 0;
      if (/[A-Z]/.test(val)) conditionsMet++;
      if (/[a-z]/.test(val)) conditionsMet++;
      if (/[0-9]/.test(val)) conditionsMet++;
      if (/[^A-Za-z0-9]/.test(val)) conditionsMet++;
      return conditionsMet >= 2;
    },
    {
      message:
        "Debe combinar al menos 2 tipos: mayúsculas, minúsculas, números o símbolos",
    },
  );

export const userChangePasswordSchema = z
  .object({
    newPassword: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
