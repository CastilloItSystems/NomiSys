import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  changeStatus,
  getSalaryHistory,
  getJobHistory,
  getStatusHistory,
} from './employees.controller.js'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesSchema,
} from './employees.validation.js'

const router = Router()

// Middleware chain: authenticate -> extractCompany -> authorize -> validate -> handler
const authChain = [authenticate, extractCompany]

/**
 * POST /nomina/employees
 * Create a new employee
 */
router.post(
  '/',
  authChain,
  authorize('employees.create'),
  validateRequest(createEmployeeSchema, 'body'),
  asyncHandler(createEmployee)
)

/**
 * GET /nomina/employees
 * List all employees with filtering and pagination
 */
router.get(
  '/',
  authChain,
  authorize('employees.view'),
  validateRequest(listEmployeesSchema, 'query'),
  asyncHandler(listEmployees)
)

/**
 * GET /nomina/employees/:id
 * Get employee by ID
 */
router.get(
  '/:id',
  authChain,
  authorize('employees.view'),
  asyncHandler(getEmployeeById)
)

/**
 * PUT /nomina/employees/:id
 * Update employee
 */
router.put(
  '/:id',
  authChain,
  authorize('employees.update'),
  validateRequest(updateEmployeeSchema, 'body'),
  asyncHandler(updateEmployee)
)

/**
 * DELETE /nomina/employees/:id
 * Soft delete employee
 */
router.delete(
  '/:id',
  authChain,
  authorize('employees.delete'),
  asyncHandler(deleteEmployee)
)

/**
 * POST /nomina/employees/:id/change-status
 * Change employee status
 */
router.post(
  '/:id/change-status',
  authChain,
  authorize('employees.approve'),
  asyncHandler(changeStatus)
)

/**
 * GET /nomina/employees/:id/salary-history
 * Get employee salary history
 */
router.get(
  '/:id/salary-history',
  authChain,
  authorize('employees.view'),
  asyncHandler(getSalaryHistory)
)

/**
 * GET /nomina/employees/:id/job-history
 * Get employee job info history
 */
router.get(
  '/:id/job-history',
  authChain,
  authorize('employees.view'),
  asyncHandler(getJobHistory)
)

/**
 * GET /nomina/employees/:id/status-history
 * Get employee status history
 */
router.get(
  '/:id/status-history',
  authChain,
  authorize('employees.view'),
  asyncHandler(getStatusHistory)
)

export default router
