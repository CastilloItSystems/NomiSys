import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createPayrollPeriod,
  listPayrollPeriods,
  getPayrollPeriod,
  updatePayrollPeriod,
  deletePayrollPeriod,
} from './payrollPeriods.controller.js'
import {
  createPayrollPeriodSchema,
  updatePayrollPeriodSchema,
  listPayrollPeriodsSchema,
} from './payrollPeriods.validation.js'

const router = Router()

const authChain = [authenticate, extractCompany]

/**
 * POST /nomina/payroll-periods
 */
router.post(
  '/',
  authChain,
  authorize('payrollPeriods.create'),
  validateRequest(createPayrollPeriodSchema, 'body'),
  asyncHandler(createPayrollPeriod)
)

/**
 * GET /nomina/payroll-periods
 */
router.get(
  '/',
  authChain,
  authorize('payrollPeriods.view'),
  validateRequest(listPayrollPeriodsSchema, 'query'),
  asyncHandler(listPayrollPeriods)
)

/**
 * GET /nomina/payroll-periods/:id
 */
router.get(
  '/:id',
  authChain,
  authorize('payrollPeriods.view'),
  asyncHandler(getPayrollPeriod)
)

/**
 * PUT /nomina/payroll-periods/:id
 */
router.put(
  '/:id',
  authChain,
  authorize('payrollPeriods.update'),
  validateRequest(updatePayrollPeriodSchema, 'body'),
  asyncHandler(updatePayrollPeriod)
)

/**
 * DELETE /nomina/payroll-periods/:id
 */
router.delete(
  '/:id',
  authChain,
  authorize('payrollPeriods.delete'),
  asyncHandler(deletePayrollPeriod)
)

export default router
