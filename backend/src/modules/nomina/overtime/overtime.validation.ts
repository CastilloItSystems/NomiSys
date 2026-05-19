import Joi from 'joi'

const TYPES = ['Diurna', 'Nocturna', 'Feriada Diurna', 'Feriada Nocturna']

export const createOvertimeSchema = Joi.object({
  employeeId: Joi.string().required(),
  date: Joi.date().iso().required(),
  hours: Joi.number().positive().max(24).required(),
  type: Joi.string()
    .valid(...TYPES)
    .required(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const updateOvertimeSchema = Joi.object({
  date: Joi.date().iso().optional(),
  hours: Joi.number().positive().max(24).optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const approveOvertimeSchema = Joi.object({
  status: Joi.string().valid('Aprobado', 'Rechazado').required(),
})

export const listOvertimeSchema = Joi.object({
  employeeId: Joi.string().optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  status: Joi.string().valid('Pendiente', 'Aprobado', 'Rechazado').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  orderBy: Joi.string().valid('date', 'createdAt').optional().default('date'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
