// backend/src/routes/companyRoles.routes.ts
import { Router } from 'express'
import {
  getCompanyRoles,
  createCompanyRole,
  updateCompanyRole,
  deleteCompanyRole,
} from './companyRoles.controller.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'
import { extractCompanyFromParam } from '../../shared/middleware/company.middleware.js'
import { authorizeRoles } from '../../shared/middleware/authorize.middleware.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(extractCompanyFromParam)

// CRUD for dynamic roles per company
router.get('/', authorizeRoles('OWNER', 'ADMIN'), getCompanyRoles)
router.post('/', authorizeRoles('OWNER', 'ADMIN'), createCompanyRole)
router.put('/:roleId', authorizeRoles('OWNER', 'ADMIN'), updateCompanyRole)
router.delete('/:roleId', authorizeRoles('OWNER', 'ADMIN'), deleteCompanyRole)

export default router
