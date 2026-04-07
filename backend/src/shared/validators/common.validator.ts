// backend/src/shared/validators/common.validator.ts
// Reusable Joi schemas for request validation.

import Joi from 'joi'

export const idSchema = Joi.string().min(1).required()

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  orderBy: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
})

export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .max(254)

export const passwordSchema = Joi.string().min(8).max(128)

export const correoSchema = emailSchema.required()

export const loginSchema = Joi.object({
  correo: correoSchema,
  password: passwordSchema.required(),
})

export const registerSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required(),
  correo: correoSchema,
  password: passwordSchema.required(),
  telefono: Joi.string().trim().max(20).optional(),
  departamento: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim()), Joi.string().trim())
    .optional(),
  acceso: Joi.string().valid('limitado', 'completo', 'ninguno').optional(),
})
