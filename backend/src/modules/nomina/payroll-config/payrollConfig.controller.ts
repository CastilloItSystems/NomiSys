import { Request, Response } from 'express'
import svc from './payrollConfig.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const getPayrollConfig = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.get(cid(req)))
  } catch (error) { logger.error('Error getting payroll config', { error }); return ApiResponse.serverError(res, 'Error al obtener configuración de nómina') }
}

export const upsertPayrollConfig = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(res, await svc.upsert(cid(req), req.body, req.user?.userId), 'Configuración de nómina actualizada exitosamente')
  } catch (error) { logger.error('Error upserting payroll config', { error }); return ApiResponse.serverError(res, 'Error al actualizar configuración de nómina') }
}
