import { Router } from 'express'
import userRoutes from './users.routes.js'
import authRoutes from './auth.routes.js'
import companyRoutes from './companies.routes.js'
import companyRoleRoutes from './companyRoles.routes.js'
import membershipRoutes from './memberships.routes.js'

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
