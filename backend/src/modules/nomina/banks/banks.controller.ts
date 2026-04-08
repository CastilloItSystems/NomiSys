import { Request, Response } from 'express'
import banksService from './banks.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

/**
 * POST /nomina/banks
 * Crear un nuevo banco (solo admin)
 */
export const createBank = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    const bank = await banksService.createBank(req.body, userId)
    return ApiResponse.success(res, bank, 'Banco creado exitosamente', 201)
  } catch (error) {
    logger.error('Error creating bank', { error })
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al crear banco')
  }
}

/**
 * GET /nomina/banks/:id
 * Obtener banco por ID
 */
export const getBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const bank = await banksService.getBankById(id as string)
    if (!bank) {
      return ApiResponse.notFound(res, 'Banco no encontrado')
    }

    return ApiResponse.success(res, bank)
  } catch (error) {
    logger.error('Error getting bank', { error })
    return ApiResponse.serverError(res, 'Error al obtener banco')
  }
}

/**
 * GET /nomina/banks
 * Listar bancos con filtros y paginación (visible para todos)
 */
export const listBanks = async (req: Request, res: Response) => {
  try {
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

    const result = await banksService.listBanks(filters, pagination)
    return ApiResponse.success(res, result)
  } catch (error) {
    logger.error('Error listing banks', { error })
    return ApiResponse.serverError(res, 'Error al listar bancos')
  }
}

/**
 * PUT /nomina/banks/:id
 * Actualizar banco (solo admin)
 */
export const updateBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const bank = await banksService.updateBank(id as string, req.body, userId)
    return ApiResponse.success(res, bank, 'Banco actualizado exitosamente')
  } catch (error) {
    logger.error('Error updating bank', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return ApiResponse.notFound(res, error.message)
    }
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return ApiResponse.conflict(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al actualizar banco')
  }
}

/**
 * DELETE /nomina/banks/:id
 * Eliminar (soft delete) banco (solo admin)
 */
export const deleteBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const bank = await banksService.deleteBank(id as string, userId)
    return ApiResponse.success(res, bank, 'Banco eliminado exitosamente')
  } catch (error) {
    logger.error('Error deleting bank', { error })
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return ApiResponse.notFound(res, error.message)
    }
    return ApiResponse.serverError(res, 'Error al eliminar banco')
  }
}

// Utilidad para manejar query params que pueden ser string | string[] | undefined
function getLimitedString(value: any): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}
