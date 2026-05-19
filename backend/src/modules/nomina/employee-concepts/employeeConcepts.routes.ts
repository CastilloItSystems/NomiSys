import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import {
  getEmployeeConcepts,
  upsertEmployeeConcept,
  upsertManyEmployeeConcepts,
  deleteEmployeeConcept,
} from './employeeConcepts.controller.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.get(
  '/employee/:employeeId',
  auth,
  authorize('employees.view'),
  asyncHandler(getEmployeeConcepts)
)

router.post(
  '/',
  auth,
  authorize('employees.update'),
  asyncHandler(upsertEmployeeConcept)
)

router.post(
  '/bulk',
  auth,
  authorize('employees.update'),
  asyncHandler(upsertManyEmployeeConcepts)
)

router.delete(
  '/:id',
  auth,
  authorize('employees.update'),
  asyncHandler(deleteEmployeeConcept)
)

export default router
