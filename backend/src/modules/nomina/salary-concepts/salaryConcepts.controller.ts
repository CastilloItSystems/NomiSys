import { Request, Response } from 'express'
import svc from './salaryConcepts.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'
import { validateFormula } from '../../../services/formulaEvaluator.service.js'

const cid = (req: Request) => req.companyId as string

export const createSalaryConcept = async (req: Request, res: Response) => {
  try {
    const result = await svc.createSalaryConcept(cid(req), req.body, req.user?.userId)
    return ApiResponse.success(res, result, 'Concepto salarial creado exitosamente', 201)
  } catch (error) {
    logger.error('Error creating salary concept', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) return ApiResponse.conflict(res, error.message)
    return ApiResponse.serverError(res, 'Error al crear concepto salarial')
  }
}

export const listSalaryConcepts = async (req: Request, res: Response) => {
  try {
    const g = (k: string) => typeof req.query[k] === 'string' ? (req.query[k] as string).trim().substring(0, 200) : undefined
    const filters: any = { search: g('search') || undefined, type: g('type') || undefined, isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined, orderBy: g('orderBy') || 'name', order: g('order') || 'asc' }
    const pagination = { limit: req.query.limit ? parseInt(g('limit') || '50', 10) : 50, offset: req.query.offset ? parseInt(g('offset') || '0', 10) : 0 }
    const result = await svc.listSalaryConcepts(cid(req), filters, pagination)
    return ApiResponse.success(res, result)
  } catch (error) {
    logger.error('Error listing salary concepts', { error })
    return ApiResponse.serverError(res, 'Error al listar conceptos salariales')
  }
}

export const getSalaryConcept = async (req: Request, res: Response) => {
  try {
    const concept = await svc.getSalaryConceptById(cid(req), req.params.id as string)
    if (!concept) return ApiResponse.notFound(res, 'Concepto salarial no encontrado')
    return ApiResponse.success(res, concept)
  } catch (error) {
    logger.error('Error getting salary concept', { error })
    return ApiResponse.serverError(res, 'Error al obtener concepto salarial')
  }
}

export const updateSalaryConcept = async (req: Request, res: Response) => {
  try {
    const result = await svc.updateSalaryConcept(cid(req), req.params.id as string, req.body, req.user?.userId)
    return ApiResponse.success(res, result, 'Concepto salarial actualizado exitosamente')
  } catch (error) {
    logger.error('Error updating salary concept', { error })
    if (error instanceof Error) {
      if (error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
      if (error.message.includes('Ya existe')) return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al actualizar concepto salarial')
  }
}

export const deleteSalaryConcept = async (req: Request, res: Response) => {
  try {
    const result = await svc.deleteSalaryConcept(cid(req), req.params.id as string, req.user?.userId)
    return ApiResponse.success(res, result, 'Concepto salarial eliminado exitosamente')
  } catch (error) {
    logger.error('Error deleting salary concept', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al eliminar concepto salarial')
  }
}

export const validateConceptFormula = async (req: Request, res: Response) => {
  const { formula } = req.body as { formula?: string }
  if (!formula || !formula.trim()) {
    return ApiResponse.badRequest(res, 'Fórmula no proporcionada')
  }
  const error = validateFormula(formula.trim())
  if (error) {
    return ApiResponse.success(res, { valid: false, error })
  }
  return ApiResponse.success(res, { valid: true })
}

export const getAvailableVariables = async (req: Request, res: Response) => {
  try {
    const variables = await svc.getAvailableVariables(cid(req))
    return ApiResponse.success(res, variables)
  } catch (error) {
    logger.error('Error getting available variables', { error })
    return ApiResponse.serverError(res, 'Error al obtener variables disponibles')
  }
}

export const seedCCPConcepts = async (req: Request, res: Response) => {
  try {
    await svc.seedCCPConcepts(cid(req), req.user?.userId)
    return ApiResponse.success(res, null, 'Conceptos CCP cargados exitosamente')
  } catch (error) {
    logger.error('Error seeding CCP concepts', { error })
    return ApiResponse.serverError(res, 'Error al cargar conceptos CCP')
  }
}
