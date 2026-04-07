import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../services/prisma.service.js'
import { generateToken } from '../services/jwt.service.js'
import { resolveMembershipPermissions } from '../shared/utils/resolvePermissions.js'
import { ApiResponse } from '../shared/utils/apiResponse.js'
import { logger } from '../shared/utils/logger.js'

export const login = async (req: Request, res: Response) => {
  try {
    const body = (req.validatedBody || req.body) as {
      email?: string
      password?: string
    }

    const email = (body.email ?? (body as any).correo)?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return ApiResponse.badRequest(res, 'Email and password are required')
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            role: {
              include: {
                permissions: {
                  include: {
                    permission: {
                      select: {
                        code: true,
                        description: true,
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
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid credentials')
    }

    if (user.deleted || user.status !== 'active') {
      return ApiResponse.unauthorized(
        res,
        'Inactive or pending activation account'
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return ApiResponse.unauthorized(res, 'Invalid credentials')
    }

    const activeMemberships = user.memberships.filter(
      (membership) => membership.status === 'active'
    )

    const companies = activeMemberships.map((membership) => ({
      membershipId: membership.id,
      companyId: membership.company.id,
      name: membership.company.name,
      role: {
        id: membership.role.id,
        name: membership.role.name,
        description: membership.role.description,
      },
      permissions: resolveMembershipPermissions(
        membership.role.permissions,
        membership.permissions
      ),
    }))

    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    const { password: _password, ...userWithoutSensitive } = user
    const userResponse = {
      id: user.id,
      img: user.img,
      name: user.name,
      email: user.email,
      phone: user.phone,
      departments: user.departments,
      access: user.access,
      status: user.status,
      deleted: user.deleted,
      online: user.online,
      fcmTokens: user.fcmTokens,
      google: user.google,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
    return ApiResponse.success(
      res,
      {
        token,
        user: {
          ...userResponse,
          companies,
        },
      },
      'Login successful'
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error en login', {
      message: err.message,
      stack: err.stack,
    })
    return ApiResponse.serverError(res, 'Error interno del servidor')
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const body = (req.validatedBody || req.body) as {
      name?: string
      email?: string
      password?: string
      phone?: string
      departments?: string | string[]
      access?: string
    }

    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password
    const phone = body.phone
    const access = body.access

    const departmentsInput = Array.isArray(body.departments)
      ? body.departments.map((d) => d.trim()).filter(Boolean)
      : body.departments
        ? [body.departments.trim()]
        : []

    if (!name || !email || !password || departmentsInput.length === 0) {
      return ApiResponse.badRequest(
        res,
        'Name, email, password and department are required'
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return ApiResponse.conflict(res, 'Email is already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        departments: departmentsInput,
        access: (access as any) || 'none',
      },
    })

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    })

    const { password: _password, ...userWithoutPassword } = newUser

    return ApiResponse.created(
      res,
      {
        token,
        user: {
          ...userWithoutPassword,
          companies: [],
        },
      },
      'User registered successfully'
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error en registro', {
      message: err.message,
      stack: err.stack,
    })
    return ApiResponse.serverError(res, 'Error interno del servidor')
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        memberships: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            role: {
              include: {
                permissions: {
                  include: {
                    permission: {
                      select: {
                        code: true,
                        description: true,
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
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user || user.deleted) {
      return ApiResponse.notFound(res, 'User not found')
    }

    const companies = user.memberships.map((membership) => ({
      membershipId: membership.id,
      status: membership.status,
      assignedAt: membership.assignedAt,
      company: membership.company,
      role: {
        id: membership.role.id,
        name: membership.role.name,
        description: membership.role.description,
      },
      permissions: resolveMembershipPermissions(
        membership.role.permissions,
        membership.permissions
      ),
    }))

    const { password: _password, ...userWithoutPassword } = user
    const userResponse = {
      id: user.id,
      img: user.img,
      name: user.name,
      email: user.email,
      phone: user.phone,
      departments: user.departments,
      access: user.access,
      status: user.status,
      deleted: user.deleted,
      online: user.online,
      fcmTokens: user.fcmTokens,
      google: user.google,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
    return ApiResponse.success(
      res,
      {
        ...userResponse,
        companies,
      },
      'Profile retrieved successfully'
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error obteniendo perfil', {
      message: err.message,
      stack: err.stack,
    })
    return ApiResponse.serverError(res, 'Error interno del servidor')
  }
}

export const logout = async (_req: Request, res: Response) => {
  return ApiResponse.success(res, null, 'Logout exitoso')
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Usuario no autenticado')
    }

    const body = (req.validatedBody || req.body) as {
      currentPassword?: string
      newPassword?: string
    }

    const currentPassword = body.currentPassword
    const newPassword = body.newPassword

    if (!currentPassword || !newPassword) {
      return ApiResponse.badRequest(
        res,
        'Contraseña actual y nueva son requeridas'
      )
    }

    if (newPassword.length < 6) {
      return ApiResponse.badRequest(
        res,
        'La nueva contraseña debe tener al menos 6 caracteres'
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user || user.deleted) {
      return ApiResponse.notFound(res, 'User not found')
    }

    const isValidCurrentPassword = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isValidCurrentPassword) {
      return ApiResponse.badRequest(res, 'Contraseña actual incorrecta')
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword },
    })

    return ApiResponse.success(res, null, 'Contraseña cambiada exitosamente')
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error cambiando contraseña', {
      message: err.message,
      stack: err.stack,
    })
    return ApiResponse.serverError(res, 'Error interno del servidor')
  }
}
