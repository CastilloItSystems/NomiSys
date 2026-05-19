import { Request, Response } from 'express'
import svc from './contractTypes.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createContractType = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.create(cid(req), req.body, req.user?.userId), 'Tipo de contrato creado exitosamente', 201)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Ya existe')) return ApiResponse.conflict(res, error.message)
    return ApiResponse.serverError(res, 'Error al crear tipo de contrato')
  }
}

export const listContractTypes = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : undefined
    const filters: any = { isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined, orderBy: g('orderBy') || 'name', order: g('order') || 'asc' }
    const pagination = { limit: parseInt(g('limit') || '50', 10), offset: parseInt(g('offset') || '0', 10) }
    return ApiResponse.success(res, await svc.list(cid(req), filters, pagination))
  } catch (error) { return ApiResponse.serverError(res, 'Error al listar tipos de contrato') }
}

export const getContractType = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item) return ApiResponse.notFound(res, 'Tipo de contrato no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) { return ApiResponse.serverError(res, 'Error al obtener tipo de contrato') }
}

export const updateContractType = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.update(cid(req), req.params.id as string, req.body, req.user?.userId), 'Tipo de contrato actualizado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Ya existe')) return ApiResponse.conflict(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar tipo de contrato')
  }
}

export const deleteContractType = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.delete(cid(req), req.params.id as string, req.user?.userId), 'Tipo de contrato desactivado exitosamente')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al desactivar tipo de contrato')
  }
}
