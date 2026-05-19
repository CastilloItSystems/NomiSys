import Joi from 'joi'

export const createLoanSchema = Joi.object({
  employeeId: Joi.string().required(),
  amount: Joi.number()
    .positive()
    .required()
    .messages({ 'number.positive': 'El monto debe ser positivo' }),
  installments: Joi.number().integer().min(1).required(),
  startDate: Joi.date().iso().required(),
  reason: Joi.string().trim().max(500).optional().allow(''),
})

export const updateLoanSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  installments: Joi.number().integer().min(1).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().allow(null),
  reason: Joi.string().trim().max(500).optional().allow(''),
  status: Joi.string().valid('Activo', 'Pagado', 'Cancelado').optional(),
})

export const listLoansSchema = Joi.object({
  employeeId: Joi.string().optional(),
  status: Joi.string().valid('Activo', 'Pagado', 'Cancelado').optional(),
  orderBy: Joi.string()
    .valid('startDate', 'createdAt', 'amount')
    .optional()
    .default('startDate'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
