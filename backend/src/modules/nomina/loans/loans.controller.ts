import { Request, Response } from 'express'
import svc from './loans.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createLoan = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Préstamo registrado exitosamente', 201)
  } catch (error) { logger.error('Error creating loan', { error }); return ApiResponse.serverError(res, 'Error al registrar préstamo') }
}

export const listLoans = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), status: g('status'), orderBy: g('orderBy') || 'startDate', order: g('order') || 'desc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { logger.error('Error listing loans', { error }); return ApiResponse.serverError(res, 'Error al listar préstamos') }
}

export const getLoan = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Préstamo no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener préstamo') }
}

export const updateLoan = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Préstamo actualizado exitosamente')
  } catch (error) {
    logger.error('Error updating loan', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar préstamo')
  }
}

export const deleteLoan = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Préstamo cancelado exitosamente')
  } catch (error) {
    logger.error('Error deleting loan', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al cancelar préstamo')
  }
}
