import prisma from '../../../services/prisma.service.js'
import {
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveRequestDTO,
  ListLeaveRequestsFilters,
  PaginationParams,
} from './leaveRequests.types.js'

export class LeaveRequestsService {
  async create(
    companyId: string,
    data: CreateLeaveRequestDTO,
    userId?: string
  ): Promise<LeaveRequestDTO> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.leaveRequest.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          type: data.type,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          days: data.days,
          reason: data.reason?.trim() ?? null,
          status: 'Pendiente',
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'LeaveRequest',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: record },
        },
      })
      return record as unknown as LeaveRequestDTO
    })
  }

  async getById(
    companyId: string,
    id: string
  ): Promise<LeaveRequestDTO | null> {
    return prisma.leaveRequest.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<LeaveRequestDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListLeaveRequestsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.dateFrom || filters?.dateTo) {
      where.startDate = {}
      if (filters.dateFrom) where.startDate.gte = new Date(filters.dateFrom)
      if (filters.dateTo) where.startDate.lte = new Date(filters.dateTo)
    }
    const orderBy: any = {
      [filters?.orderBy ?? 'startDate']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
      }),
    ])
    return {
      total,
      limit,
      offset,
      count: items.length,
      requests: items as unknown as LeaveRequestDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateLeaveRequestDTO,
    userId?: string
  ): Promise<LeaveRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Permiso con ID ${id} no encontrado`)
    if (existing.status !== 'Pendiente')
      throw new Error(`Solo se pueden editar permisos en estado Pendiente`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.type !== undefined) updateData.type = data.type
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined)
        updateData.endDate = new Date(data.endDate)
      if (data.days !== undefined) updateData.days = data.days
      if (data.reason !== undefined)
        updateData.reason = data.reason?.trim() ?? null
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'LeaveRequest',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as LeaveRequestDTO
    })
  }

  async approve(
    companyId: string,
    id: string,
    status: 'Aprobado' | 'Rechazado' | 'Cancelado',
    userId?: string
  ): Promise<LeaveRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Permiso con ID ${id} no encontrado`)
    if (existing.status !== 'Pendiente')
      throw new Error(`Solo se pueden aprobar permisos en estado Pendiente`)
    return prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: { status, approvedBy: userId },
      })
      await tx.auditLog.create({
        data: {
          entity: 'LeaveRequest',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as LeaveRequestDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<LeaveRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Permiso con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.leaveRequest.update({
        where: { id },
        data: { isActive: false, status: 'Cancelado' },
      })
      await tx.auditLog.create({
        data: {
          entity: 'LeaveRequest',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as LeaveRequestDTO
    })
  }
}

export default new LeaveRequestsService()
