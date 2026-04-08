import { Request, Response } from 'express'
import prisma from '../../services/prisma.service.js'
import r2StorageService from '../../services/r2-storage.service.js'
import {
  ensurePermissionCatalog,
  seedDefaultRolesForEmpresa,
} from '../../services/empresa-setup.service.js'
import { ApiResponse } from '../../shared/utils/apiResponse.js'
import { logger } from '../../shared/utils/logger.js'

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const file = req.file

    if (!file) {
      return ApiResponse.badRequest(res, 'No logo file was uploaded.')
    }

    const company = await prisma.company.findUnique({
      where: { id: String(id) },
    })

    if (!company) {
      return ApiResponse.notFound(res, 'Company not found.')
    }

    // Delete previous logo from R2 if present
    if (
      company.logoUrl &&
      company.logoUrl.includes('r2.cloudflarestorage.com')
    ) {
      await r2StorageService.deleteFile(company.logoUrl)
    }

    const logoUrl = await r2StorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'logos'
    )

    const updatedCompany = await prisma.company.update({
      where: { id: String(id) },
      data: { logoUrl },
    })

    return ApiResponse.success(res, updatedCompany, 'Logo updated')
  } catch (error) {
    logger.error('Error uploading company logo', { error })
    return ApiResponse.serverError(res, 'Error uploading logo.')
  }
}

export const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ApiResponse.success(res, { total: companies.length, companies })
  } catch (error) {
    logger.error('Error fetching companies', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

export const createCompany = async (req: Request, res: Response) => {
  try {
    const companyData = req.body
    const currentUserId = req.user?.userId || null

    const newCompany = await prisma.$transaction(async (tx) => {
      if (companyData.isDefault) {
        await tx.company.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        })
      }

      const company = await tx.company.create({
        data: companyData,
      })

      await tx.auditLog.create({
        data: {
          entity: 'Company',
          entityId: company.id,
          action: 'CREATE',
          userId: currentUserId,
          changes: {
            before: {},
            after: company,
          },
        },
      })

      return company
    })

    // Initialize global permissions (idempotent) and default roles
    await ensurePermissionCatalog()
    await seedDefaultRolesForEmpresa(newCompany.id)

    return ApiResponse.created(res, newCompany, 'Company created successfully')
  } catch (error) {
    logger.error('Error creating company', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    const company = await prisma.company.findUnique({
      where: { id: String(id) },
    })

    if (!company || company.deleted) {
      return ApiResponse.notFound(res, 'Company not found')
    }

    return ApiResponse.success(res, company)
  } catch (error) {
    logger.error('Error fetching company', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const updateData = req.body
    const currentUserId = req.user?.userId || null

    const existingCompany = await prisma.company.findUnique({
      where: { id: String(id) },
    })

    if (!existingCompany || existingCompany.deleted) {
      return ApiResponse.notFound(res, 'Company not found')
    }

    const updatedCompany = await prisma.$transaction(async (tx) => {
      if (updateData.isDefault) {
        await tx.company.updateMany({
          where: {
            isDefault: true,
            id: { not: String(id) },
          },
          data: { isDefault: false },
        })
      }

      const company = await tx.company.update({
        where: { id: String(id) },
        data: updateData,
      })

      await tx.auditLog.create({
        data: {
          entity: 'Company',
          entityId: String(id),
          action: 'UPDATE',
          userId: currentUserId,
          changes: {
            before: existingCompany,
            after: company,
          },
        },
      })

      return company
    })

    return ApiResponse.success(
      res,
      updatedCompany,
      'Company updated successfully'
    )
  } catch (error) {
    logger.error('Error updating company', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const currentUserId = req.user?.userId || null

    const existingCompany = await prisma.company.findUnique({
      where: { id: String(id) },
    })

    if (!existingCompany || existingCompany.deleted) {
      return ApiResponse.notFound(res, 'Company not found')
    }

    await prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: String(id) },
        data: { deleted: true },
      })

      await tx.auditLog.create({
        data: {
          entity: 'Company',
          entityId: String(id),
          action: 'DELETE',
          userId: currentUserId,
          changes: {
            before: existingCompany,
            after: { deleted: true },
          },
        },
      })
    })

    return ApiResponse.success(res, null, 'Company deleted successfully')
  } catch (error) {
    logger.error('Error deleting company', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

/**
 * POST /companies/:id/seed-defaults
 * (Re)creates the default system roles for an existing company.
 * Useful for companies created before auto-seeding was in place.
 * Requires OWNER or ADMIN via authorizeGlobal.
 */
export const seedDefaultsForCompany = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const company = await prisma.company.findUnique({
      where: { id: String(id), deleted: false },
    })
    if (!company) {
      return ApiResponse.notFound(res, 'Company not found')
    }

    await ensurePermissionCatalog()
    await seedDefaultRolesForEmpresa(String(id))

    return ApiResponse.success(res, null, 'Default roles synchronized')
  } catch (error) {
    logger.error('Error syncing default roles', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}

export const getAuditLogsForCompany = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: 'Company',
        entityId: String(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ApiResponse.success(res, { total: auditLogs.length, auditLogs })
  } catch (error) {
    logger.error('Error fetching audit logs', { error })
    return ApiResponse.serverError(res, 'Error fetching audit logs.')
  }
}

export const getDefaultCompany = async (_req: Request, res: Response) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        isDefault: true,
        deleted: false,
      },
    })

    if (!company) {
      return ApiResponse.notFound(res, 'No default company found')
    }

    return ApiResponse.success(res, company)
  } catch (error) {
    logger.error('Error fetching default company', { error })
    return ApiResponse.serverError(res, 'Internal server error')
  }
}
