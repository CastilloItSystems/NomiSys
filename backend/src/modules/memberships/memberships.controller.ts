import { Request, Response } from 'express'
import prisma from '../../services/prisma.service.js'
import { ApiResponse } from '../../shared/utils/apiResponse.js'
import { logger } from '../../shared/utils/logger.js'
import {
  isSuperAdminRequest,
  logSuperAdminBypass,
} from '../../shared/utils/superAdmin.js'

const MAX_MEMBERSHIP_OVERRIDES = 10

export const getMembershipsByEmpresa = async (req: Request, res: Response) => {
  try {
    if (!req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const memberships = await prisma.membership.findMany({
      where: {
        companyId: req.companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            deleted: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })

    return ApiResponse.success(res, { total: memberships.length, memberships })
  } catch (error) {
    logger.error('Error obteniendo memberships', { error })
    return ApiResponse.serverError(
      res,
      'Hubo un error al obtener las memberships.'
    )
  }
}

export const getMembershipsByUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const isSuperAdmin = isSuperAdminRequest(req)

  try {
    if (isSuperAdmin) {
      logSuperAdminBypass(req, 'memberships.getByUser', {
        targetUserId: String(id),
      })
    }

    if (!isSuperAdmin && !req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const memberships = await prisma.membership.findMany({
      where: {
        userId: String(id),
        ...(isSuperAdmin ? {} : { companyId: req.companyId }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })

    return ApiResponse.success(res, { total: memberships.length, memberships })
  } catch (error) {
    logger.error('Error obteniendo memberships del usuario', { error })
    return ApiResponse.serverError(
      res,
      'Hubo un error al obtener las memberships del usuario.'
    )
  }
}

export const createMembership = async (req: Request, res: Response) => {
  try {
    const { userId, roleId, status } = req.body
    const companyId = req.companyId
    const assignedBy = req.user?.userId || null

    if (!companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    if (!userId || !roleId) {
      return ApiResponse.badRequest(
        res,
        'userId and roleId are required.'
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
    })

    if (!user || user.deleted) {
      return ApiResponse.notFound(res, 'User not found.')
    }

    const company = await prisma.company.findUnique({
      where: { id: String(companyId) },
    })

    if (!company || company.deleted) {
      return ApiResponse.notFound(res, 'Company not found.')
    }

    const role = await prisma.companyRole.findFirst({
      where: {
        id: String(roleId),
        companyId: String(companyId),
      },
    })

    if (!role) {
      return ApiResponse.badRequest(
        res,
        'The role does not belong to the specified company.'
      )
    }

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: String(userId),
          companyId: String(companyId),
        },
      },
    })

    if (existingMembership) {
      return ApiResponse.conflict(
        res,
        'The user already belongs to this company.'
      )
    }

    const membership = await prisma.membership.create({
      data: {
        userId: String(userId),
        companyId: String(companyId),
        roleId: String(roleId),
        status: status || 'active',
        assignedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    return ApiResponse.created(
      res,
      membership,
      'Membership created successfully'
    )
  } catch (error) {
    logger.error('Error creating membership', { error })
    return ApiResponse.serverError(res, 'Error creating membership.')
  }
}

export const updateMembership = async (req: Request, res: Response) => {
  const { id } = req.params
  const isSuperAdmin = isSuperAdminRequest(req)

  try {
    if (!req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const { roleId, status } = req.body
    const assignedBy = req.user?.userId || null

    const existingMembership = await prisma.membership.findUnique({
      where: { id: String(id) },
    })

    if (!existingMembership) {
      return ApiResponse.notFound(res, 'Membership not found.')
    }

    if (!isSuperAdmin && existingMembership.companyId !== req.companyId) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this membership.'
      )
    }

    if (isSuperAdmin) {
      logSuperAdminBypass(req, 'memberships.update', {
        membershipId: String(id),
        targetCompanyId: existingMembership.companyId,
      })
    }

    if (roleId) {
      const role = await prisma.companyRole.findFirst({
        where: {
          id: String(roleId),
          companyId: existingMembership.companyId,
        },
      })

      if (!role) {
        return ApiResponse.badRequest(
          res,
          'The role does not belong to the membership company.'
        )
      }
    }

    const membership = await prisma.membership.update({
      where: { id: String(id) },
      data: {
        ...(roleId ? { roleId: String(roleId) } : {}),
        ...(status ? { status } : {}),
        assignedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    return ApiResponse.success(
      res,
      membership,
      'Membership updated successfully'
    )
  } catch (error) {
    logger.error('Error updating membership', { error })
    return ApiResponse.serverError(res, 'Error updating membership.')
  }
}

export const deleteMembership = async (req: Request, res: Response) => {
  const { id } = req.params
  const isSuperAdmin = isSuperAdminRequest(req)

  try {
    if (!req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const existingMembership = await prisma.membership.findUnique({
      where: { id: String(id) },
    })

    if (!existingMembership) {
      return ApiResponse.notFound(res, 'Membership not found.')
    }

    if (!isSuperAdmin && existingMembership.companyId !== req.companyId) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this membership.'
      )
    }

    if (isSuperAdmin) {
      logSuperAdminBypass(req, 'memberships.delete', {
        membershipId: String(id),
        targetCompanyId: existingMembership.companyId,
      })
    }

    await prisma.membership.delete({
      where: { id: String(id) },
    })

    return ApiResponse.noContent(res)
  } catch (error) {
    logger.error('Error deleting membership', { error })
    return ApiResponse.serverError(res, 'Error deleting membership.')
  }
}

/**
 * GET /memberships/:id/permissions
 * Returns base role permissions, individual overrides, and the effective set.
 */
export const getMembershipPermissions = async (req: Request, res: Response) => {
  const { id } = req.params
  const isSuperAdmin = isSuperAdminRequest(req)

  try {
    if (!req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const membership = await prisma.membership.findUnique({
      where: { id: String(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
        role: {
          include: {
            permissions: {
              include: { permission: { select: { id: true, code: true } } },
            },
          },
        },
        permissions: {
          include: { permission: { select: { id: true, code: true } } },
        },
      },
    })

    if (!membership) {
      return ApiResponse.notFound(res, 'Membership not found.')
    }

    if (!isSuperAdmin && membership.companyId !== req.companyId) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this membership.'
      )
    }

    if (isSuperAdmin) {
      logSuperAdminBypass(req, 'memberships.permissions.get', {
        membershipId: String(id),
        targetCompanyId: membership.companyId,
      })
    }

    const rolePermissions = membership.role.permissions.map(
      (rp) => rp.permission.code
    )

    const overrides = membership.permissions.map((mp) => ({
      permissionCode: mp.permission.code,
      action: mp.action,
      reason: mp.reason,
    }))

    // Calculate effective permissions
    const effective = new Set(rolePermissions)
    for (const o of overrides) {
      if (o.action === 'GRANT') effective.add(o.permissionCode)
      if (o.action === 'REVOKE') effective.delete(o.permissionCode)
    }

    return ApiResponse.success(res, {
      membershipId: membership.id,
      user: membership.user,
      company: membership.company,
      roleName: membership.role.name,
      rolePermissions,
      overrides,
      effectivePermissions: Array.from(effective),
    })
  } catch (error) {
    logger.error('Error fetching membership permissions', { error })
    return ApiResponse.serverError(
      res,
      'Hubo un error al obtener los permisos.'
    )
  }
}

/**
 * PUT /memberships/:id/permissions
 * Replaces all permission overrides for a membership.
 * Body: { overrides: [{ permissionCode: string, action: 'GRANT'|'REVOKE', reason?: string }] }
 */
export const setMembershipPermissions = async (req: Request, res: Response) => {
  const { id } = req.params
  const { overrides } = req.body
  const grantedBy = req.user?.userId || null
  const isSuperAdmin = isSuperAdminRequest(req)

  if (!Array.isArray(overrides)) {
    return ApiResponse.badRequest(res, 'overrides must be an array.')
  }

  if (overrides.length > MAX_MEMBERSHIP_OVERRIDES) {
    return ApiResponse.badRequest(
      res,
      `A membership can have at most ${MAX_MEMBERSHIP_OVERRIDES} overrides.`
    )
  }

  const uniqueCodes = new Set<string>()

  // Validate actions
  for (const o of overrides) {
    if (!o?.permissionCode || typeof o.permissionCode !== 'string') {
      return ApiResponse.badRequest(
        res,
        'Each override must include a valid permissionCode.'
      )
    }

    const normalizedCode = o.permissionCode.trim()
    if (!normalizedCode) {
      return ApiResponse.badRequest(
        res,
        'Each override must include a valid permissionCode.'
      )
    }

    if (uniqueCodes.has(normalizedCode)) {
      return ApiResponse.badRequest(
        res,
        `Duplicate override for permission: ${normalizedCode}`
      )
    }

    uniqueCodes.add(normalizedCode)

    if (!['GRANT', 'REVOKE'].includes(o.action)) {
      return ApiResponse.badRequest(
        res,
        `Invalid action: ${o.action}. Must be GRANT or REVOKE.`
      )
    }

    if (o.action === 'REVOKE') {
      const reason = typeof o.reason === 'string' ? o.reason.trim() : ''
      if (!reason) {
        return ApiResponse.badRequest(
          res,
          `REVOKE requires a reason for permission: ${normalizedCode}`
        )
      }
    }
  }

  try {
    if (!req.companyId) {
      return ApiResponse.badRequest(res, 'Company not specified.')
    }

    const membership = await prisma.membership.findUnique({
      where: { id: String(id) },
    })

    if (!membership) {
      return ApiResponse.notFound(res, 'Membership not found.')
    }

    if (!isSuperAdmin && membership.companyId !== req.companyId) {
      return ApiResponse.forbidden(
        res,
        'You do not have access to this membership.'
      )
    }

    if (isSuperAdmin) {
      logSuperAdminBypass(req, 'memberships.permissions.set', {
        membershipId: String(id),
        targetCompanyId: membership.companyId,
        overrideCount: overrides.length,
      })
    }

    // Resolve Permission IDs from codes
    const codes: string[] = overrides.map((o: any) => o.permissionCode.trim())
    const found =
      codes.length > 0
        ? await prisma.permission.findMany({ where: { code: { in: codes } } })
        : []

    if (found.length !== codes.length) {
      const missing = codes.filter((c) => !found.find((p) => p.code === c))
      return ApiResponse.badRequest(res, 'Invalid permissions')
    }

    // Replace overrides in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.membershipPermission.deleteMany({
        where: { membershipId: String(id) },
      })

      if (overrides.length > 0) {
        await tx.membershipPermission.createMany({
          data: overrides.map((o: any) => ({
            membershipId: String(id),
            permissionId: found.find((p) => p.code === o.permissionCode.trim())!
              .id,
            action: o.action as 'GRANT' | 'REVOKE',
            reason: typeof o.reason === 'string' ? o.reason.trim() || null : null,
            grantedBy,
          })),
        })
      }
    })

    return ApiResponse.success(res, null, 'Permissions updated successfully.')
  } catch (error) {
    logger.error('Error updating membership permissions', { error })
    return ApiResponse.serverError(res, 'Error updating permissions.')
  }
}
