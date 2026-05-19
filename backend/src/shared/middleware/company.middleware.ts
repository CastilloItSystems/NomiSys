import { Request, Response, NextFunction } from 'express'
import prisma from '../../services/prisma.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { createTenantPrisma } from '../../services/prisma-tenant.service.js'
import { logger } from '../utils/logger.js'
import { isSuperAdminRequest, logSuperAdminBypass } from '../utils/superAdmin.js'
import { resolveMembershipPermissions } from '../utils/resolvePermissions.js'

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

    if (isSuperAdminRequest(req)) {
      logSuperAdminBypass(req, 'extractCompany', {
        targetCompanyId: companyId,
      })

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, deleted: true },
      })

      if (!company || company.deleted) {
        return ApiResponse.notFound(res, 'Company not found')
      }

      req.companyId = companyId
      req.prisma = createTenantPrisma(companyId)
      req.authz = {
        permissions: new Set<string>(),
        isSuperAdmin: true,
      }

      return next()
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: req.user.userId,
          companyId,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: {
              select: {
                code: true,
              },
            },
          },
        },
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
    req.authz = {
      permissions: new Set(
        resolveMembershipPermissions(
          membership.role.permissions,
          membership.permissions
        )
      ),
      isSuperAdmin: false,
    }

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

    if (isSuperAdminRequest(req)) {
      logSuperAdminBypass(req, 'extractCompanyFromParam', {
        targetCompanyId: companyId,
      })

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, deleted: true },
      })

      if (!company || company.deleted) {
        return ApiResponse.notFound(res, 'Company not found')
      }

      req.companyId = companyId
      req.prisma = createTenantPrisma(companyId)
      req.authz = {
        permissions: new Set<string>(),
        isSuperAdmin: true,
      }

      return next()
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: req.user.userId,
          companyId,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: {
              select: {
                code: true,
              },
            },
          },
        },
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
    req.authz = {
      permissions: new Set(
        resolveMembershipPermissions(
          membership.role.permissions,
          membership.permissions
        )
      ),
      isSuperAdmin: false,
    }

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
