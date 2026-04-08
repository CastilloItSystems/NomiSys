import prisma from '../../../services/prisma.service.js'
import {
  CreatePositionDTO,
  PositionDTO,
  ListPositionsFilters,
  PaginationParams,
  UpdatePositionDTO,
} from './positions.types.js'

export class PositionsService {
  /**
   * Crear una nueva posición
   */
  async createPosition(
    companyId: string,
    data: CreatePositionDTO,
    userId?: string
  ): Promise<PositionDTO> {
    // Verificar que no exista una posición con el mismo nombre en esta empresa
    const existingPosition = await prisma.position.findFirst({
      where: {
        companyId,
        name: data.name,
      },
    })

    if (existingPosition) {
      throw new Error(
        `Ya existe una posición con el nombre "${data.name}" en esta empresa`
      )
    }

    return await prisma.$transaction(async (tx) => {
      // Crear la posición
      const position = await tx.position.create({
        data: {
          companyId,
          name: data.name.trim(),
          code: data.code?.trim() || null,
          description: data.description?.trim() || null,
          level: data.level?.trim() || null,
          isActive: true,
        },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Position',
          entityId: position.id,
          action: 'CREATE',
          userId,
          changes: {
            before: {},
            after: position,
          },
        },
      })

      return position as PositionDTO
    })
  }

  /**
   * Obtener posición por ID
   */
  async getPositionById(
    companyId: string,
    positionId: string
  ): Promise<PositionDTO | null> {
    return (await prisma.position.findFirst({
      where: {
        id: positionId,
        companyId,
      },
    })) as PositionDTO | null
  }

  /**
   * Listar posiciones con filtros y paginación
   */
  async listPositions(
    companyId: string,
    filters?: ListPositionsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit || 20
    const offset = pagination?.offset || 0
    const orderBy = filters?.orderBy || 'name'
    const order = filters?.order || 'asc'

    // Construir where clause
    const where: any = {
      companyId,
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        {
          name: {
            icontains: filters.search,
          },
        },
        {
          code: {
            icontains: filters.search,
          },
        },
      ]
    }

    // Construir orderBy
    const orderByObj: any = {}
    orderByObj[orderBy] = order

    // Obtener total y registros
    const [total, positions] = await Promise.all([
      prisma.position.count({ where }),
      prisma.position.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: orderByObj,
      }),
    ])

    return {
      total,
      limit,
      offset,
      count: positions.length,
      positions: positions as PositionDTO[],
    }
  }

  /**
   * Actualizar posición
   */
  async updatePosition(
    companyId: string,
    positionId: string,
    data: UpdatePositionDTO,
    userId?: string
  ): Promise<PositionDTO> {
    // Obtener posición actual
    const position = await this.getPositionById(companyId, positionId)
    if (!position) {
      throw new Error(`Posición con ID ${positionId} no encontrada`)
    }

    // Si se cambia el nombre, verificar que no exista otra con el mismo nombre
    if (data.name && data.name.trim() !== position.name) {
      const existingPosition = await prisma.position.findFirst({
        where: {
          companyId,
          name: data.name.trim(),
        },
      })
      if (existingPosition) {
        throw new Error(
          `Ya existe una posición con el nombre "${data.name}" en esta empresa`
        )
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Preparar datos para actualizar
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.code !== undefined) updateData.code = data.code?.trim() || null
      if (data.description !== undefined)
        updateData.description = data.description?.trim() || null
      if (data.level !== undefined)
        updateData.level = data.level?.trim() || null
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      // Actualizar posición
      const updated = await tx.position.update({
        where: { id: positionId },
        data: updateData,
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Position',
          entityId: positionId,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: position,
              after: updated,
            })
          ),
        },
      })

      return updated as PositionDTO
    })
  }

  /**
   * Eliminar (soft delete) posición
   */
  async deletePosition(
    companyId: string,
    positionId: string,
    userId?: string
  ): Promise<PositionDTO> {
    const position = await this.getPositionById(companyId, positionId)
    if (!position) {
      throw new Error(`Posición con ID ${positionId} no encontrada`)
    }

    return await prisma.$transaction(async (tx) => {
      // Soft delete: set isActive = false
      const updated = await tx.position.update({
        where: { id: positionId },
        data: { isActive: false },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Position',
          entityId: positionId,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: position,
              after: updated,
            })
          ),
        },
      })

      return updated as PositionDTO
    })
  }
}

export default new PositionsService()
