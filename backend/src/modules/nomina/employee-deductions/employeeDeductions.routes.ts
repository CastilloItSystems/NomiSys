import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createDeduction,
  listDeductions,
  getDeduction,
  updateDeduction,
  deleteDeduction,
} from './employeeDeductions.controller.js'
import {
  createEmployeeDeductionSchema,
  updateEmployeeDeductionSchema,
  listEmployeeDeductionsSchema,
} from './employeeDeductions.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('deductions.create'),
  validateRequest(createEmployeeDeductionSchema, 'body'),
  asyncHandler(createDeduction)
)
router.get(
  '/',
  auth,
  authorize('deductions.view'),
  validateRequest(listEmployeeDeductionsSchema, 'query'),
  asyncHandler(listDeductions)
)
router.get(
  '/:id',
  auth,
  authorize('deductions.view'),
  asyncHandler(getDeduction)
)
router.put(
  '/:id',
  auth,
  authorize('deductions.update'),
  validateRequest(updateEmployeeDeductionSchema, 'body'),
  asyncHandler(updateDeduction)
)
router.delete(
  '/:id',
  auth,
  authorize('deductions.delete'),
  asyncHandler(deleteDeduction)
)

export default router
