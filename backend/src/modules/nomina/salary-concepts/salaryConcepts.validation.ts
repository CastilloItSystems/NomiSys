import Joi from 'joi'

const TYPES = ['Ingreso', 'Deducción', 'Aporte Patronal']

export const createSalaryConceptSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Nombre es requerido',
  }),
  code: Joi.string().trim().min(1).max(20).required().messages({
    'string.empty': 'Código es requerido',
  }),
  type: Joi.string()
    .valid(...TYPES)
    .required()
    .messages({
      'any.only': `Tipo debe ser: ${TYPES.join(', ')}`,
    }),
  description: Joi.string().trim().max(500).optional().allow(''),
  isTaxable: Joi.boolean().optional().default(true),
  formula: Joi.string().trim().max(2000).optional().allow(''),
  executionOrder: Joi.number().integer().min(0).optional().default(0),
  inputVars: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional()
    .default([]),
  contractTypeId: Joi.string().trim().optional().allow(null, ''),
})

export const updateSalaryConceptSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  code: Joi.string().trim().min(1).max(20).optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  isTaxable: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  formula: Joi.string().trim().max(2000).optional().allow(''),
  executionOrder: Joi.number().integer().min(0).optional(),
  inputVars: Joi.array().items(Joi.string().trim().max(50)).optional(),
  contractTypeId: Joi.string().trim().optional().allow(null, ''),
})

export const listSalaryConceptsSchema = Joi.object({
  search: Joi.string().trim().optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  isActive: Joi.boolean().optional(),
  orderBy: Joi.string()
    .valid('name', 'code', 'type', 'createdAt')
    .optional()
    .default('name'),
  order: Joi.string().valid('asc', 'desc').optional().default('asc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
