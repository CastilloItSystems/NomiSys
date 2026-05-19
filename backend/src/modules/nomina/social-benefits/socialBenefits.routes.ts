import { Router } from 'express'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import controller from './socialBenefits.controller.js'

const router = Router()

router.use(authenticate, extractCompany)

// List all social benefits for the company
router.get(
  '/',
  authorize('socialBenefits.view'),
  controller.list.bind(controller)
)

// Get social benefits for a specific employee
router.get(
  '/employee/:employeeId',
  authorize('socialBenefits.view'),
  controller.getByEmployee.bind(controller)
)

// Manually create a social benefit record
router.post(
  '/',
  authorize('socialBenefits.create'),
  controller.create.bind(controller)
)

// Auto-accrue for a quarter (all active employees)
router.post(
  '/accrue-quarter',
  authorize('socialBenefits.create'),
  controller.accrueQuarter.bind(controller)
)

export default router
