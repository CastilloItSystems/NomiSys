import { Request, Response } from 'express'
import svc from './vacationRequests.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createVacationRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Solicitud de vacaciones creada exitosamente', 201)
  } catch (error) { logger.error('Error creating vacation request', { error }); return ApiResponse.serverError(res, 'Error al crear solicitud') }
}

export const listVacationRequests = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), status: g('status'), dateFrom: g('dateFrom'), dateTo: g('dateTo'), orderBy: g('orderBy') || 'startDate', order: g('order') || 'desc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { logger.error('Error listing vacation requests', { error }); return ApiResponse.serverError(res, 'Error al listar solicitudes') }
}

export const getVacationRequest = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Solicitud de vacaciones no encontrada')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener solicitud') }
}

export const updateVacationRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Solicitud actualizada exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrada')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar solicitud')
  }
}

export const approveVacationRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.approve(cid(req), req.params.id as string, req.body.status, req.user?.userId), `Solicitud ${req.body.status.toLowerCase()} exitosamente`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrada')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al procesar solicitud')
  }
}

export const deleteVacationRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Solicitud cancelada exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrada')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al cancelar solicitud')
  }
}
