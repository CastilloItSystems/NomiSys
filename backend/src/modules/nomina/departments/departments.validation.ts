import Joi from 'joi'

const departmentNameSchema = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .required()
  .messages({
    'string.empty': 'Nombre del departamento es requerido',
    'string.max': 'Nombre no puede exceder 100 caracteres',
  })

const departmentCodeSchema = Joi.string()
  .trim()
  .max(50)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Código no puede exceder 50 caracteres',
  })

const departmentDescriptionSchema = Joi.string()
  .trim()
  .max(1000)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Descripción no puede exceder 1000 caracteres',
  })

const isActiveSchema = Joi.boolean().optional().default(true)

// Validación para POST - Crear departamento
export const createDepartmentSchema = Joi.object({
  name: departmentNameSchema,
  code: departmentCodeSchema,
  description: departmentDescriptionSchema,
})

// Validación para PUT - Actualizar departamento
export const updateDepartmentSchema = Joi.object({
  name: departmentNameSchema.optional(),
  code: departmentCodeSchema,
  description: departmentDescriptionSchema,
  isActive: isActiveSchema,
})

// Validación para query parameters - Listar departamentos
export const listDepartmentsSchema = Joi.object({
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
