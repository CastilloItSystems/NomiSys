import { Request, Response } from 'express'
import positionsService from './positions.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

/**
 * POST /nomina/positions
 * Crear una nueva posición
 */
export const createPosition = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId
    const userId = req.user?.userId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const position = await positionsService.createPosition(
      companyId,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      position,
      'Posición creada exitosamente',
      201
    )
  } catch (error) {
    logger.error('Error creating position', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al crear posición')
  }
}

/**
 * GET /nomina/positions/:id
 * Obtener posición por ID
 */
export const getPosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const companyId = (req as any).companyId

    if (!companyId) {
      return ApiResponse.badRequest(
        res,
        'Identificador de empresa no encontrado'
      )
    }

    const position = await positionsService.getPositionById(
      companyId,
      id as string
    )
    if (!position) {
      return ApiResponse.notFound(res, 'Posición no encontrada')
    }

    return ApiResponse.success(res, position)
  } catch (error) {
    logger.error('Error getting position', { error })
    return ApiResponse.serverError(res, 'Error al obtener posición')
  }
}

/**
 * GET /nomina/positions
 * Listar posiciones con filtros y paginación
 */
export const listPositions = async (req: Request, res: Response) => {
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

    const result = await positionsService.listPositions(
      companyId,
      filters,
      pagination
    )
    return ApiResponse.success(res, result)
  } catch (error) {
    logger.error('Error listing positions', { error })
    return ApiResponse.serverError(res, 'Error al listar posiciones')
  }
}

/**
 * PUT /nomina/positions/:id
 * Actualizar posición
 */
export const updatePosition = async (req: Request, res: Response) => {
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

    const position = await positionsService.updatePosition(
      companyId,
      id as string,
      req.body,
      userId
    )
    return ApiResponse.success(
      res,
      position,
      'Posición actualizada exitosamente'
    )
  } catch (error) {
    logger.error('Error updating position', { error })
    if (error instanceof Error && error.message.includes('no encontrada')) {
      return ApiResponse.notFound(res, error.message)
    }
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al actualizar posición')
  }
}

/**
 * DELETE /nomina/positions/:id
 * Eliminar (soft delete) posición
 */
export const deletePosition = async (req: Request, res: Response) => {
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

    const position = await positionsService.deletePosition(
      companyId,
      id as string,
      userId
    )
    return ApiResponse.success(res, position, 'Posición eliminada exitosamente')
  } catch (error) {
    logger.error('Error deleting position', { error })
    if (error instanceof Error && error.message.includes('no encontrada')) {
      return ApiResponse.notFound(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al eliminar posición')
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
