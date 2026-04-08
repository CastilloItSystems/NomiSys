// backend/src/controllers/companyRoles.controller.ts
// CRUD for dynamic roles per company

import { Request, Response } from 'express'
import prisma from '../../services/prisma.service.js'
import { ApiResponse } from '../../shared/utils/apiResponse.js'
import { logger } from '../../shared/utils/logger.js'

// Helper: incluir permisos como string[] de códigos en la respuesta
const ROLE_INCLUDE = {
  _count: { select: { memberships: true } },
  permissions: {
    include: {
      permission: { select: { code: true } },
    },
  },
} as const

function mapRole(role: any) {
  return {
    ...role,
    permissions: role.permissions.map((rp: any) => rp.permission.code),
  }
}

/**
 * GET /companies/:id/roles
 * Lists all roles for a company with their permissions and membership count.
 */
export const getCompanyRoles = async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const roles = await prisma.companyRole.findMany({
      where: { companyId: id },
      include: ROLE_INCLUDE,
      orderBy: { name: 'asc' },
    })

    ApiResponse.success(res, { roles: roles.map(mapRole) })
  } catch (error) {
    logger.error('Error obteniendo roles de empresa', { error })
    ApiResponse.serverError(res, 'Error interno del servidor')
  }
}

/**
 * POST /companies/:id/roles
 * Creates a new role for the company.
 * Body: { name, description?, permissionCodes: string[] }
 */
export const createCompanyRole = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { name, description, permissionCodes = [] } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return ApiResponse.badRequest(res, 'Role name is required')
  }

  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id, deleted: false },
    })
    if (!company) {
      return ApiResponse.notFound(res, 'Company not found')
    }

    // Verify name uniqueness within the company
    const existing = await prisma.companyRole.findUnique({
      where: { name_companyId: { name: name.trim(), companyId: id } },
    })
    if (existing) {
      return ApiResponse.conflict(
        res,
        `A role named "${name}" already exists in this company`
      )
    }

    // Resolve Permission IDs from codes
    const foundPermissions =
      permissionCodes.length > 0
        ? await prisma.permission.findMany({
            where: { code: { in: permissionCodes } },
          })
        : []

    const foundCodes = foundPermissions.map((p) => p.code)
    const invalidCodes = (permissionCodes as string[]).filter(
      (c) => !foundCodes.includes(c)
    )
    if (invalidCodes.length > 0) {
      return ApiResponse.badRequest(res, 'Invalid permissions')
    }

    const role = await prisma.companyRole.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        companyId: id,
        isSystem: false,
        permissions: {
          create: foundPermissions.map((p) => ({ permissionId: p.id })),
        },
      },
      include: ROLE_INCLUDE,
    })

    ApiResponse.created(
      res,
      { role: mapRole(role) },
      'Role created successfully'
    )
  } catch (error) {
    logger.error('Error creating company role', { error })
    ApiResponse.serverError(res, 'Internal server error')
  }
}

/**
 * PUT /companies/:id/roles/:roleId
 * Updates the name, description, and/or permissions of a role.
 * Body: { name?, description?, permissionCodes?: string[] }
 */
export const updateCompanyRole = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const roleId = req.params.roleId as string
  const { name, description, permissionCodes } = req.body

  try {
    const role = await prisma.companyRole.findFirst({
      where: { id: roleId, companyId: id },
    })

    if (!role) {
      return ApiResponse.notFound(res, 'Role not found')
    }

    // Resolve permissions if provided
    let foundPermissions: { id: string; code: string }[] = []
    if (permissionCodes !== undefined) {
      foundPermissions =
        permissionCodes.length > 0
          ? await prisma.permission.findMany({
              where: { code: { in: permissionCodes } },
            })
          : []

      const foundCodes = foundPermissions.map((p) => p.code)
      const invalidCodes = (permissionCodes as string[]).filter(
        (c) => !foundCodes.includes(c)
      )
      if (invalidCodes.length > 0) {
        return ApiResponse.badRequest(res, 'Invalid permissions')
      }
    }

    // Verify name uniqueness if changing
    if (name !== undefined && name.trim() !== role.name) {
      const existing = await prisma.companyRole.findUnique({
        where: { name_companyId: { name: name.trim(), companyId: id } },
      })
      if (existing) {
        return ApiResponse.conflict(
          res,
          `A role named "${name}" already exists in this company`
        )
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (permissionCodes !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId } })
        if (foundPermissions.length > 0) {
          await tx.rolePermission.createMany({
            data: foundPermissions.map((p) => ({ roleId, permissionId: p.id })),
          })
        }
      }

      return tx.companyRole.update({
        where: { id: roleId },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(description !== undefined && {
            description: description?.trim() || null,
          }),
        },
        include: ROLE_INCLUDE,
      })
    })

    ApiResponse.success(
      res,
      { role: mapRole(updated) },
      'Role updated successfully'
    )
  } catch (error) {
    logger.error('Error updating company role', { error })
    ApiResponse.serverError(res, 'Internal server error')
  }
}

/**
 * DELETE /companies/:id/roles/:roleId
 * Deletes a role. Rejects if it has active memberships (409).
 * Does not allow deleting system roles (isSystem: true).
 */
export const deleteCompanyRole = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const roleId = req.params.roleId as string

  try {
    const role = await prisma.companyRole.findFirst({
      where: { id: roleId, companyId: id },
      include: {
        _count: { select: { memberships: true } },
      },
    })

    if (!role) {
      return ApiResponse.notFound(res, 'Role not found')
    }

    if (role.isSystem) {
      return ApiResponse.forbidden(
        res,
        'System roles cannot be deleted. You can edit their permissions.'
      )
    }

    const roleCounted = role as any
    if (roleCounted._count?.memberships > 0) {
      return ApiResponse.conflict(
        res,
        `This role is assigned to ${roleCounted._count.memberships} active membership(s). Reassign users before deleting.`
      )
    }

    await prisma.companyRole.delete({ where: { id: roleId } })

    ApiResponse.success(res, null, 'Role deleted successfully')
  } catch (error) {
    logger.error('Error deleting company role', { error })
    ApiResponse.serverError(res, 'Internal server error')
  }
}
