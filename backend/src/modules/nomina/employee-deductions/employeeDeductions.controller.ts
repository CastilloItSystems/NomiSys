import { Request, Response } from 'express'
import svc from './employeeDeductions.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createDeduction = async (req: Request, res: Response) => {
  try {
    const result = await svc.create(cid(req), req.body, req.user?.userId)
    return ApiResponse.success(res, result, 'Deducción creada exitosamente', 201)
  } catch (error) {
    logger.error('Error creating deduction', { error })
    return ApiResponse.serverError(res, 'Error al crear deducción')
  }
}

export const listDeductions = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), conceptId: g('conceptId'), isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined, orderBy: g('orderBy') || 'startDate', order: g('order') || 'desc' }
    const pagination = { limit: req.query.limit ? parseInt(g('limit') || '50', 10) : 50, offset: req.query.offset ? parseInt(g('offset') || '0', 10) : 0 }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) {
    logger.error('Error listing deductions', { error })
    return ApiResponse.serverError(res, 'Error al listar deducciones')
  }
}

export const getDeduction = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Deducción no encontrada')
    return ApiResponse.success(res, item)
  } catch (error) {
    return ApiResponse.serverError(res, 'Error al obtener deducción')
  }
}

export const updateDeduction = async (req: Request, res: Response) => {
  try {
    const result = await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId)
    return ApiResponse.success(res, result, 'Deducción actualizada exitosamente')
  } catch (error) {
    logger.error('Error updating deduction', { error })
    if (error instanceof Error && error.message.includes('no encontrada')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar deducción')
  }
}

export const deleteDeduction = async (req: Request, res: Response) => {
  try {
    const result = await svc.delete(cid(req), req.params.id as string, req.user?.userId)
    return ApiResponse.success(res, result, 'Deducción eliminada exitosamente')
  } catch (error) {
    logger.error('Error deleting deduction', { error })
    if (error instanceof Error && error.message.includes('no encontrada')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al eliminar deducción')
  }
}
