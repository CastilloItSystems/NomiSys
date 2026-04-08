import Joi from 'joi'
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  ListEmployeesFiltersInterface,
} from './employees.types.js'

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD

// ==================== CREATE EMPLOYEE SCHEMA ====================

export const createEmployeeSchema = Joi.object<CreateEmployeeDTO>({
  // Personal Information - REQUIRED
  firstName: Joi.string().trim().min(2).max(100).required(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  documentType: Joi.string().valid('V', 'E', 'P').required(),
  documentNumber: Joi.string().trim().min(6).max(20).required(),
  birthDate: Joi.string()
    .pattern(dateFormatRegex)
    .required()
    .messages({
      'string.pattern.base': 'birthDate debe tener formato YYYY-MM-DD',
    }),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  email: Joi.string().email().required(),
  address: Joi.string().trim().min(10).max(500).required(),

  // Labor Information - REQUIRED
  employeeCode: Joi.string().trim().min(3).max(50).required(),
  hireDate: Joi.string()
    .pattern(dateFormatRegex)
    .required()
    .messages({
      'string.pattern.base': 'hireDate debe tener formato YYYY-MM-DD',
    }),
  departmentId: Joi.string().trim().required(),
  positionId: Joi.string().trim().required(),
  contractType: Joi.string()
    .valid('Indefinido', 'Fijo', 'Temporal', 'Obra')
    .required(),
  workSchedule: Joi.string()
    .valid('Completo', 'Medio', 'Vespertino')
    .required(),

  // Salary Information - REQUIRED
  currentSalary: Joi.number().positive().required(),
  salaryType: Joi.string().valid('Mensual', 'Quincenal', 'Semanal').optional(),
  paymentFrequency: Joi.string()
    .valid('Mensual', 'Quincenal', 'Semanal')
    .optional(),

  // Organizational - OPTIONAL
  supervisorId: Joi.string().trim().optional().allow(null),

  // Venezuela-specific - OPTIONAL
  ivssNumber: Joi.string().trim().optional().allow(null),
  rifNumber: Joi.string().trim().optional().allow(null),
  faovRegistered: Joi.boolean().optional(),
  incesRegistered: Joi.boolean().optional(),
  familyCharges: Joi.number().integer().min(0).optional(),

  // Banking Information - REQUIRED
  bankId: Joi.string().trim().required(),
  accountType: Joi.string().valid('Corriente', 'Ahorro').required(),
  accountNumber: Joi.string().trim().min(8).max(30).required(),
}).unknown(false)

// ==================== UPDATE EMPLOYEE SCHEMA ====================

export const updateEmployeeSchema = Joi.object<UpdateEmployeeDTO>({
  // Personal Information - most fields optional on update
  firstName: Joi.string().trim().min(2).max(100).optional(),
  lastName: Joi.string().trim().min(2).max(100).optional(),
  birthDate: Joi.string()
    .pattern(dateFormatRegex)
    .optional()
    .messages({
      'string.pattern.base': 'birthDate debe tener formato YYYY-MM-DD',
    }),
  gender: Joi.string().valid('M', 'F', 'O').optional(),
  phone: Joi.string().trim().min(10).max(20).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().trim().min(10).max(500).optional(),

  // Labor Information - contractType and workSchedule optional, position/dept changes via separate endpoint
  contractType: Joi.string()
    .valid('Indefinido', 'Fijo', 'Temporal', 'Obra')
    .optional(),
  workSchedule: Joi.string()
    .valid('Completo', 'Medio', 'Vespertino')
    .optional(),
  supervisorId: Joi.string().trim().optional().allow(null),

  // Salary - optional, handles via SalaryHistory when changed
  currentSalary: Joi.number().positive().optional(),
  paymentFrequency: Joi.string()
    .valid('Mensual', 'Quincenal', 'Semanal')
    .optional(),

  // Venezuela-specific - all optional
  ivssNumber: Joi.string().trim().optional().allow(null),
  rifNumber: Joi.string().trim().optional().allow(null),
  faovRegistered: Joi.boolean().optional(),
  incesRegistered: Joi.boolean().optional(),
  familyCharges: Joi.number().integer().min(0).optional(),

  // Banking Information - optional
  bankId: Joi.string().trim().optional(),
  accountType: Joi.string().valid('Corriente', 'Ahorro').optional(),
  accountNumber: Joi.string().trim().min(8).max(30).optional(),

  // Control - optional
  status: Joi.string()
    .valid('Activo', 'Inactivo', 'Suspendido', 'Egresado')
    .optional(),
  isActive: Joi.boolean().optional(),
}).unknown(false)

// ==================== LIST/FILTER SCHEMA ====================

export const listEmployeesSchema = Joi.object<ListEmployeesFiltersInterface>({
  search: Joi.string().trim().optional(),
  departmentId: Joi.string().trim().optional(),
  positionId: Joi.string().trim().optional(),
  status: Joi.string()
    .valid('Activo', 'Inactivo', 'Suspendido', 'Egresado')
    .optional(),
  contractType: Joi.string().optional(),
  workSchedule: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).unknown(true)
