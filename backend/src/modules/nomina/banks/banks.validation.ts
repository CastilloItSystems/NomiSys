import Joi from 'joi'

const bankNameSchema = Joi.string().trim().min(1).max(100).required().messages({
  'string.empty': 'Nombre del banco es requerido',
  'string.max': 'Nombre no puede exceder 100 caracteres',
})

const bankCodeSchema = Joi.string().trim().min(1).max(10).required().messages({
  'string.empty': 'Código SUDEBAN es requerido',
  'string.max': 'Código no puede exceder 10 caracteres',
})

const isActiveSchema = Joi.boolean().optional().default(true)

// Validación para POST - Crear banco
export const createBankSchema = Joi.object({
  name: bankNameSchema,
  code: bankCodeSchema,
})

// Validación para PUT - Actualizar banco
export const updateBankSchema = Joi.object({
  name: bankNameSchema.optional(),
  code: bankCodeSchema.optional(),
  isActive: isActiveSchema,
})

// Validación para query parameters - Listar bancos
export const listBanksSchema = Joi.object({
  search: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
  orderBy: Joi.string()
    .valid('name', 'code', 'createdAt')
    .optional()
    .default('name'),
  order: Joi.string().valid('asc', 'desc').optional().default('asc'),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  offset: Joi.number().integer().min(0).optional().default(0),
})
