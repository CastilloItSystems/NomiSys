import Joi from 'joi'

export const upsertPayrollConfigSchema = Joi.object({
  salarioMinimo: Joi.number().min(0).optional(),
  salarioMinimoBs: Joi.number().min(0).optional(),
  tasaCambio: Joi.number().positive().optional(),
  ivssRate: Joi.number().min(0).max(1).optional(),
  faovRate: Joi.number().min(0).max(1).optional(),
  incesRate: Joi.number().min(0).max(1).optional(),
  ivssMaxSalarios: Joi.number().integer().min(1).optional(),
})
