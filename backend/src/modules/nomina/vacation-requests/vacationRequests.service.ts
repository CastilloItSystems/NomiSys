import prisma from '../../../services/prisma.service.js'
import {
  CreateVacationRequestDTO,
  UpdateVacationRequestDTO,
  VacationRequestDTO,
  ListVacationRequestsFilters,
  PaginationParams,
} from './vacationRequests.types.js'

export class VacationRequestsService {
  async create(
    companyId: string,
    data: CreateVacationRequestDTO,
    userId?: string
  ): Promise<VacationRequestDTO> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.vacationRequest.create({
        data: {
          companyId,
          employeeId: data.employeeId,
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
          entity: 'VacationRequest',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: record },
        },
      })
      return record as unknown as VacationRequestDTO
    })
  }

  async getById(
    companyId: string,
    id: string
  ): Promise<VacationRequestDTO | null> {
    return prisma.vacationRequest.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<VacationRequestDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListVacationRequestsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
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
      prisma.vacationRequest.count({ where }),
      prisma.vacationRequest.findMany({
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
      requests: items as unknown as VacationRequestDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateVacationRequestDTO,
    userId?: string
  ): Promise<VacationRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Solicitud con ID ${id} no encontrada`)
    if (existing.status !== 'Pendiente')
      throw new Error(`Solo se pueden editar solicitudes en estado Pendiente`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined)
        updateData.endDate = new Date(data.endDate)
      if (data.days !== undefined) updateData.days = data.days
      if (data.reason !== undefined)
        updateData.reason = data.reason?.trim() ?? null
      const updated = await tx.vacationRequest.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'VacationRequest',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as VacationRequestDTO
    })
  }

  async approve(
    companyId: string,
    id: string,
    status: 'Aprobado' | 'Rechazado' | 'Cancelado',
    userId?: string
  ): Promise<VacationRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Solicitud con ID ${id} no encontrada`)
    if (existing.status !== 'Pendiente')
      throw new Error(`Solo se pueden aprobar solicitudes en estado Pendiente`)
    return prisma.$transaction(async (tx) => {
      const updated = await tx.vacationRequest.update({
        where: { id },
        data: { status, approvedBy: userId },
      })
      await tx.auditLog.create({
        data: {
          entity: 'VacationRequest',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as VacationRequestDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<VacationRequestDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Solicitud con ID ${id} no encontrada`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.vacationRequest.update({
        where: { id },
        data: { isActive: false, status: 'Cancelado' },
      })
      await tx.auditLog.create({
        data: {
          entity: 'VacationRequest',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as VacationRequestDTO
    })
  }
}

export default new VacationRequestsService()
