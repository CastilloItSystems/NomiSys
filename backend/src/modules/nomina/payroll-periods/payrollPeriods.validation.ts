import Joi from 'joi'

const FREQUENCIES = ['Semanal', 'Quincenal', 'Mensual']
const STATUSES = ['Borrador', 'Abierto', 'Cerrado', 'Pagado']

const nameSchema = Joi.string().trim().min(2).max(150).required().messages({
  'string.empty': 'Nombre del período es requerido',
  'string.min': 'Nombre debe tener al menos 2 caracteres',
  'string.max': 'Nombre no puede exceder 150 caracteres',
})

const frequencySchema = Joi.string()
  .valid(...FREQUENCIES)
  .required()
  .messages({
    'any.only': `Frecuencia debe ser una de: ${FREQUENCIES.join(', ')}`,
    'string.empty': 'Frecuencia es requerida',
  })

const dateSchema = Joi.date().iso().required().messages({
  'date.base': 'Debe ser una fecha válida',
  'any.required': 'Fecha es requerida',
})

// POST - Crear período
export const createPayrollPeriodSchema = Joi.object({
  name: nameSchema,
  frequency: frequencySchema,
  startDate: dateSchema,
  endDate: dateSchema,
  paymentDate: dateSchema,
})

// PUT - Actualizar período
export const updatePayrollPeriodSchema = Joi.object({
  name: nameSchema.optional(),
  frequency: frequencySchema.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  paymentDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  isActive: Joi.boolean().optional(),
})

// GET - Filtros de listado
export const listPayrollPeriodsSchema = Joi.object({
  search: Joi.string().trim().optional(),
  frequency: Joi.string()
    .valid(...FREQUENCIES)
    .optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  isActive: Joi.boolean().optional(),
  orderBy: Joi.string()
    .valid('name', 'startDate', 'paymentDate', 'createdAt')
    .optional()
    .default('startDate'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  offset: Joi.number().integer().min(0).optional().default(0),
})
