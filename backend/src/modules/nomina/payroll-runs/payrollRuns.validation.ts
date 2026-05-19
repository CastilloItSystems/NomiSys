import Joi from 'joi'

export const createPayrollRunSchema = Joi.object({
  periodId: Joi.string().required(),
  notes: Joi.string().trim().max(1000).optional().allow(''),
})

export const updatePayrollRunSchema = Joi.object({
  notes: Joi.string().trim().max(1000).optional().allow(''),
})

export const listPayrollRunsSchema = Joi.object({
  periodId: Joi.string().optional(),
  status: Joi.string()
    .valid(
      'Borrador',
      'Procesando',
      'Procesado',
      'Aprobado',
      'Pagado',
      'Anulado'
    )
    .optional(),
  orderBy: Joi.string()
    .valid('createdAt', 'processedAt')
    .optional()
    .default('createdAt'),
  order: Joi.string().valid('asc', 'desc').optional().default('desc'),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  offset: Joi.number().integer().min(0).optional().default(0),
})
