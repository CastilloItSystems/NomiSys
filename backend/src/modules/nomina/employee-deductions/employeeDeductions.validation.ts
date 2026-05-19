import Joi from 'joi'

export const createEmployeeDeductionSchema = Joi.object({
  employeeId: Joi.string().required(),
  conceptId: Joi.string().required(),
  calcType: Joi.string().valid('Porcentaje', 'Monto Fijo').required(),
  amount: Joi.number().min(0).optional(),
  percentage: Joi.number().min(0).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().optional(),
}).or('amount', 'percentage')

export const updateEmployeeDeductionSchema = Joi.object({
  calcType: Joi.string().valid('Porcentaje', 'Monto Fijo').optional(),
  amount: Joi.number().min(0).optional(),
  percentage: Joi.number().min(0).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().allow(null),
  isActive: Joi.boolean().optional(),
})

export const listEmployeeDeductionsSchema = Joi.object({
  employeeId: Joi.string().optional(),
  conceptId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  orderBy: Joi.string()
    .valid('startDate', 'createdAt')
    .optional()
    .default('startDate'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
