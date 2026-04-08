import { Request, Response } from 'express'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'
import employeesService from './employees.service.js'

function getLimitedString(value: any): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

/**
 * POST /nomina/employees
 * Create a new employee
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const employee = await employeesService.createEmployee(
      companyId,
      req.body,
      userId
    )

    return ApiResponse.created(res, employee, 'Empleado creado exitosamente')
  } catch (error: any) {
    logger.error('Error in createEmployee controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al crear empleado'
    )
  }
}

/**
 * GET /nomina/employees
 * List all employees with filtering and pagination
 */
export const listEmployees = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId

    const result = await employeesService.listEmployees(
      companyId,
      req.query as any
    )

    return ApiResponse.success(
      res,
      {
        data: result.data,
        pagination: result.pagination,
      },
      'Empleados obtenidos'
    )
  } catch (error: any) {
    logger.error('Error in listEmployees controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al listar empleados'
    )
  }
}

/**
 * GET /nomina/employees/:id
 * Get employee by ID
 */
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    const employee = await employeesService.getEmployeeById(id, companyId)

    if (!employee) {
      return ApiResponse.notFound(res, 'Empleado no encontrado')
    }

    return ApiResponse.success(res, employee)
  } catch (error: any) {
    logger.error('Error in getEmployeeById controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al obtener empleado'
    )
  }
}

/**
 * PUT /nomina/employees/:id
 * Update employee
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    const employee = await employeesService.updateEmployee(
      id,
      companyId,
      req.body,
      userId
    )

    return ApiResponse.success(
      res,
      employee,
      'Empleado actualizado exitosamente'
    )
  } catch (error: any) {
    logger.error('Error in updateEmployee controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al actualizar empleado'
    )
  }
}

/**
 * DELETE /nomina/employees/:id
 * Soft delete employee
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    await employeesService.deleteEmployee(id, companyId, userId)

    return ApiResponse.success(res, null, 'Empleado eliminado exitosamente')
  } catch (error: any) {
    logger.error('Error in deleteEmployee controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al eliminar empleado'
    )
  }
}

/**
 * POST /nomina/employees/:id/change-status
 * Change employee status
 */
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const { status, reason } = req.body
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    if (!status) {
      return ApiResponse.badRequest(res, 'Status es requerido')
    }

    if (!['Activo', 'Inactivo', 'Suspendido', 'Egresado'].includes(status)) {
      return ApiResponse.badRequest(res, 'Status inválido')
    }

    const employee = await employeesService.changeStatus(
      id,
      companyId,
      status,
      reason || '',
      userId
    )

    return ApiResponse.success(
      res,
      employee,
      'Estado del empleado actualizado exitosamente'
    )
  } catch (error: any) {
    logger.error('Error in changeStatus controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al cambiar estado del empleado'
    )
  }
}

/**
 * GET /nomina/employees/:id/salary-history
 * Get employee salary history
 */
export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    const history = await employeesService.getEmployeeSalaryHistory(
      id,
      companyId
    )

    return ApiResponse.success(res, history, 'Historial de salarios obtenido')
  } catch (error: any) {
    logger.error('Error in getSalaryHistory controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al obtener historial de salarios'
    )
  }
}

/**
 * GET /nomina/employees/:id/job-history
 * Get employee job info history
 */
export const getJobHistory = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    const history = await employeesService.getEmployeeJobHistory(id, companyId)

    return ApiResponse.success(res, history, 'Historial de trabajo obtenido')
  } catch (error: any) {
    logger.error('Error in getJobHistory controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al obtener historial de trabajo'
    )
  }
}

/**
 * GET /nomina/employees/:id/status-history
 * Get employee status history
 */
export const getStatusHistory = async (req: Request, res: Response) => {
  try {
    const id = getLimitedString(req.params.id)
    const companyId = (req as any).companyId

    if (!id) {
      return ApiResponse.badRequest(res, 'ID de empleado inválido')
    }

    const history = await employeesService.getEmployeeStatusHistory(
      id,
      companyId
    )

    return ApiResponse.success(res, history, 'Historial de estados obtenido')
  } catch (error: any) {
    logger.error('Error in getStatusHistory controller:', error)
    return ApiResponse.serverError(
      res,
      error.message || 'Error al obtener historial de estados'
    )
  }
}
