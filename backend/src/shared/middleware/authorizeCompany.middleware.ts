import { Request, Response, NextFunction } from 'express'
import prisma from '../../services/prisma.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { createTenantPrisma } from '../../services/prisma-tenant.service.js'
import { logger } from '../utils/logger.js'

/**
 * Validates that the authenticated user has an active membership in the company
 * identified by `req.params.id`. Use on company-scoped routes such as:
 *   GET /api/companies/:id
 *   PUT /api/companies/:id
 *   DELETE /api/companies/:id
 *
 * On success, sets req.companyId, req.prisma, and req.membership.
 */
export const authorizeCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated')
    }

    const { userId } = req.user
    const companyId = String(req.params.id)

    if (!companyId) {
      return ApiResponse.badRequest(res, 'Company ID param is required')
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
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

    logger.error('[authorizeCompany] Error', {
      userId: req.user?.userId,
      companyId: req.params.id,
      error: err.message,
    })

    return ApiResponse.serverError(res, 'Internal server error', err)
  }
}
