import prisma from '../../../services/prisma.service.js'
import {
  CreateAttendanceDTO,
  UpdateAttendanceDTO,
  AttendanceDTO,
  ListAttendanceFilters,
  PaginationParams,
} from './attendance.types.js'

export class AttendanceService {
  async create(
    companyId: string,
    data: CreateAttendanceDTO,
    userId?: string
  ): Promise<AttendanceDTO> {
    const date = new Date(data.date)
    const existing = await prisma.attendance.findUnique({
      where: {
        companyId_employeeId_date: {
          companyId,
          employeeId: data.employeeId,
          date,
        },
      },
    })
    if (existing)
      throw new Error(
        `Ya existe un registro de asistencia para este empleado en la fecha indicada`
      )
    return prisma.$transaction(async (tx) => {
      const record = await tx.attendance.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          date,
          status: data.status,
          checkIn: data.checkIn ? new Date(data.checkIn) : null,
          checkOut: data.checkOut ? new Date(data.checkOut) : null,
          notes: data.notes?.trim() ?? null,
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Attendance',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: record },
        },
      })
      return record as unknown as AttendanceDTO
    })
  }

  async getById(companyId: string, id: string): Promise<AttendanceDTO | null> {
    return prisma.attendance.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<AttendanceDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListAttendanceFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId, isActive: true }
    if (filters?.employeeId) where.employeeId = filters.employeeId
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
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({ where, take: limit, skip: offset, orderBy }),
    ])
    return {
      total,
      limit,
      offset,
      count: items.length,
      attendance: items as unknown as AttendanceDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateAttendanceDTO,
    userId?: string
  ): Promise<AttendanceDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing)
      throw new Error(`Registro de asistencia con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.status !== undefined) updateData.status = data.status
      if (data.checkIn !== undefined)
        updateData.checkIn = data.checkIn ? new Date(data.checkIn) : null
      if (data.checkOut !== undefined)
        updateData.checkOut = data.checkOut ? new Date(data.checkOut) : null
      if (data.notes !== undefined)
        updateData.notes = data.notes?.trim() ?? null
      const updated = await tx.attendance.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'Attendance',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as AttendanceDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<AttendanceDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing)
      throw new Error(`Registro de asistencia con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.attendance.update({
        where: { id },
        data: { isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Attendance',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as AttendanceDTO
    })
  }
}

export default new AttendanceService()
