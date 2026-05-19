import { Request, Response } from 'express'
import svc from './leaveRequests.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Permiso creado exitosamente', 201)
  } catch (error) { logger.error('Error creating leave request', { error }); return ApiResponse.serverError(res, 'Error al crear permiso') }
}

export const listLeaveRequests = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), type: g('type'), status: g('status'), dateFrom: g('dateFrom'), dateTo: g('dateTo'), orderBy: g('orderBy') || 'startDate', order: g('order') || 'desc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { logger.error('Error listing leave requests', { error }); return ApiResponse.serverError(res, 'Error al listar permisos') }
}

export const getLeaveRequest = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Permiso no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener permiso') }
}

export const updateLeaveRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Permiso actualizado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar permiso')
  }
}

export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.approve(cid(req), req.params.id as string, req.body.status, req.user?.userId), `Permiso ${req.body.status.toLowerCase()} exitosamente`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden')) return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al procesar permiso')
  }
}

export const deleteLeaveRequest = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Permiso cancelado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al cancelar permiso')
  }
}
