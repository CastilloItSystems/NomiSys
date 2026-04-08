import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import userRoutes from '../modules/users/users.routes.js'
import companyRoutes from '../modules/companies/companies.routes.js'
import companyRoleRoutes from '../modules/company-roles/companyRoles.routes.js'
import membershipRoutes from '../modules/memberships/memberships.routes.js'

// Middlewares
import { authenticate } from '../shared/middleware/authenticate.middleware.js'
import { extractCompany } from '../shared/middleware/company.middleware.js'

const router = Router()

// Public
router.use('/auth', authRoutes)

// Global SaaS users
router.use('/users', authenticate, userRoutes)

// Memberships per company
router.use('/memberships', authenticate, extractCompany, membershipRoutes)

// Dynamic roles per company
router.use('/companies/:id/roles', authenticate, companyRoleRoutes)

// Companies (global SaaS entity — does not require extractCompany)
router.use('/companies', authenticate, companyRoutes)

export default router
