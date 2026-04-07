import { Router } from 'express'
import {
  getAllCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getDefaultCompany,
  getAuditLogsForCompany,
  seedDefaultsForCompany,
  uploadLogo,
} from '../controllers/companies.controller.js'
import { authorizeGlobal } from '../shared/middleware/authorizeGlobal.middleware.js'
import { optionalAuthenticate } from '../shared/middleware/authenticate.middleware.js'
import { FileUploadHelper } from '../shared/utils/fileUpload.js'

const router = Router()

router.get('/', authorizeGlobal(), getAllCompanies)
router.post('/', authorizeGlobal(), createCompany)
router.post(
  '/:id/logo',
  authorizeGlobal(),
  FileUploadHelper.createMemoryUploader('image'),
  uploadLogo
)
// optionalAuthenticate: allows unauthenticated access for public branding (login page),
// but attaches user context when a valid token is present.
router.get('/default', optionalAuthenticate, getDefaultCompany)
router.get('/:id', authorizeGlobal(), getCompanyById)
router.put('/:id', authorizeGlobal(), updateCompany)
router.delete('/:id', authorizeGlobal(), deleteCompany)
router.get('/:id/audit-logs', authorizeGlobal(), getAuditLogsForCompany)
router.post('/:id/seed-defaults', authorizeGlobal(), seedDefaultsForCompany)

export default router
