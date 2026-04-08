import { Router } from 'express'
import {
  getMembershipsByEmpresa,
  getMembershipsByUser,
  createMembership,
  updateMembership,
  deleteMembership,
  getMembershipPermissions,
  setMembershipPermissions,
} from './memberships.controller.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'
import { extractCompany } from '../../shared/middleware/company.middleware.js'
import {
  authorize,
  authorizeRoles,
} from '../../shared/middleware/authorize.middleware.js'
import { authorizeGlobal } from '../../shared/middleware/authorizeGlobal.middleware.js'
import { PERMISSIONS } from '../../shared/constants/permissions.js'

const router = Router()

router.use(authenticate)

// memberships of the current company
router.get(
  '/',
  extractCompany,
  authorize(PERMISSIONS.USERS_VIEW),
  getMembershipsByEmpresa
)

router.post(
  '/',
  extractCompany,
  authorize(PERMISSIONS.USERS_UPDATE),
  createMembership
)

router.put(
  '/:id',
  extractCompany,
  authorize(PERMISSIONS.USERS_UPDATE),
  updateMembership
)

router.delete(
  '/:id',
  extractCompany,
  authorize(PERMISSIONS.USERS_DELETE),
  deleteMembership
)

// memberships of a global user
router.get('/user/:id', authorizeRoles('OWNER', 'ADMIN'), getMembershipsByUser)

// Per-membership permission overrides
router.get('/:id/permissions', authorizeGlobal(), getMembershipPermissions)
router.put('/:id/permissions', authorizeGlobal(), setMembershipPermissions)

export default router
