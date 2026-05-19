import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createVacationRequest,
  listVacationRequests,
  getVacationRequest,
  updateVacationRequest,
  approveVacationRequest,
  deleteVacationRequest,
} from './vacationRequests.controller.js'
import {
  createVacationRequestSchema,
  updateVacationRequestSchema,
  approveVacationRequestSchema,
  listVacationRequestsSchema,
} from './vacationRequests.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('vacations.create'),
  validateRequest(createVacationRequestSchema, 'body'),
  asyncHandler(createVacationRequest)
)
router.get(
  '/',
  auth,
  authorize('vacations.view'),
  validateRequest(listVacationRequestsSchema, 'query'),
  asyncHandler(listVacationRequests)
)
router.get(
  '/:id',
  auth,
  authorize('vacations.view'),
  asyncHandler(getVacationRequest)
)
router.put(
  '/:id',
  auth,
  authorize('vacations.update'),
  validateRequest(updateVacationRequestSchema, 'body'),
  asyncHandler(updateVacationRequest)
)
router.post(
  '/:id/approve',
  auth,
  authorize('vacations.approve'),
  validateRequest(approveVacationRequestSchema, 'body'),
  asyncHandler(approveVacationRequest)
)
router.delete(
  '/:id',
  auth,
  authorize('vacations.delete'),
  asyncHandler(deleteVacationRequest)
)

export default router
