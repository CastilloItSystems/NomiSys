import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createAttendance,
  listAttendance,
  getAttendanceRecord,
  updateAttendance,
  deleteAttendance,
} from './attendance.controller.js'
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  listAttendanceSchema,
} from './attendance.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('attendance.create'),
  validateRequest(createAttendanceSchema, 'body'),
  asyncHandler(createAttendance)
)
router.get(
  '/',
  auth,
  authorize('attendance.view'),
  validateRequest(listAttendanceSchema, 'query'),
  asyncHandler(listAttendance)
)
router.get(
  '/:id',
  auth,
  authorize('attendance.view'),
  asyncHandler(getAttendanceRecord)
)
router.put(
  '/:id',
  auth,
  authorize('attendance.update'),
  validateRequest(updateAttendanceSchema, 'body'),
  asyncHandler(updateAttendance)
)
router.delete(
  '/:id',
  auth,
  authorize('attendance.delete'),
  asyncHandler(deleteAttendance)
)

export default router
