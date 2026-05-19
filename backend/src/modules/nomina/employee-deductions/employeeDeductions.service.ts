import prisma from '../../../services/prisma.service.js'
import {
  CreateEmployeeDeductionDTO,
  UpdateEmployeeDeductionDTO,
  EmployeeDeductionDTO,
  ListEmployeeDeductionsFilters,
  PaginationParams,
} from './employeeDeductions.types.js'

export class EmployeeDeductionsService {
  async create(
    companyId: string,
    data: CreateEmployeeDeductionDTO,
    userId?: string
  ): Promise<EmployeeDeductionDTO> {
    return prisma.$transaction(async (tx) => {
      const deduction = await tx.employeeDeduction.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          conceptId: data.conceptId,
          calcType: data.calcType,
          amount: data.amount ?? null,
          percentage: data.percentage ?? null,
          description: data.description?.trim() ?? null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'EmployeeDeduction',
          entityId: deduction.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: deduction },
        },
      })
      return deduction as unknown as EmployeeDeductionDTO
    })
  }

  async getById(
    companyId: string,
    id: string
  ): Promise<EmployeeDeductionDTO | null> {
    return prisma.employeeDeduction.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<EmployeeDeductionDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListEmployeeDeductionsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
    if (filters?.conceptId) where.conceptId = filters.conceptId
    if (filters?.isActive !== undefined) where.isActive = filters.isActive
    const orderBy: any = {
      [filters?.orderBy ?? 'startDate']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.employeeDeduction.count({ where }),
      prisma.employeeDeduction.findMany({
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
      deductions: items as unknown as EmployeeDeductionDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateEmployeeDeductionDTO,
    userId?: string
  ): Promise<EmployeeDeductionDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Deducción con ID ${id} no encontrada`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.calcType !== undefined) updateData.calcType = data.calcType
      if (data.amount !== undefined) updateData.amount = data.amount
      if (data.percentage !== undefined) updateData.percentage = data.percentage
      if (data.description !== undefined)
        updateData.description = data.description?.trim() ?? null
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined)
        updateData.endDate = data.endDate ? new Date(data.endDate) : null
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      const updated = await tx.employeeDeduction.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'EmployeeDeduction',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as EmployeeDeductionDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<EmployeeDeductionDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Deducción con ID ${id} no encontrada`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.employeeDeduction.update({
        where: { id },
        data: { isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'EmployeeDeduction',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as EmployeeDeductionDTO
    })
  }
}

export default new EmployeeDeductionsService()
