import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createLoan,
  listLoans,
  getLoan,
  updateLoan,
  deleteLoan,
} from './loans.controller.js'
import {
  createLoanSchema,
  updateLoanSchema,
  listLoansSchema,
} from './loans.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('loans.create'),
  validateRequest(createLoanSchema, 'body'),
  asyncHandler(createLoan)
)
router.get(
  '/',
  auth,
  authorize('loans.view'),
  validateRequest(listLoansSchema, 'query'),
  asyncHandler(listLoans)
)
router.get('/:id', auth, authorize('loans.view'), asyncHandler(getLoan))
router.put(
  '/:id',
  auth,
  authorize('loans.update'),
  validateRequest(updateLoanSchema, 'body'),
  asyncHandler(updateLoan)
)
router.delete('/:id', auth, authorize('loans.delete'), asyncHandler(deleteLoan))

export default router
