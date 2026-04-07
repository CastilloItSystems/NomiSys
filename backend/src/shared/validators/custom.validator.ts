// backend/src/shared/validators/custom.validator.ts
// Domain-specific Joi validators for Venezuelan business data.

import Joi from 'joi'
import { REGEX_PATTERNS } from '../../config/constants.js'

/** Venezuelan RIF — e.g. J-12345678-9 */
export const rifSchema = Joi.string().pattern(REGEX_PATTERNS.RIF).messages({
  'string.pattern.base': 'RIF debe tener formato J-12345678-9 (V/E/J/P/G)',
})

/** Venezuelan cédula — e.g. V-12345678 */
export const cedulaSchema = Joi.string()
  .pattern(REGEX_PATTERNS.CEDULA)
  .messages({
    'string.pattern.base': 'Cédula debe tener formato V-12345678 o E-12345678',
  })

/** Venezuelan mobile — 0414/0424/0412/0416/0426 + 7 digits */
export const telefonoVESchema = Joi.string()
  .pattern(REGEX_PATTERNS.PHONE_VE)
  .messages({
    'string.pattern.base':
      'Teléfono debe ser venezolano: 0414, 0424, 0412, 0416 o 0426 + 7 dígitos',
  })

/** Non-empty trimmed string with configurable max length */
export const nonEmptyString = (maxLength = 255) =>
  Joi.string().trim().min(1).max(maxLength)

/** Company creation/update schema */
export const companySchema = Joi.object({
  name: nonEmptyString(200).required(),
  address: nonEmptyString(500).optional(),
  phones: Joi.array().items(telefonoVESchema).optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .optional(),
  contact: nonEmptyString(200).optional(),
  isDefault: Joi.boolean().optional(),
})
