import prisma from '../../../services/prisma.service.js'

const DEFAULTS = {
  salarioMinimo: 0,
  salarioMinimoBs: 0,
  tasaCambio: 1,
  ivssRate: 0.04,
  faovRate: 0.01,
  incesRate: 0.005,
  ivssMaxSalarios: 5,
  bonoAlimentacion: 0,
  bonoAlimentacionAplica: true,
  utilidadesDias: 15,
  islrAplica: false,
  islrUMT: 0,
  prestacionesDiasGarantia: 15,
}

export class PayrollConfigService {
  async get(companyId: string) {
    const config = await prisma.payrollConfig.findUnique({
      where: { companyId },
    })
    return (
      config ?? {
        companyId,
        ...DEFAULTS,
        id: null,
        createdAt: null,
        updatedAt: null,
      }
    )
  }

  async upsert(companyId: string, data: Record<string, any>, userId?: string) {
    const existing = await prisma.payrollConfig.findUnique({
      where: { companyId },
    })
    return prisma.$transaction(async (tx) => {
      const record = await tx.payrollConfig.upsert({
        where: { companyId },
        create: { companyId, ...DEFAULTS, ...data },
        update: data,
      })
      await tx.auditLog.create({
        data: {
          entity: 'PayrollConfig',
          entityId: record.id,
          action: existing ? 'UPDATE' : 'CREATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing ?? {}, after: record })
          ),
        },
      })
      return record
    })
  }
}

export default new PayrollConfigService()
