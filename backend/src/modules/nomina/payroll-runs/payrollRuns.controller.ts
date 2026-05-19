import { Request, Response } from 'express'
import svc from './payrollRuns.service.js'
import { ApiResponse } from '../../../shared/utils/apiResponse.js'
import { logger } from '../../../shared/utils/logger.js'

const cid = (req: Request) => req.companyId as string

export const createPayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.create(cid(req), req.body, req.user?.userId),
      'Cálculo de nómina creado exitosamente',
      201
    )
  } catch (error) {
    logger.error('Error creating payroll run', { error })
    if (error instanceof Error && error.message.includes('Ya existe'))
      return ApiResponse.conflict(res, error.message)
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al crear cálculo de nómina')
  }
}

export const listPayrollRuns = async (req: Request, res: Response) => {
  try {
    const g = (k: string) =>
      typeof req.query[k] === 'string'
        ? (req.query[k] as string).trim()
        : undefined
    const filters: any = {
      periodId: g('periodId'),
      status: g('status'),
      orderBy: g('orderBy') || 'createdAt',
      order: g('order') || 'desc',
    }
    const pagination = {
      limit: parseInt(g('limit') || '20', 10),
      offset: parseInt(g('offset') || '0', 10),
    }
    return ApiResponse.success(
      res,
      await svc.list(cid(req), filters, pagination)
    )
  } catch (error) {
    logger.error('Error listing payroll runs', { error })
    return ApiResponse.serverError(res, 'Error al listar cálculos de nómina')
  }
}

export const getPayrollRun = async (req: Request, res: Response) => {
  try {
    const item = await svc.getById(cid(req), req.params.id as string)
    if (!item)
      return ApiResponse.notFound(res, 'Cálculo de nómina no encontrado')
    return ApiResponse.success(res, item)
  } catch (error) {
    return ApiResponse.serverError(res, 'Error al obtener cálculo')
  }
}

export const getPayrollRunLines = async (req: Request, res: Response) => {
  try {
    const run = await svc.getById(cid(req), req.params.id as string)
    if (!run)
      return ApiResponse.notFound(res, 'Cálculo de nómina no encontrado')
    return ApiResponse.success(
      res,
      await svc.getLines(cid(req), req.params.id as string)
    )
  } catch (error) {
    return ApiResponse.serverError(res, 'Error al obtener líneas de nómina')
  }
}

export const updatePayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.update(
        cid(req),
        req.params.id as string,
        req.body,
        req.user?.userId
      ),
      'Cálculo actualizado exitosamente'
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('No se puede'))
      return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al actualizar cálculo')
  }
}

export const processPayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.process(cid(req), req.params.id as string, req.user?.userId),
      'Nómina procesada exitosamente'
    )
  } catch (error) {
    logger.error('Error processing payroll run', { error })
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    if (
      (error instanceof Error && error.message.includes('Solo se pueden')) ||
      (error instanceof Error && error.message.includes('No hay'))
    )
      return ApiResponse.badRequest(res, (error as Error).message)
    return ApiResponse.serverError(res, 'Error al procesar nómina')
  }
}

export const approvePayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.approve(cid(req), req.params.id as string, req.user?.userId),
      'Nómina aprobada exitosamente'
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden'))
      return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al aprobar nómina')
  }
}

export const payPayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.pay(cid(req), req.params.id as string, req.user?.userId),
      'Nómina marcada como pagada exitosamente'
    )
  } catch (error) {
    logger.error('Error paying payroll run', { error })
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('Solo se pueden'))
      return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al registrar pago de nómina')
  }
}

export const deletePayrollRun = async (req: Request, res: Response) => {
  try {
    return ApiResponse.success(
      res,
      await svc.delete(cid(req), req.params.id as string, req.user?.userId),
      'Cálculo de nómina anulado exitosamente'
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    if (error instanceof Error && error.message.includes('No se puede'))
      return ApiResponse.badRequest(res, error.message)
    return ApiResponse.serverError(res, 'Error al anular cálculo')
  }
}

export const getRunInputs = async (req: Request, res: Response) => {
  try {
    const inputs = await svc.getInputs(cid(req), req.params.id as string)
    return ApiResponse.success(res, inputs)
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al obtener variables de entrada')
  }
}

export const upsertRunInputs = async (req: Request, res: Response) => {
  try {
    // Body: { entries: [{ employeeId, vars: { horas_viaje: 12, ... } }] }
    // Or single: { employeeId, vars }
    const companyId = cid(req)
    const runId = req.params.id as string
    if (Array.isArray(req.body.entries)) {
      const result = await svc.upsertInputsBulk(
        companyId,
        runId,
        req.body.entries
      )
      return ApiResponse.success(
        res,
        result,
        `${result.length} registros guardados`
      )
    }
    const { employeeId, vars } = req.body
    if (!employeeId || !vars)
      return ApiResponse.badRequest(res, 'employeeId y vars son requeridos')
    const result = await svc.upsertInput(companyId, runId, employeeId, vars)
    return ApiResponse.success(res, result, 'Variables guardadas')
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado'))
      return ApiResponse.notFound(res, error.message)
    return ApiResponse.serverError(res, 'Error al guardar variables de entrada')
  }
}
