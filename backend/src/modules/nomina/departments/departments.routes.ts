import { Router, Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  updateDepartment,
} from './departments.controller.js'
import {
  createDepartmentSchema,
  listDepartmentsSchema,
  updateDepartmentSchema,
} from './departments.validation.js'

const router = Router()

// Middleware chain: authenticate -> extractCompany -> authorize -> validate -> handler
const authChain = [authenticate, extractCompany]

/**
 * POST /nomina/departments
 * Crear departamento
 */
router.post(
  '/',
  ...authChain,
  authorize('departments.create'),
  validateRequest(createDepartmentSchema, 'body'),
  asyncHandler(createDepartment)
)

/**
 * GET /nomina/departments
 * Listar departamentos con paginación y filtros
 */
router.get(
  '/',
  ...authChain,
  authorize('departments.view'),
  validateRequest(listDepartmentsSchema, 'query'),
  asyncHandler(listDepartments)
)

/**
 * GET /nomina/departments/:id
 * Obtener departamento por ID
 */
router.get(
  '/:id',
  ...authChain,
  authorize('departments.view'),
  asyncHandler(getDepartment)
)

/**
 * PUT /nomina/departments/:id
 * Actualizar departamento
 */
router.put(
  '/:id',
  ...authChain,
  authorize('departments.update'),
  validateRequest(updateDepartmentSchema, 'body'),
  asyncHandler(updateDepartment)
)

/**
 * DELETE /nomina/departments/:id
 * Eliminar (soft delete) departamento
 */
router.delete(
  '/:id',
  ...authChain,
  authorize('departments.delete'),
  asyncHandler(deleteDepartment)
)

export default router
