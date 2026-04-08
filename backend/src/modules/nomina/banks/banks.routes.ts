import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createBank,
  deleteBank,
  getBank,
  listBanks,
  updateBank,
} from './banks.controller.js'
import {
  createBankSchema,
  listBanksSchema,
  updateBankSchema,
} from './banks.validation.js'

const router = Router()

/**
 * POST /nomina/banks
 * Crear banco (solo admin - requiere permiso especial)
 */
router.post(
  '/',
  authenticate,
  authorize('banks.create'), // Note: Will be restricted to admin users
  validateRequest(createBankSchema, 'body'),
  asyncHandler(createBank)
)

/**
 * GET /nomina/banks
 * Listar bancos (accesible para usuarios autenticados con permiso banks.view)
 */
router.get(
  '/',
  authenticate,
  authorize('banks.view'),
  validateRequest(listBanksSchema, 'query'),
  asyncHandler(listBanks)
)

/**
 * GET /nomina/banks/:id
 * Obtener banco por ID (accesible para usuarios autenticados)
 */
router.get('/:id', authenticate, authorize('banks.view'), asyncHandler(getBank))

/**
 * PUT /nomina/banks/:id
 * Actualizar banco (solo admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('banks.update'),
  validateRequest(updateBankSchema, 'body'),
  asyncHandler(updateBank)
)

/**
 * DELETE /nomina/banks/:id
 * Eliminar (soft delete) banco (solo admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('banks.delete'),
  asyncHandler(deleteBank)
)

export default router
