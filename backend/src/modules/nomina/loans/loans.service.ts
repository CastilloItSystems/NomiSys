import prisma from '../../../services/prisma.service.js'
import {
  CreateLoanDTO,
  UpdateLoanDTO,
  LoanDTO,
  ListLoansFilters,
  PaginationParams,
} from './loans.types.js'

export class LoansService {
  async create(
    companyId: string,
    data: CreateLoanDTO,
    userId?: string
  ): Promise<LoanDTO> {
    const installmentAmount = Number(
      (data.amount / data.installments).toFixed(2)
    )
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          amount: data.amount,
          remainingBalance: data.amount,
          installments: data.installments,
          installmentAmount,
          startDate: new Date(data.startDate),
          reason: data.reason?.trim() ?? null,
          status: 'Activo',
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Loan',
          entityId: loan.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: loan },
        },
      })
      return loan as unknown as LoanDTO
    })
  }

  async getById(companyId: string, id: string): Promise<LoanDTO | null> {
    return prisma.loan.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<LoanDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListLoansFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
    if (filters?.status) where.status = filters.status
    const orderBy: any = {
      [filters?.orderBy ?? 'startDate']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({ where, take: limit, skip: offset, orderBy }),
    ])
    return {
      total,
      limit,
      offset,
      count: items.length,
      loans: items as unknown as LoanDTO[],
    }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateLoanDTO,
    userId?: string
  ): Promise<LoanDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Préstamo con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.amount !== undefined) {
        updateData.amount = data.amount
        updateData.installmentAmount = Number(
          (data.amount / (data.installments ?? existing.installments)).toFixed(
            2
          )
        )
      }
      if (data.installments !== undefined) {
        updateData.installments = data.installments
        updateData.installmentAmount = Number(
          (Number(existing.amount) / data.installments).toFixed(2)
        )
      }
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined)
        updateData.endDate = data.endDate ? new Date(data.endDate) : null
      if (data.reason !== undefined)
        updateData.reason = data.reason?.trim() ?? null
      if (data.status !== undefined) {
        updateData.status = data.status
        if (data.status !== 'Activo') updateData.isActive = false
      }
      const updated = await tx.loan.update({ where: { id }, data: updateData })
      await tx.auditLog.create({
        data: {
          entity: 'Loan',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as LoanDTO
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<LoanDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing) throw new Error(`Préstamo con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.loan.update({
        where: { id },
        data: { status: 'Cancelado', isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'Loan',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted as unknown as LoanDTO
    })
  }
}

export default new LoansService()
