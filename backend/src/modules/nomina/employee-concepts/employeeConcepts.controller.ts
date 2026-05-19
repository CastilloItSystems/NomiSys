import { Request, Response } from 'express'
import svc from './employeeConcepts.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: any) => String(req.companyId)

export const getEmployeeConcepts = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.employeeId as string
    if (!employeeId) return ApiResponse.badRequest(res, 'employeeId is required')
    const concepts = await svc.getForEmployee(cid(req), employeeId)
    return ApiResponse.success(res, { concepts })
  } catch (error) {
    logger.error('Error getting employee concepts', { error })
    return ApiResponse.serverError(res, 'Error al obtener conceptos del empleado')
  }
}

export const upsertEmployeeConcept = async (req: Request, res: Response) => {
  try {
    const data = req.body
    const result = await svc.upsert(cid(req), data, req.user?.userId)
    return ApiResponse.success(res, result, 'Concepto actualizado exitosamente')
  } catch (error) {
    logger.error('Error upserting employee concept', { error })
    if (error instanceof Error) {
      if (error.message.includes('not found')) return ApiResponse.notFound(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al guardar concepto')
  }
}

export const upsertManyEmployeeConcepts = async (req: Request, res: Response) => {
  try {
    const body = req.body as any
    const employeeId = body.employeeId as string
    const concepts = body.concepts as Array<any>
    if (!employeeId || !Array.isArray(concepts)) {
      return ApiResponse.badRequest(res, 'employeeId and concepts array are required')
    }
    const results = await svc.upsertMany(cid(req), employeeId, concepts, req.user?.userId)
    return ApiResponse.success(res, { concepts: results }, `${results.length} conceptos actualizados`)
  } catch (error) {
    logger.error('Error upserting many employee concepts', { error })
    return ApiResponse.serverError(res, 'Error al guardar conceptos')
  }
}

export const deleteEmployeeConcept = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await svc.delete(cid(req), id, req.user?.userId)
    return ApiResponse.success(res, result, 'Concepto eliminado exitosamente')
  } catch (error) {
    logger.error('Error deleting employee concept', { error })
    if (error instanceof Error && error.message.includes('not found')) {
      return ApiResponse.notFound(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al eliminar concepto')
  }
}
