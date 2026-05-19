import Joi from 'joi'

const STATUSES = ['Pendiente', 'Aprobado', 'Rechazado', 'Cancelado']

export const createVacationRequestSchema = Joi.object({
  employeeId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  days: Joi.number().integer().min(1).required(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const updateVacationRequestSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  days: Joi.number().integer().min(1).optional(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const approveVacationRequestSchema = Joi.object({
  status: Joi.string().valid('Aprobado', 'Rechazado', 'Cancelado').required(),
})

export const listVacationRequestsSchema = Joi.object({
  employeeId: Joi.string().optional(),
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
