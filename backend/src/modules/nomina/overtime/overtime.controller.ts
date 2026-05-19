import { Request, Response } from 'express'
import svc from './overtime.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createOvertime = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Horas extra registradas exitosamente', 201)
  } catch (error) { logger.error('Error creating overtime', { error }); return ApiResponse.serverError(res, 'Error al registrar horas extra') }
}

export const listOvertime = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), type: g('type'), status: g('status'), dateFrom: g('dateFrom'), dateTo: g('dateTo'), orderBy: g('orderBy') || 'date', order: g('order') || 'desc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { logger.error('Error listing overtime', { error }); return ApiResponse.serverError(res, 'Error al listar horas extra') }
}

export const getOvertime = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Registro de horas extra no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener registro') }
}

export const updateOvertime = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Horas extra actualizadas exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontradas')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar horas extra')
  }
}

export const approveOvertime = async (req: Request, res: Response) => {
  try {
    const result = await svc.approve(cid(req), req.params.id as string, req.body.status, req.user?.userId)
    return ApiResponse.success(res, result, `Horas extra ${req.body.status.toLowerCase()} exitosamente`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontradas')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al procesar aprobación')
  }
}

export const deleteOvertime = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Registro eliminado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontradas')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al eliminar registro')
  }
}
