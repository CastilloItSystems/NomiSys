import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createPayrollRun,
  listPayrollRuns,
  getPayrollRun,
  getPayrollRunLines,
  updatePayrollRun,
  processPayrollRun,
  approvePayrollRun,
  payPayrollRun,
  deletePayrollRun,
  getRunInputs,
  upsertRunInputs,
} from './payrollRuns.controller.js'
import {
  createPayrollRunSchema,
  updatePayrollRunSchema,
  listPayrollRunsSchema,
} from './payrollRuns.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('payrollRuns.create'),
  validateRequest(createPayrollRunSchema, 'body'),
  asyncHandler(createPayrollRun)
)
router.get(
  '/',
  auth,
  authorize('payrollRuns.view'),
  validateRequest(listPayrollRunsSchema, 'query'),
  asyncHandler(listPayrollRuns)
)
router.get(
  '/:id',
  auth,
  authorize('payrollRuns.view'),
  asyncHandler(getPayrollRun)
)
router.get(
  '/:id/lines',
  auth,
  authorize('payrollRuns.view'),
  asyncHandler(getPayrollRunLines)
)
router.put(
  '/:id',
  auth,
  authorize('payrollRuns.update'),
  validateRequest(updatePayrollRunSchema, 'body'),
  asyncHandler(updatePayrollRun)
)
router.post(
  '/:id/process',
  auth,
  authorize('payrollRuns.process'),
  asyncHandler(processPayrollRun)
)
router.post(
  '/:id/approve',
  auth,
  authorize('payrollRuns.approve'),
  asyncHandler(approvePayrollRun)
)
router.post(
  '/:id/pay',
  auth,
  authorize('payrollRuns.pay'),
  asyncHandler(payPayrollRun)
)
router.delete(
  '/:id',
  auth,
  authorize('payrollRuns.delete'),
  asyncHandler(deletePayrollRun)
)
router.get(
  '/:id/inputs',
  auth,
  authorize('payrollRuns.view'),
  asyncHandler(getRunInputs)
)
router.put(
  '/:id/inputs',
  auth,
  authorize('payrollRuns.update'),
  asyncHandler(upsertRunInputs)
)

export default router
