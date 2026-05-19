import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createLeaveRequest,
  listLeaveRequests,
  getLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  deleteLeaveRequest,
} from './leaveRequests.controller.js'
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  approveLeaveRequestSchema,
  listLeaveRequestsSchema,
} from './leaveRequests.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('leaves.create'),
  validateRequest(createLeaveRequestSchema, 'body'),
  asyncHandler(createLeaveRequest)
)
router.get(
  '/',
  auth,
  authorize('leaves.view'),
  validateRequest(listLeaveRequestsSchema, 'query'),
  asyncHandler(listLeaveRequests)
)
router.get(
  '/:id',
  auth,
  authorize('leaves.view'),
  asyncHandler(getLeaveRequest)
)
router.put(
  '/:id',
  auth,
  authorize('leaves.update'),
  validateRequest(updateLeaveRequestSchema, 'body'),
  asyncHandler(updateLeaveRequest)
)
router.post(
  '/:id/approve',
  auth,
  authorize('leaves.approve'),
  validateRequest(approveLeaveRequestSchema, 'body'),
  asyncHandler(approveLeaveRequest)
)
router.delete(
  '/:id',
  auth,
  authorize('leaves.delete'),
  asyncHandler(deleteLeaveRequest)
)

export default router
