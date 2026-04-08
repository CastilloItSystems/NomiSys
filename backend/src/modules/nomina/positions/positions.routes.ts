import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createPosition,
  deletePosition,
  getPosition,
  listPositions,
  updatePosition,
} from './positions.controller.js'
import {
  createPositionSchema,
  listPositionsSchema,
  updatePositionSchema,
} from './positions.validation.js'

const router = Router()

// Middleware chain: authenticate -> extractCompany -> authorize -> validate -> handler
const authChain = [authenticate, extractCompany]

/**
 * POST /nomina/positions
 * Crear posición
 */
router.post(
  '/',
  ...authChain,
  authorize('positions.create'),
  validateRequest(createPositionSchema, 'body'),
  asyncHandler(createPosition)
)

/**
 * GET /nomina/positions
 * Listar posiciones con paginación y filtros
 */
router.get(
  '/',
  ...authChain,
  authorize('positions.view'),
  validateRequest(listPositionsSchema, 'query'),
  asyncHandler(listPositions)
)

/**
 * GET /nomina/positions/:id
 * Obtener posición por ID
 */
router.get(
  '/:id',
  ...authChain,
  authorize('positions.view'),
  asyncHandler(getPosition)
)

/**
 * PUT /nomina/positions/:id
 * Actualizar posición
 */
router.put(
  '/:id',
  ...authChain,
  authorize('positions.update'),
  validateRequest(updatePositionSchema, 'body'),
  asyncHandler(updatePosition)
)

/**
 * DELETE /nomina/positions/:id
 * Eliminar (soft delete) posición
 */
router.delete(
  '/:id',
  ...authChain,
  authorize('positions.delete'),
  asyncHandler(deletePosition)
)

export default router
