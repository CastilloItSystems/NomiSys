/**
 * Venezuela-specific Validators
 * Custom validation patterns for Venezuelan data formats
 */

import { z } from "zod";

/**
 * Venezuelan phone validator
 * Accepts:
 * - +58 followed by 10 digits (international format)
 * - 04XX followed by 8 digits (local format)
 */
export const venezuelaPhoneValidator = z
  .string()
  .min(1, "Teléfono es requerido")
  .refine((phone) => {
    const cleaned = phone.replace(/\D/g, "");
    // Must be 11-12 digits total (+58 or 04)
    if (cleaned.length < 11 || cleaned.length > 12) return false;
    // Check if starts with 58 (international) or 04 (local)
    return cleaned.startsWith("58") || cleaned.startsWith("04");
  }, "Teléfono debe ser formato +58XXXXXXXXXX o 04XXXXXXXX");

/**
 * Venezuelan document number validator
 * CPP, DPP, Passport numbers: 6-10 digits
 */
export const documentNumberValidator = z
  .string()
  .min(1, "Número de documento es requerido")
  .refine(
    (doc) => /^[0-9]{6,10}$/.test(doc.trim()),
    "Documento debe tener 6-10 dígitos",
  );

/**
 * IVSS number validator (Seguro Social Obligatorio)
 * Format: 10-12 numeric digits
 */
export const ivssValidator = z
  .string()
  .optional()
  .refine((ivss) => {
    if (!ivss || ivss.trim() === "") return true; // Optional
    return /^[0-9]{10,12}$/.test(ivss.trim());
  }, "IVSS debe tener 10-12 dígitos");

/**
 * RIF validator (Registro de Información Fiscal)
 * Format: J/V/E/G - XXXXXXXX - X
 * Example: J-12345678-9
 */
export const rifValidator = z
  .string()
  .optional()
  .refine((rif) => {
    if (!rif || rif.trim() === "") return true; // Optional
    const rifPattern = /^[JVEGP]-\d{7,8}-\d{1}$/;
    return rifPattern.test(rif.trim().toUpperCase());
  }, "RIF debe tener formato: J/V/E/G-XXXXXXXX-X");

/**
 * Bank account number validator (Venezuela standard: 20 digits)
 * Format: Exactly 20 numeric digits
 */
export const accountNumberValidator = z
  .string()
  .min(1, "Número de cuenta es requerido")
  .refine(
    (account) => /^[0-9]{20}$/.test(account.replace(/\s/g, "")),
    "Número de cuenta debe tener exactamente 20 dígitos",
  );

/**
 * Salary validator
 * Must be greater than zero, decimal format
 */
export const salaryValidator = z
  .number()
  .positive("Salario debe ser mayor a 0")
  .refine((salary) => salary > 0, "Salario debe ser un monto válido");

/**
 * Birth date validator
 * Employee must be at least 14 years old (legal minimum for Venezuela)
 */
export const birthDateValidator = z
  .string()
  .min(1, "Fecha de nacimiento es requerida")
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 14;
  }, "Empleado debe tener al menos 14 años de edad");

/**
 * Hire date validator
 * Cannot be in the future (default validation, configs may override)
 */
export const hireDateValidator = z
  .string()
  .min(1, "Fecha de ingreso es requerida")
  .refine((date) => {
    const hireDate = new Date(date);
    const today = new Date();
    return hireDate <= today;
  }, "Fecha de ingreso no puede ser futura");

/**
 * Employee code validator
 * Alphanumeric, 3-20 characters
 */
export const employeeCodeValidator = z
  .string()
  .min(3, "Código de empleado debe tener al menos 3 caracteres")
  .max(20, "Código de empleado no debe exceder 20 caracteres")
  .refine(
    (code) => /^[a-zA-Z0-9-_]+$/.test(code),
    "Código debe contener solo letras, números, guiones y guiones bajos",
  );

/**
 * Name validator
 * Min 2 characters, allows letters, spaces, and hyphens
 */
export const nameValidator = z
  .string()
  .min(2, "Nombre debe tener al menos 2 caracteres")
  .max(100, "Nombre no debe exceder 100 caracteres")
  .refine(
    (name) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(name.trim()),
    "Nombre solo puede contener letras, espacios y guiones",
  );

/**
 * Email validator (optional but specific format)
 */
export const optionalEmailValidator = z
  .string()
  .optional()
  .refine(
    (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    "Email debe tener un formato válido",
  );

/**
 * Address validator
 */
export const addressValidator = z
  .string()
  .min(5, "Dirección debe tener al menos 5 caracteres")
  .max(200, "Dirección no debe exceder 200 caracteres");

/**
 * Dependents (cargas familiares) validator
 * Cannot be negative
 */
export const dependentsValidator = z
  .number()
  .int("Cargas familiares debe ser un número entero")
  .nonnegative("Cargas familiares no puede ser negativo")
  .max(20, "Cargas familiares no puede exceder 20");
