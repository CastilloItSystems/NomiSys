import Joi from 'joi'

const TYPES = [
  'Personal',
  'Médico',
  'Luto',
  'Maternidad',
  'Paternidad',
  'Judicial',
  'Otro',
]
const STATUSES = ['Pendiente', 'Aprobado', 'Rechazado', 'Cancelado']

export const createLeaveRequestSchema = Joi.object({
  employeeId: Joi.string().required(),
  type: Joi.string()
    .valid(...TYPES)
    .required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  days: Joi.number().integer().min(1).required(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const updateLeaveRequestSchema = Joi.object({
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  days: Joi.number().integer().min(1).optional(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const approveLeaveRequestSchema = Joi.object({
  status: Joi.string().valid('Aprobado', 'Rechazado', 'Cancelado').required(),
})

export const listLeaveRequestsSchema = Joi.object({
  employeeId: Joi.string().optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  orderBy: Joi.string()
    .valid('startDate', 'createdAt')
    .optional()
    .default('startDate'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
