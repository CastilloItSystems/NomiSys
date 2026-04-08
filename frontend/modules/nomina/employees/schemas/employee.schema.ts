/**
 * Employee Module - Zod Schemas for validation
 */

import { z } from "zod";
import {
  venezuelaPhoneValidator,
  documentNumberValidator,
  ivssValidator,
  rifValidator,
  accountNumberValidator,
  salaryValidator,
  birthDateValidator,
  hireDateValidator,
  employeeCodeValidator,
  nameValidator,
  optionalEmailValidator,
  addressValidator,
  dependentsValidator,
} from "@/modules/nomina/employees/utils/venezuelaValidators";

// ─── Personal Data Section Schema ───
export const personalDataSchema = z.object({
  firstName: nameValidator,
  middleName: nameValidator.optional().or(z.literal("")),
  lastName: nameValidator,
  secondLastName: nameValidator.optional().or(z.literal("")),
  documentType: z.enum(["V", "E", "P"], {
    errorMap: () => ({ message: "Tipo de documento debe ser V, E o P" }),
  }),
  documentNumber: documentNumberValidator,
  birthDate: birthDateValidator,
  gender: z.enum(["M", "F", "O"], {
    errorMap: () => ({ message: "Género debe ser M, F u O" }),
  }),
  maritalStatus: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  phone: venezuelaPhoneValidator,
  email: optionalEmailValidator,
  address: addressValidator,
  birthPlace: z.string().optional().or(z.literal("")),
  dependents: dependentsValidator.default(0),
});

// ─── Laboral Data Section Schema ───
export const laboralDataSchema = z.object({
  employeeCode: employeeCodeValidator,
  hireDate: hireDateValidator,
  positionId: z.string().min(1, "Cargo es requerido"),
  departmentId: z.string().min(1, "Departamento es requerido"),
  costCenter: z.string().optional().or(z.literal("")),
  contractType: z.enum(["INDEFINITE", "FIXED_TERM", "PROJECT", "INTERNSHIP"], {
    errorMap: () => ({ message: "Tipo de contrato no válido" }),
  }),
  workShift: z.enum(["FULL_TIME", "PART_TIME", "MIXED", "NIGHT"], {
    errorMap: () => ({ message: "Tipo de jornada no válido" }),
  }),
  payFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"], {
    errorMap: () => ({ message: "Frecuencia de pago no válida" }),
  }),
  supervisorId: z.string().optional().or(z.literal("")),
});

// ─── Social Security & Fiscal Section Schema ───
export const socialSecuritySchema = z.object({
  ivssNumber: ivssValidator,
  rifNumber: rifValidator,
  isFaovEnrolled: z.boolean().default(false),
  isIncesEnrolled: z.boolean().default(false),
});

// ─── Banking Data Section Schema ───
export const bankingDataSchema = z.object({
  bankId: z.string().min(1, "Banco es requerido"),
  accountType: z.enum(["SAVINGS", "CHECKING"], {
    errorMap: () => ({ message: "Tipo de cuenta debe ser Ahorro o Corriente" }),
  }),
  accountNumber: accountNumberValidator,
});

// ─── Additional Data Section Schema ───
export const additionalDataSchema = z.object({
  emergencyContactName: z.string().max(100).optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  observations: z.string().max(500).optional().or(z.literal("")),
});

// ─── Salary Schema (for employment section) ───
export const salarySchema = z.object({
  salaryAmount: salaryValidator,
  currency: z.enum(["VES", "USD"], {
    errorMap: () => ({ message: "Moneda debe ser VES o USD" }),
  }),
});

// ─── Complete Create Employee Schema ───
export const createEmployeeSchema = z
  .object({
    // Personal section
    ...personalDataSchema.shape,
    // Laboral section
    ...laboralDataSchema.shape,
    // Salary (from laboral section)
    ...salarySchema.shape,
    // Social security section
    ...socialSecuritySchema.shape,
    // Banking section
    ...bankingDataSchema.shape,
    // Additional section
    ...additionalDataSchema.shape,
  })
  .strict();

// ─── Complete Update Employee Schema (most fields optional) ───
export const updateEmployeeSchema = z
  .object({
    id: z.string().min(1),
    firstName: nameValidator.optional(),
    middleName: nameValidator.optional().or(z.literal("")),
    lastName: nameValidator.optional(),
    secondLastName: nameValidator.optional().or(z.literal("")),
    documentType: z.enum(["V", "E", "P"]).optional(),
    documentNumber: documentNumberValidator.optional(),
    birthDate: birthDateValidator.optional(),
    gender: z.enum(["M", "F", "O"]).optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().optional(),
    phone: venezuelaPhoneValidator.optional(),
    email: optionalEmailValidator,
    address: addressValidator.optional(),
    birthPlace: z.string().optional().or(z.literal("")),
    dependents: dependentsValidator.optional(),
    hireDate: hireDateValidator.optional(),
    positionId: z.string().optional(),
    departmentId: z.string().optional(),
    costCenter: z.string().optional().or(z.literal("")),
    contractType: z
      .enum(["INDEFINITE", "FIXED_TERM", "PROJECT", "INTERNSHIP"])
      .optional(),
    workShift: z.enum(["FULL_TIME", "PART_TIME", "MIXED", "NIGHT"]).optional(),
    payFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
    supervisorId: z.string().optional().or(z.literal("")),
    salaryAmount: salaryValidator.optional(),
    currency: z.enum(["VES", "USD"]).optional(),
    ivssNumber: ivssValidator.optional(),
    rifNumber: rifValidator.optional(),
    isFaovEnrolled: z.boolean().optional(),
    isIncesEnrolled: z.boolean().optional(),
    bankId: z.string().optional(),
    accountType: z.enum(["SAVINGS", "CHECKING"]).optional(),
    accountNumber: accountNumberValidator.optional(),
    emergencyContactName: z.string().max(100).optional().or(z.literal("")),
    emergencyContactPhone: z.string().optional().or(z.literal("")),
    observations: z.string().max(500).optional().or(z.literal("")),
  })
  .strict();

// ─── Type exports ───
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
export type PersonalDataFormData = z.infer<typeof personalDataSchema>;
export type LaboralDataFormData = z.infer<typeof laboralDataSchema>;
export type SocialSecurityFormData = z.infer<typeof socialSecuritySchema>;
export type BankingDataFormData = z.infer<typeof bankingDataSchema>;
export type AdditionalDataFormData = z.infer<typeof additionalDataSchema>;
