import { Request, Response } from 'express'
import departmentsService from './departments.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

/**
 * POST /nomina/departments
 * Crear un nuevo departamento
 */
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const department = await departmentsService.createDepartment(
      companyId,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      department,
      'Departamento creado exitosamente',
      201
    )
  } catch (error) {
    logger.error('Error creating department', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al crear departamento')
  }
}

/**
 * GET /nomina/departments/:id
 * Obtener departamento por ID
 */
export const getDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const companyId = (req as any).companyId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const department = await departmentsService.getDepartmentById(
      companyId,
      id as string
    )
    if (!department) {
      return ApiResponse.notFound(res, 'Departamento no encontrado')
    }

    return ApiResponse.success(res, department)
  } catch (error) {
    logger.error('Error getting department', { error })
    return ApiResponse.serverError(res, 'Error al obtaining departamento')
  }
}

/**
 * GET /nomina/departments
 * Listar departamentos con filtros y paginación
 */
export const listDepartments = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const search = getLimitedString(req.query.search)
    const isActiveParam = getLimitedString(req.query.isActive)
    const orderByParam = getLimitedString(req.query.orderBy) || 'name'
    const orderParam = getLimitedString(req.query.order) || 'asc'

    const filters: any = {
      search: search || undefined,
      isActive:
        isActiveParam === 'true'
          ? true
          : isActiveParam === 'false'
            ? false
            : undefined,
      orderBy: orderByParam,
      order: orderParam,
    }

    const pagination = {
      limit: req.query.limit
        ? parseInt(getLimitedString(req.query.limit) || '20', 10)
        : 20,
      offset: req.query.offset
        ? parseInt(getLimitedString(req.query.offset) || '0', 10)
        : 0,
    }

    const result = await departmentsService.listDepartments(
      companyId,
      filters,
      pagination
    )
    return ApiResponse.success(res, result)
  } catch (error) {
    logger.error('Error listing departments', { error })
    return ApiResponse.serverError(res, 'Error al listar departamentos')
  }
}

/**
 * PUT /nomina/departments/:id
 * Actualizar departamento
 */
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const department = await departmentsService.updateDepartment(
      companyId,
      id as string,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      department,
      'Departamento actualizado exitosamente'
    )
  } catch (error) {
    logger.error('Error updating department', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return ApiResponse.notFound(res, error.message)
    }
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al actualizar departamento')
  }
}

/**
 * DELETE /nomina/departments/:id
 * Eliminar (soft delete) departamento
 */
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const department = await departmentsService.deleteDepartment(
      companyId,
      id as string,
      userId
    )
    return ApiResponse.success(
      res,
      department,
      'Departamento eliminado exitosamente'
    )
  } catch (error) {
    logger.error('Error deleting department', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return ApiResponse.notFound(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al eliminar departamento')
  }
}

// Utilidad para manejar query params
function getLimitedString(value: any): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}
