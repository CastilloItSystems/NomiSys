import Joi from 'joi'

const positionNameSchema = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .required()
  .messages({
    'string.empty': 'Nombre de la posición es requerido',
    'string.max': 'Nombre no puede exceder 100 caracteres',
  })

const positionCodeSchema = Joi.string()
  .trim()
  .max(50)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Código no puede exceder 50 caracteres',
  })

const positionDescriptionSchema = Joi.string()
  .trim()
  .max(1000)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Descripción no puede exceder 1000 caracteres',
  })

const positionLevelSchema = Joi.string()
  .trim()
  .max(50)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Nivel no puede exceder 50 caracteres',
  })

const isActiveSchema = Joi.boolean().optional().default(true)

// Validación para POST - Crear posición
export const createPositionSchema = Joi.object({
  name: positionNameSchema,
  code: positionCodeSchema,
  description: positionDescriptionSchema,
  level: positionLevelSchema,
})

// Validación para PUT - Actualizar posición
export const updatePositionSchema = Joi.object({
  name: positionNameSchema.optional(),
  code: positionCodeSchema,
  description: positionDescriptionSchema,
  level: positionLevelSchema,
  isActive: isActiveSchema,
})

// Validación para query parameters - Listar posiciones
export const listPositionsSchema = Joi.object({
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
