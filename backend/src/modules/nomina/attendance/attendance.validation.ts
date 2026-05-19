import Joi from 'joi'

const STATUSES = [
  'Presente',
  'Ausente',
  'Tardanza',
  'Permiso',
  'Vacaciones',
  'Feriado',
]

export const createAttendanceSchema = Joi.object({
  employeeId: Joi.string().required(),
  date: Joi.date().iso().required(),
  status: Joi.string()
    .valid(...STATUSES)
    .required(),
  checkIn: Joi.date().iso().optional(),
  checkOut: Joi.date().iso().optional(),
  notes: Joi.string().trim().max(500).optional().allow(''),
})

export const updateAttendanceSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  checkIn: Joi.date().iso().optional().allow(null),
  checkOut: Joi.date().iso().optional().allow(null),
  notes: Joi.string().trim().max(500).optional().allow(''),
})

export const listAttendanceSchema = Joi.object({
  employeeId: Joi.string().optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  orderBy: Joi.string().valid('date', 'createdAt').optional().default('date'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(500).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
