// backend/src/shared/middleware/authorize.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/apiError.js'
import { isSuperAdminRequest, logSuperAdminBypass } from '../utils/superAdmin.js'

// Evaluated per-request so dotenv has time to load before the first check
const skipAuthzInTests = () =>
  process.env.NODE_ENV === 'test' && process.env.SKIP_AUTHZ_IN_TESTS === 'true'

function getRequestPermissions(req: Request): Set<string> {
  return req.authz?.permissions || new Set<string>()
}

export const authorize = (...requiredPermissions: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (skipAuthzInTests()) return next()

    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado')
    }

    if (isSuperAdminRequest(req)) {
      logSuperAdminBypass(req, 'authorize', {
        requiredPermissions,
      })
      return next()
    }

    if (!req.membership?.id) {
      throw new ForbiddenError(
        'No se encontró la membresía activa para esta empresa'
      )
    }

    const userPermissions = getRequestPermissions(req)

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission)
    )
    if (!hasAllPermissions) {
      throw new ForbiddenError('No tienes permisos para realizar esta acción')
    }

    next()
  }
}

export const authorizeAny = (...requiredPermissions: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (skipAuthzInTests()) return next()

    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado')
    }

    if (isSuperAdminRequest(req)) {
      logSuperAdminBypass(req, 'authorizeAny', {
        requiredPermissions,
      })
      return next()
    }

    if (!req.membership?.id) {
      throw new ForbiddenError(
        'No se encontró la membresía activa para esta empresa'
      )
    }

    const userPermissions = getRequestPermissions(req)

    const hasAnyPermission = requiredPermissions.some((permission) =>
      userPermissions.has(permission)
    )

    if (!hasAnyPermission) {
      throw new ForbiddenError('No tienes permisos para realizar esta acción')
    }

    next()
  }
}

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (skipAuthzInTests()) return next()

    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado')
    }

    if (isSuperAdminRequest(req)) {
      logSuperAdminBypass(req, 'authorizeRoles', {
        allowedRoles,
      })
      return next()
    }

    const roleName = req.membership?.role?.name

    if (!roleName || !allowedRoles.includes(roleName)) {
      throw new ForbiddenError(
        'No tienes el rol necesario para realizar esta acción'
      )
    }

    next()
  }
}
