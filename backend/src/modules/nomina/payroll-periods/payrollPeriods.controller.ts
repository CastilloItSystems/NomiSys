import { Request, Response } from 'express'
import payrollPeriodsService from './payrollPeriods.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const getCompanyId = (req: Request): string => req.companyId as string

/**
 * POST /nomina/payroll-periods
 */
export const createPayrollPeriod = async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req)
    const userId = req.user?.userId

    const period = await payrollPeriodsService.createPayrollPeriod(
      companyId,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      period,
      'Período de nómina creado exitosamente',
      201
    )
  } catch (error) {
    logger.error('Error creating payroll period', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al crear período de nómina')
  }
}

/**
 * GET /nomina/payroll-periods
 */
export const listPayrollPeriods = async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req)

    const getString = (v: unknown) =>
      typeof v === 'string' ? v.trim().substring(0, 200) : undefined

    const filters: any = {
      search: getString(req.query.search) || undefined,
      frequency: getString(req.query.frequency) || undefined,
      status: getString(req.query.status) || undefined,
      isActive:
        req.query.isActive === 'true'
          ? true
          : req.query.isActive === 'false'
            ? false
            : undefined,
      orderBy: getString(req.query.orderBy) || 'startDate',
      order: getString(req.query.order) || 'desc',
    }

    const pagination = {
      limit: req.query.limit
        ? parseInt(getString(req.query.limit) || '20', 10)
        : 20,
      offset: req.query.offset
        ? parseInt(getString(req.query.offset) || '0', 10)
        : 0,
    }

    const result = await payrollPeriodsService.listPayrollPeriods(
      companyId,
      filters,
      pagination
    )
    return ApiResponse.success(res, result)
  } catch (error) {
    logger.error('Error listing payroll periods', { error })
    return ApiResponse.serverError(res, 'Error al listar períodos de nómina')
  }
}

/**
 * GET /nomina/payroll-periods/:id
 */
export const getPayrollPeriod = async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req)
    const { id } = req.params

    const period = await payrollPeriodsService.getPayrollPeriodById(
      companyId,
      id as string
    )
    if (!period) {
      return ApiResponse.notFound(res, 'Período de nómina no encontrado')
    }
    return ApiResponse.success(res, period)
  } catch (error) {
    logger.error('Error getting payroll period', { error })
    return ApiResponse.serverError(res, 'Error al obtener período de nómina')
  }
}

/**
 * PUT /nomina/payroll-periods/:id
 */
export const updatePayrollPeriod = async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req)
    const { id } = req.params
    const userId = req.user?.userId

    const period = await payrollPeriodsService.updatePayrollPeriod(
      companyId,
      id as string,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      period,
      'Período de nómina actualizado exitosamente'
    )
  } catch (error) {
    logger.error('Error updating payroll period', { error })
    if (error instanceof Error) {
      if (error.message.includes('no encontrado'))
        return ApiResponse.notFound(res, error.message)
      if (error.message.includes('Ya existe'))
        return ApiResponse.conflict(res, error.message)
      if (
        error.message.includes('No se puede editar') ||
        error.message.includes('estado')
      ) {
        return ApiResponse.badRequest(res, error.message)
      }
    }
    return ApiResponse.serverError(res, 'Error al actualizar período de nómina')
  }
}

/**
 * DELETE /nomina/payroll-periods/:id
 */
export const deletePayrollPeriod = async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req)
    const { id } = req.params
    const userId = req.user?.userId

    const period = await payrollPeriodsService.deletePayrollPeriod(
      companyId,
      id as string,
      userId
    )
    return ApiResponse.success(
      res,
      period,
      'Período de nómina eliminado exitosamente'
    )
  } catch (error) {
    logger.error('Error deleting payroll period', { error })
    if (error instanceof Error) {
      if (error.message.includes('no encontrado'))
        return ApiResponse.notFound(res, error.message)
      if (error.message.includes('Solo se pueden')) {
        return ApiResponse.badRequest(res, error.message)
      }
    }
    return ApiResponse.serverError(res, 'Error al eliminar período de nómina')
  }
}
