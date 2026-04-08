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
  birthDate: Joi.string().pattern(dateFormatRegex).required().messages({
    'string.pattern.base': 'birthDate must have format YYYY-MM-DD',
  }),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  email: Joi.string().email().required(),
  address: Joi.string().trim().min(10).max(500).required(),

  // Labor Information - REQUIRED (English only)
  employeeCode: Joi.string().trim().min(3).max(50).required(),
  hireDate: Joi.string().pattern(dateFormatRegex).required().messages({
    'string.pattern.base': 'hireDate must have format YYYY-MM-DD',
  }),
  departmentId: Joi.string().trim().required(),
  positionId: Joi.string().trim().required(),
  contractType: Joi.string()
    .valid('INDEFINITE', 'FIXED_TERM', 'TEMPORARY', 'PROJECT')
    .required(),
  workSchedule: Joi.string()
    .valid('FULL_TIME', 'PART_TIME', 'EVENING')
    .optional(),
  // Also accept workShift as alias for workSchedule
  workShift: Joi.string().valid('FULL_TIME', 'PART_TIME', 'EVENING').optional(),

  // Salary Information - REQUIRED
  currentSalary: Joi.number().positive().optional(),
  salaryAmount: Joi.number().positive().optional(),
  paymentFrequency: Joi.string()
    .valid('MONTHLY', 'BIWEEKLY', 'WEEKLY')
    .optional(),
  // Also accept payFrequency as alias
  payFrequency: Joi.string().valid('MONTHLY', 'BIWEEKLY', 'WEEKLY').optional(),
  salaryType: Joi.string().optional(),

  // Organizational - OPTIONAL
  supervisorId: Joi.string().trim().optional().allow(null),

  // Venezuela-specific - OPTIONAL
  ivssNumber: Joi.string().trim().optional().allow(null),
  rifNumber: Joi.string().trim().optional().allow(null),
  faovRegistered: Joi.boolean().optional(),
  isFaovEnrolled: Joi.boolean().optional(),
  incesRegistered: Joi.boolean().optional(),
  isIncesEnrolled: Joi.boolean().optional(),
  familyCharges: Joi.number().integer().min(0).optional(),
  dependents: Joi.number().integer().min(0).optional(),

  // Banking Information - REQUIRED
  bankId: Joi.string().trim().required(),
  accountType: Joi.string().valid('CHECKING', 'SAVINGS').required(),
  accountNumber: Joi.string().trim().min(8).max(30).required(),

  // Extra fields - ignored
  middleName: Joi.string().trim().optional(),
  secondLastName: Joi.string().trim().optional(),
  maritalStatus: Joi.string().optional(),
  nationality: Joi.string().optional(),
  birthPlace: Joi.string().optional(),
  costCenter: Joi.string().optional(),
  currency: Joi.string().optional(),
  emergencyContactName: Joi.string().optional(),
  emergencyContactPhone: Joi.string().optional(),
  observations: Joi.string().optional(),
})
  .unknown(false)
  .external(async (value: any) => {
    // Validate that at least one salary field is present
    if (!value.currentSalary && !value.salaryAmount) {
      throw new Error('currentSalary or salaryAmount is required')
    }
    // // Validate that workSchedule is present (either field name works)
    // if (!value.workSchedule && !value.workShift) {
    //   throw new Error('workSchedule or workShift is required')
    // }
  })

// ==================== UPDATE EMPLOYEE SCHEMA ====================

export const updateEmployeeSchema = Joi.object<UpdateEmployeeDTO>({
  // Personal Information - optional
  firstName: Joi.string().trim().min(2).max(100).optional(),
  lastName: Joi.string().trim().min(2).max(100).optional(),
  birthDate: Joi.string().pattern(dateFormatRegex).optional().messages({
    'string.pattern.base': 'birthDate must have format YYYY-MM-DD',
  }),
  gender: Joi.string().valid('M', 'F', 'O').optional(),
  phone: Joi.string().trim().min(10).max(20).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().trim().min(10).max(500).optional(),

  // Labor Information - English only, optional
  contractType: Joi.string()
    .valid('INDEFINITE', 'FIXED_TERM', 'TEMPORARY', 'PROJECT')
    .optional(),
  workSchedule: Joi.string()
    .valid('FULL_TIME', 'PART_TIME', 'EVENING')
    .optional(),
  workShift: Joi.string().valid('FULL_TIME', 'PART_TIME', 'EVENING').optional(),
  supervisorId: Joi.string().trim().optional().allow(null),

  // Salary - optional, English only
  currentSalary: Joi.number().positive().optional(),
  salaryAmount: Joi.number().positive().optional(),
  paymentFrequency: Joi.string()
    .valid('MONTHLY', 'BIWEEKLY', 'WEEKLY')
    .optional(),
  payFrequency: Joi.string().valid('MONTHLY', 'BIWEEKLY', 'WEEKLY').optional(),

  // Venezuela-specific - all optional
  ivssNumber: Joi.string().trim().optional().allow(null),
  rifNumber: Joi.string().trim().optional().allow(null),
  faovRegistered: Joi.boolean().optional(),
  isFaovEnrolled: Joi.boolean().optional(),
  incesRegistered: Joi.boolean().optional(),
  isIncesEnrolled: Joi.boolean().optional(),
  familyCharges: Joi.number().integer().min(0).optional(),
  dependents: Joi.number().integer().min(0).optional(),

  // Banking Information - optional, English values only
  bankId: Joi.string().trim().optional(),
  accountType: Joi.string().valid('CHECKING', 'SAVINGS').optional(),
  accountNumber: Joi.string().trim().min(8).max(30).optional(),

  // Control - optional, English values only
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED')
    .optional(),
  isActive: Joi.boolean().optional(),
}).unknown(true)

// ==================== LIST/FILTER SCHEMA ====================

export const listEmployeesSchema = Joi.object<ListEmployeesFiltersInterface>({
  search: Joi.string().trim().optional(),
  departmentId: Joi.string().trim().optional(),
  positionId: Joi.string().trim().optional(),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED')
    .optional(),
  contractType: Joi.string().optional(),
  workSchedule: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).unknown(true)
