import { Router } from 'express'
import departmentsRoutes from './departments/departments.routes.js'
import positionsRoutes from './positions/positions.routes.js'
import banksRoutes from './banks/banks.routes.js'
import employeesRoutes from './employees/employees.routes.js'
import payrollPeriodsRoutes from './payroll-periods/payrollPeriods.routes.js'
import salaryConceptsRoutes from './salary-concepts/salaryConcepts.routes.js'
import employeeDeductionsRoutes from './employee-deductions/employeeDeductions.routes.js'
import employeeConceptsRoutes from './employee-concepts/employeeConcepts.routes.js'
import loansRoutes from './loans/loans.routes.js'
import attendanceRoutes from './attendance/attendance.routes.js'
import overtimeRoutes from './overtime/overtime.routes.js'
import vacationRequestsRoutes from './vacation-requests/vacationRequests.routes.js'
import leaveRequestsRoutes from './leave-requests/leaveRequests.routes.js'
import payrollRunsRoutes from './payroll-runs/payrollRuns.routes.js'
import contractTypesRoutes from './contract-types/contractTypes.routes.js'
import payrollConfigRoutes from './payroll-config/payrollConfig.routes.js'
import socialBenefitsRoutes from './social-benefits/socialBenefits.routes.js'

const router = Router()

router.use('/departments', departmentsRoutes)
router.use('/positions', positionsRoutes)
router.use('/banks', banksRoutes)
router.use('/employees', employeesRoutes)
router.use('/payroll-periods', payrollPeriodsRoutes)
router.use('/salary-concepts', salaryConceptsRoutes)
router.use('/employee-deductions', employeeDeductionsRoutes)
router.use('/employee-concepts', employeeConceptsRoutes)
router.use('/loans', loansRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/overtime', overtimeRoutes)
router.use('/vacation-requests', vacationRequestsRoutes)
router.use('/leave-requests', leaveRequestsRoutes)
router.use('/payroll-runs', payrollRunsRoutes)
router.use('/contract-types', contractTypesRoutes)
router.use('/payroll-config', payrollConfigRoutes)
router.use('/social-benefits', socialBenefitsRoutes)

export default router
