import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  getPayrollConfig,
  upsertPayrollConfig,
} from './payrollConfig.controller.js'
import { upsertPayrollConfigSchema } from './payrollConfig.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.get(
  '/',
  auth,
  authorize('payrollConfig.view'),
  asyncHandler(getPayrollConfig)
)
router.put(
  '/',
  auth,
  authorize('payrollConfig.update'),
  validateRequest(upsertPayrollConfigSchema, 'body'),
  asyncHandler(upsertPayrollConfig)
)

export default router
