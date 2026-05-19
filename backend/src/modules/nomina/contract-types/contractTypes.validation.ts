import Joi from 'joi'

export const createContractTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional().allow(''),
})

export const updateContractTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
})

export const listContractTypesSchema = Joi.object({
  isActive: Joi.boolean().optional(),
  orderBy: Joi.string().valid('name', 'createdAt').optional().default('name'),
  order: Joi.string().valid('asc', 'desc').optional().default('asc'),
  limit: Joi.number().integer().min(1).max(200).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
})
