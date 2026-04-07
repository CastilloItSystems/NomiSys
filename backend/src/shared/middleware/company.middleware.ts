import { Request, Response, NextFunction } from 'express'
import prisma from '../../services/prisma.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { createTenantPrisma } from '../../services/prisma-tenant.service.js'
import { logger } from '../utils/logger.js'

export const extractCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated')
    }

    const rawCompanyId = req.headers['x-company-id']
    const companyId =
      typeof rawCompanyId === 'string'
        ? rawCompanyId.trim()
        : Array.isArray(rawCompanyId)
          ? rawCompanyId[0]?.trim()
          : undefined

    if (!companyId) {
      return ApiResponse.badRequest(res, 'Header X-Company-Id is required')
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: req.user.userId,
          companyId,
        },
      },
      include: {
        role: true,
      },
    })

    if (!membership) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this company'
      )
    }

    if (membership.status !== 'active') {
      return ApiResponse.forbidden(
        res,
        'Your membership in this company is not active'
      )
    }

    req.companyId = companyId
    req.prisma = createTenantPrisma(companyId)
    req.membership = membership

    return next()
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))

    logger.error('[extractCompany] Error', {
      message: err.message,
      stack: err.stack,
      userId: req.user?.userId,
    })

    return ApiResponse.serverError(res, 'Error validating company access')
  }
}

/**
 * Same as extractCompany but reads companyId from the URL param `:id`
 * instead of the X-Company-Id header. Use on routes like /companies/:id/...
 */
export const extractCompanyFromParam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated')
    }

    const rawId = req.params.id
    const companyId = (Array.isArray(rawId) ? rawId[0] : rawId)?.trim()

    if (!companyId) {
      return ApiResponse.badRequest(res, 'Company ID is required in the URL')
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: req.user.userId,
          companyId,
        },
      },
      include: {
        role: true,
      },
    })

    if (!membership) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this company'
      )
    }

    if (membership.status !== 'active') {
      return ApiResponse.forbidden(
        res,
        'Your membership in this company is not active'
      )
    }

    req.companyId = companyId
    req.prisma = createTenantPrisma(companyId)
    req.membership = membership

    return next()
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))

    logger.error('[extractCompanyFromParam] Error', {
      message: err.message,
      stack: err.stack,
      userId: req.user?.userId,
    })

    return ApiResponse.serverError(res, 'Error validating company access')
  }
}
