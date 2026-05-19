import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createOvertime,
  listOvertime,
  getOvertime,
  updateOvertime,
  approveOvertime,
  deleteOvertime,
} from './overtime.controller.js'
import {
  createOvertimeSchema,
  updateOvertimeSchema,
  approveOvertimeSchema,
  listOvertimeSchema,
} from './overtime.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('overtime.create'),
  validateRequest(createOvertimeSchema, 'body'),
  asyncHandler(createOvertime)
)
router.get(
  '/',
  auth,
  authorize('overtime.view'),
  validateRequest(listOvertimeSchema, 'query'),
  asyncHandler(listOvertime)
)
router.get('/:id', auth, authorize('overtime.view'), asyncHandler(getOvertime))
router.put(
  '/:id',
  auth,
  authorize('overtime.update'),
  validateRequest(updateOvertimeSchema, 'body'),
  asyncHandler(updateOvertime)
)
router.post(
  '/:id/approve',
  auth,
  authorize('overtime.approve'),
  validateRequest(approveOvertimeSchema, 'body'),
  asyncHandler(approveOvertime)
)
router.delete(
  '/:id',
  auth,
  authorize('overtime.delete'),
  asyncHandler(deleteOvertime)
)

export default router
