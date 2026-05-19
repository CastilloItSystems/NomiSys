import prisma from '../../../services/prisma.service.js'
import {
  CreateOvertimeDTO,
  UpdateOvertimeDTO,
  OvertimeDTO,
  ListOvertimeFilters,
  PaginationParams,
} from './overtime.types.js'

export class OvertimeService {
  async create(
    companyId: string,
    data: CreateOvertimeDTO,
    userId?: string
  ): Promise<OvertimeDTO> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.overtime.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          date: new Date(data.date),
          hours: data.hours,
          type: data.type,
          reason: data.reason?.trim() ?? null,
          status: 'Pendiente',
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Overtime',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: record },
        },
      })
      return record as unknown as OvertimeDTO
    })
  }

  async getById(companyId: string, id: string): Promise<OvertimeDTO | null> {
    return prisma.overtime.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<OvertimeDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListOvertimeFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {}
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom)
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo)
    }
    const orderBy: any = {
      [filters?.orderBy ?? 'date']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.overtime.count({ where }),
      prisma.overtime.findMany({ where, take: limit, skip: offset, orderBy }),
    ])
    return {
      total,
      limit,
      offset,
      count: items.length,
      overtime: items as unknown as OvertimeDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateOvertimeDTO,
    userId?: string
  ): Promise<OvertimeDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Horas extra con ID ${id} no encontradas`)
    if (existing.status !== 'Pendiente')
      throw new Error(`Solo se pueden editar registros en estado Pendiente`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.date !== undefined) updateData.date = new Date(data.date)
      if (data.hours !== undefined) updateData.hours = data.hours
      if (data.type !== undefined) updateData.type = data.type
      if (data.reason !== undefined)
        updateData.reason = data.reason?.trim() ?? null
      const updated = await tx.overtime.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'Overtime',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as OvertimeDTO
    })
  }

  async approve(
    companyId: string,
    id: string,
    status: 'Aprobado' | 'Rechazado',
    userId?: string
  ): Promise<OvertimeDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Horas extra con ID ${id} no encontradas`)
    if (existing.status !== 'Pendiente')
      throw new Error(
        `Solo se pueden aprobar/rechazar registros en estado Pendiente`
      )
    return prisma.$transaction(async (tx) => {
      const updated = await tx.overtime.update({
        where: { id },
        data: { status, approvedBy: userId },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Overtime',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as OvertimeDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<OvertimeDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Horas extra con ID ${id} no encontradas`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.overtime.update({
        where: { id },
        data: { isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Overtime',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as OvertimeDTO
    })
  }
}

export default new OvertimeService()
