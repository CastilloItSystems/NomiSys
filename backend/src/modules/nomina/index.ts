import { Router } from 'express'
import departmentsRoutes from './departments/departments.routes.js'
import positionsRoutes from './positions/positions.routes.js'
import banksRoutes from './banks/banks.routes.js'
import employeesRoutes from './employees/employees.routes.js'

const router = Router()

/**
 * Submódulo de Nómina
 * Rutas disponibles:
 * - /departments
 * - /positions
 * - /banks
 * - /employees
 */
router.use('/departments', departmentsRoutes)
router.use('/positions', positionsRoutes)
router.use('/banks', banksRoutes)
router.use('/employees', employeesRoutes)

export default router
