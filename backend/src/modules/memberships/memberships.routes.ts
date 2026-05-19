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
import {
  authorize,
  authorizeRoles,
} from '../../shared/middleware/authorize.middleware.js'
import { PERMISSIONS } from '../../shared/constants/permissions.js'

const router = Router()

// memberships of the current company
router.get(
  '/',
  authorize(PERMISSIONS.USERS_VIEW),
  getMembershipsByEmpresa
)

router.post(
  '/',
  authorize(PERMISSIONS.USERS_UPDATE),
  createMembership
)

router.put(
  '/:id',
  authorize(PERMISSIONS.USERS_UPDATE),
  updateMembership
)

router.delete(
  '/:id',
  authorize(PERMISSIONS.USERS_DELETE),
  deleteMembership
)

// memberships of a global user
router.get('/user/:id', authorizeRoles('OWNER', 'ADMIN'), getMembershipsByUser)

// Per-membership permission overrides
router.get(
  '/:id/permissions',
  authorizeRoles('OWNER', 'ADMIN'),
  getMembershipPermissions
)
router.put(
  '/:id/permissions',
  authorizeRoles('OWNER', 'ADMIN'),
  setMembershipPermissions
)

export default router
