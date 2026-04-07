import { Router, Request, Response, NextFunction } from 'express'
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
} from '../controllers/users.controller.js'
import { authenticate } from '../shared/middleware/authenticate.middleware.js'
import { authorize } from '../shared/middleware/authorize.middleware.js'
import { PERMISSIONS } from '../shared/constants/permissions.js'
import { extractCompany } from '../shared/middleware/company.middleware.js'
import { FileUploadHelper } from '../shared/utils/fileUpload.js'

const router = Router()

router.use(authenticate)

// Helper to allow access to own profile or verify permission in the active company
const checkSelfOrAuthorize = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.userId === req.params.id) {
      return next() // own profile, let it through
    }
    // Another user's profile: verify permission in the active company
    extractCompany(req, res, (err?: any) => {
      if (err) return next(err)
      authorize(permission)(req, res, next)
    })
  }
}

router.get('/', getAllUsers)
router.post(
  '/',
  extractCompany,
  authorize(PERMISSIONS.USERS_CREATE),
  createUser
)

// router.get(
//   '/:id/audit-logs',
//   extractCompany,
//   authorize(PERMISSIONS.USERS_VIEW),
//   getAuditLogsForUser
// )

router.get('/:id', checkSelfOrAuthorize(PERMISSIONS.USERS_VIEW), getUserById)
router.put('/:id', checkSelfOrAuthorize(PERMISSIONS.USERS_UPDATE), updateUser)
router.post(
  '/:id/profile-picture',
  checkSelfOrAuthorize(PERMISSIONS.USERS_UPDATE),
  FileUploadHelper.createMemoryUploader('image'),
  uploadProfilePicture
)
router.delete(
  '/:id',
  extractCompany,
  authorize(PERMISSIONS.USERS_DELETE),
  deleteUser
)

export default router
