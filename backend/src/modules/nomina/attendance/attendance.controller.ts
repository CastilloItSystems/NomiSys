import { Request, Response } from 'express'
import svc from './attendance.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createAttendance = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Asistencia registrada exitosamente', 201)
  } catch (error) {
    logger.error('Error creating attendance', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) return ApiResponse.conflict(res, error.message)
    return ApiResponse.serverError(res, 'Error al registrar asistencia')
  }
}

export const listAttendance = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { employeeId: g('employeeId'), status: g('status'), dateFrom: g('dateFrom'), dateTo: g('dateTo'), orderBy: g('orderBy') || 'date', order: g('order') || 'desc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { logger.error('Error listing attendance', { error }); return ApiResponse.serverError(res, 'Error al listar asistencia') }
}

export const getAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Registro de asistencia no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener registro') }
}

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Asistencia actualizada exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar asistencia')
  }
}

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Registro eliminado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al eliminar registro')
  }
}
