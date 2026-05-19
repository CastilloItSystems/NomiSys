import prisma from '../../../services/prisma.service.js'
import {
  CreatePayrollPeriodDTO,
  UpdatePayrollPeriodDTO,
  PayrollPeriodDTO,
  ListPayrollPeriodsFilters,
  PaginationParams,
} from './payrollPeriods.types.js'

export class PayrollPeriodsService {
  /**
   * Crear un nuevo período de nómina
   */
  async createPayrollPeriod(
    companyId: string,
    data: CreatePayrollPeriodDTO,
    userId?: string
  ): Promise<PayrollPeriodDTO> {
    // Verificar nombre único por empresa
    const existing = await prisma.payrollPeriod.findFirst({
      where: { companyId, name: data.name.trim() },
    })
    if (existing) {
      throw new Error(
        `Ya existe un período con el nombre "${data.name}" en esta empresa`
      )
    }

    return await prisma.$transaction(async (tx) => {
      const period = await tx.payrollPeriod.create({
        data: {
          companyId,
          name: data.name.trim(),
          frequency: data.frequency,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          paymentDate: new Date(data.paymentDate),
          status: 'Borrador',
          isActive: true,
        },
      })

      await tx.auditLog.create({
        data: {
          entity: 'PayrollPeriod',
          entityId: period.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: period },
        },
      })

      return period as PayrollPeriodDTO
    })
  }

  /**
   * Obtener período por ID (scope a empresa)
   */
  async getPayrollPeriodById(
    companyId: string,
    periodId: string
  ): Promise<PayrollPeriodDTO | null> {
    return (await prisma.payrollPeriod.findFirst({
      where: { id: periodId, companyId },
    })) as PayrollPeriodDTO | null
  }

  /**
   * Listar períodos con filtros y paginación
   */
  async listPayrollPeriods(
    companyId: string,
    filters?: ListPayrollPeriodsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 20
    const offset = pagination?.offset ?? 0
    const orderBy = filters?.orderBy ?? 'startDate'
    const order = filters?.order ?? 'desc'

    const where: any = { companyId }

    if (filters?.frequency) where.frequency = filters.frequency
    if (filters?.status) where.status = filters.status
    if (filters?.isActive !== undefined) where.isActive = filters.isActive

    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' }
    }

    const orderByObj: any = { [orderBy]: order }

    const [total, periods] = await Promise.all([
      prisma.payrollPeriod.count({ where }),
      prisma.payrollPeriod.findMany({
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
      count: periods.length,
      payrollPeriods: periods as PayrollPeriodDTO[],
    }
  }

  /**
   * Actualizar período
   */
  async updatePayrollPeriod(
    companyId: string,
    periodId: string,
    data: UpdatePayrollPeriodDTO,
    userId?: string
  ): Promise<PayrollPeriodDTO> {
    const period = await this.getPayrollPeriodById(companyId, periodId)
    if (!period) {
      throw new Error(`Período con ID ${periodId} no encontrado`)
    }

    // Si cambia el nombre, verificar unicidad
    if (data.name && data.name.trim() !== period.name) {
      const existingName = await prisma.payrollPeriod.findFirst({
        where: { companyId, name: data.name.trim() },
      })
      if (existingName) {
        throw new Error(`Ya existe un período con el nombre "${data.name}"`)
      }
    }

    // No permitir editar un período Cerrado o Pagado (sólo reabrir con status explícito)
    if (
      (period.status === 'Cerrado' || period.status === 'Pagado') &&
      !data.status
    ) {
      throw new Error(
        `No se puede editar un período en estado "${period.status}". Cambia el estado primero.`
      )
    }

    return await prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.frequency !== undefined) updateData.frequency = data.frequency
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined)
        updateData.endDate = new Date(data.endDate)
      if (data.paymentDate !== undefined)
        updateData.paymentDate = new Date(data.paymentDate)
      if (data.status !== undefined) updateData.status = data.status
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      const updated = await tx.payrollPeriod.update({
        where: { id: periodId },
        data: updateData,
      })

      await tx.auditLog.create({
        data: {
          entity: 'PayrollPeriod',
          entityId: periodId,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: period, after: updated })
          ),
        },
      })

      return updated as PayrollPeriodDTO
    })
  }

  /**
   * Eliminar (soft delete) período — solo si está en Borrador
   */
  async deletePayrollPeriod(
    companyId: string,
    periodId: string,
    userId?: string
  ): Promise<PayrollPeriodDTO> {
    const period = await this.getPayrollPeriodById(companyId, periodId)
    if (!period) {
      throw new Error(`Período con ID ${periodId} no encontrado`)
    }

    if (period.status !== 'Borrador') {
      throw new Error(
        `Solo se pueden eliminar períodos en estado "Borrador". Estado actual: "${period.status}"`
      )
    }

    return await prisma.$transaction(async (tx) => {
      const deleted = await tx.payrollPeriod.update({
        where: { id: periodId },
        data: { isActive: false },
      })

      await tx.auditLog.create({
        data: {
          entity: 'PayrollPeriod',
          entityId: periodId,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: period, after: deleted })
          ),
        },
      })

      return deleted as PayrollPeriodDTO
    })
  }
}

export default new PayrollPeriodsService()
