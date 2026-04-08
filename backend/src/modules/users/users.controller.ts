import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../../services/prisma.service.js'
import r2StorageService from '../../services/r2-storage.service.js'
import { ApiResponse } from '../../shared/utils/apiResponse.js'
import { logger } from '../../shared/utils/logger.js'

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const file = req.file

    if (!file) {
      return ApiResponse.badRequest(res, 'No se subió ninguna imagen.')
    }

    const user = await prisma.user.findUnique({
      where: { id: String(id) },
    })

    if (!user) {
      return ApiResponse.notFound(res, 'Usuario no encontrado.')
    }

    // Eliminar imagen anterior si existe en R2
    if (user.img && user.img.includes('r2.cloudflarestorage.com')) {
      await r2StorageService.deleteFile(user.img)
    }

    const imageUrl = await r2StorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'profiles'
    )

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: { img: imageUrl },
      select: {
        id: true,
        img: true,
        name: true,
        email: true,
      },
    })

    return ApiResponse.success(res, updatedUser, 'Imagen de perfil actualizada')
  } catch (error) {
    logger.error('Error subiendo imagen de perfil', { error })
    return ApiResponse.serverError(res, 'Error al subir la imagen.')
  }
}

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted: false },
      select: {
        id: true,
        img: true,
        name: true,
        email: true,
        phone: true,
        departments: true,
        access: true,
        status: true,
        deleted: true,
        online: true,
        google: true,
        isTechnician: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ApiResponse.success(res, { total: users.length, users })
  } catch (error) {
    logger.error('Error obteniendo usuarios', { error })
    return ApiResponse.serverError(
      res,
      'Hubo un error al obtener los usuarios.'
    )
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, ...userData } = req.body

    if (!password) {
      return ApiResponse.badRequest(res, 'La contraseña es obligatoria.')
    }

    if (!userData.email) {
      return ApiResponse.badRequest(res, 'Email is required.')
    }

    const email = String(userData.email).trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return ApiResponse.conflict(res, 'A user with that email already exists.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        img: true,
        name: true,
        email: true,
        phone: true,
        departments: true,
        access: true,
        status: true,
        deleted: true,
        online: true,
        google: true,
        isTechnician: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return ApiResponse.created(res, newUser, 'Usuario creado exitosamente')
  } catch (error) {
    logger.error('Error creando usuario', { error })
    return ApiResponse.serverError(res, 'Hubo un error al crear el usuario.')
  }
}

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        img: true,
        name: true,
        email: true,
        phone: true,
        departments: true,
        access: true,
        status: true,
        deleted: true,
        online: true,
        google: true,
        isTechnician: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
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
        },
      },
    })

    if (!user || user.deleted) {
      return ApiResponse.notFound(res, 'User not found.')
    }

    return ApiResponse.success(res, user)
  } catch (error) {
    logger.error('Error fetching user', { error })
    return ApiResponse.serverError(res, 'Error fetching user.')
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const { password, ...userData } = req.body

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) },
    })

    if (!existingUser || existingUser.deleted) {
      return ApiResponse.notFound(res, 'User not found.')
    }

    const data: Record<string, unknown> = { ...userData }

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    if (userData.email) {
      data.email = String(userData.email).trim().toLowerCase()
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data,
      select: {
        id: true,
        img: true,
        name: true,
        email: true,
        phone: true,
        departments: true,
        access: true,
        status: true,
        deleted: true,
        online: true,
        google: true,
        isTechnician: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return ApiResponse.success(res, updatedUser, 'User updated successfully')
  } catch (error) {
    logger.error('Error updating user', { error })
    return ApiResponse.serverError(res, 'Error updating user.')
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) },
    })

    if (!existingUser) {
      return ApiResponse.notFound(res, 'User not found.')
    }

    await prisma.user.update({
      where: { id: String(id) },
      data: { deleted: true },
    })

    return ApiResponse.noContent(res)
  } catch (error) {
    logger.error('Error deleting user', { error })
    return ApiResponse.serverError(res, 'Error deleting user.')
  }
}
