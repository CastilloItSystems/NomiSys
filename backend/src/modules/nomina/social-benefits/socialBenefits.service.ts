import prisma from '../../../services/prisma.service.js'
import {
  CreateSocialBenefitDTO,
  SocialBenefitDTO,
  ListSocialBenefitsFilters,
  PaginationParams,
  AccrualResultDTO,
} from './socialBenefits.types.js'

const DAYS_IN_MONTH = 30

export class SocialBenefitsService {
  /**
   * Manually create a prestación social record for an employee.
   */
  async create(
    companyId: string,
    data: CreateSocialBenefitDTO,
    userId?: string
  ): Promise<SocialBenefitDTO> {
    const employee = await prisma.employee.findFirst({
      where: { id: data.employeeId, companyId },
    })
    if (!employee)
      throw new Error(`Empleado con ID ${data.employeeId} no encontrado`)

    const config = await prisma.payrollConfig.findUnique({
      where: { companyId },
    })
    const diasGarantia = config ? config.prestacionesDiasGarantia : 15
    const period = `Q${data.quarter}-${data.year}`
    const monto = (data.salarioIntegral / DAYS_IN_MONTH) * diasGarantia

    // Accumulated total for this employee
    const previous = await prisma.socialBenefit.aggregate({
      where: { companyId, employeeId: data.employeeId, status: 'Activo' },
      _sum: { monto: true },
    })
    const previousTotal = Number(previous._sum.monto ?? 0)
    const montoAcumulado = previousTotal + monto

    return prisma.$transaction(async (tx) => {
      const record = await tx.socialBenefit.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          period,
          year: data.year,
          quarter: data.quarter,
          salarioIntegral: data.salarioIntegral,
          diasGarantia,
          monto,
          montoAcumulado,
          status: 'Activo',
          notes: data.notes?.trim() ?? null,
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'SocialBenefit',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: JSON.parse(JSON.stringify({ before: {}, after: record })),
        },
      })
      return record as unknown as SocialBenefitDTO
    })
  }

  /**
   * Auto-accrue prestaciones sociales for all active employees for the given quarter.
   * Calculates salario integral = salario + alícuota utilidades + alícuota bono vacacional.
   */
  async accrueQuarter(
    companyId: string,
    year: number,
    quarter: number,
    userId?: string
  ): Promise<AccrualResultDTO> {
    const config = await prisma.payrollConfig.findUnique({
      where: { companyId },
    })
    const diasGarantia = config ? config.prestacionesDiasGarantia : 15
    const utilidadesDias = config ? config.utilidadesDias : 15

    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
    })

    const results: SocialBenefitDTO[] = []
    let skipped = 0

    for (const emp of employees) {
      const exists = await prisma.socialBenefit.findUnique({
        where: {
          companyId_employeeId_year_quarter: {
            companyId,
            employeeId: emp.id,
            year,
            quarter,
          },
        },
      })
      if (exists) {
        skipped++
        continue
      }

      const salarioMensual = Number(emp.currentSalary)
      // Alícuota de utilidades = salario / 12 * días_utilidades / días_en_mes
      const alicuotaUtilidades =
        (salarioMensual / 12) * (utilidadesDias / DAYS_IN_MONTH)
      // Alícuota de bono vacacional = salario / 12 * días_bono_vac / días_en_mes (mínimo 7 días LOTTT)
      const diasBonoVac = 7
      const alicuotaBonoVac =
        (salarioMensual / 12) * (diasBonoVac / DAYS_IN_MONTH)
      const salarioIntegral =
        salarioMensual + alicuotaUtilidades + alicuotaBonoVac

      const monto = (salarioIntegral / DAYS_IN_MONTH) * diasGarantia
      const period = `Q${quarter}-${year}`

      const previous = await prisma.socialBenefit.aggregate({
        where: { companyId, employeeId: emp.id, status: 'Activo' },
        _sum: { monto: true },
      })
      const montoAcumulado = Number(previous._sum.monto ?? 0) + monto

      const record = await prisma.socialBenefit.create({
        data: {
          companyId,
          employeeId: emp.id,
          period,
          year,
          quarter,
          salarioIntegral,
          diasGarantia,
          monto,
          montoAcumulado,
          status: 'Activo',
          isActive: true,
        },
      })
      await prisma.auditLog.create({
        data: {
          entity: 'SocialBenefit',
          entityId: record.id,
          action: 'ACCRUE',
          userId,
          changes: JSON.parse(JSON.stringify({ quarter, year, monto })),
        },
      })
      results.push(record as unknown as SocialBenefitDTO)
    }

    return { processed: results.length, skipped, results }
  }

  async list(
    companyId: string,
    filters?: ListSocialBenefitsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 20
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.employeeId) where.employeeId = filters.employeeId
    if (filters?.year) where.year = filters.year
    if (filters?.quarter) where.quarter = filters.quarter
    if (filters?.status) where.status = filters.status
    const orderBy: any = {
      [filters?.orderBy ?? 'createdAt']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.socialBenefit.count({ where }),
      prisma.socialBenefit.findMany({
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
      benefits: items as unknown as SocialBenefitDTO[],
    }
  }

  async getByEmployee(companyId: string, employeeId: string) {
    const items = await prisma.socialBenefit.findMany({
      where: { companyId, employeeId },
      orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
    })
    const total = items.reduce((sum, b) => sum + Number(b.monto), 0)
    return {
      benefits: items as unknown as SocialBenefitDTO[],
      totalAcumulado: total,
    }
  }
}

export default new SocialBenefitsService()
