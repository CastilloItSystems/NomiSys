import prisma from '../../../services/prisma.service.js'

export interface CreateContractTypeDTO {
  name: string
  description?: string
}
export interface UpdateContractTypeDTO {
  name?: string
  description?: string
  isActive?: boolean
}

export class ContractTypesService {
  async create(
    companyId: string,
    data: CreateContractTypeDTO,
    userId?: string
  ) {
    const existing = await prisma.contractType.findFirst({
      where: { companyId, name: data.name.trim() },
    })
    if (existing)
      throw new Error(
        `Ya existe un tipo de contrato con el nombre "${data.name}"`
      )
    return prisma.$transaction(async (tx) => {
      const record = await tx.contractType.create({
        data: {
          companyId,
          name: data.name.trim(),
          description: data.description?.trim() ?? null,
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'ContractType',
          entityId: record.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: record },
        },
      })
      return record
    })
  }

  async getById(companyId: string, id: string) {
    return prisma.contractType.findFirst({ where: { id, companyId } })
  }

  async list(companyId: string, filters?: any, pagination?: any) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.isActive !== undefined) where.isActive = filters.isActive
    const orderBy: any = {
      [filters?.orderBy ?? 'name']: filters?.order ?? 'asc',
    }
    const [total, items] = await Promise.all([
      prisma.contractType.count({ where }),
      prisma.contractType.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
      }),
    ])
    return { total, limit, offset, count: items.length, contractTypes: items }
  }

  async update(
    companyId: string,
    id: string,
    data: UpdateContractTypeDTO,
    userId?: string
  ) {
    const existing = await this.getById(companyId, id)
    if (!existing)
      throw new Error(`Tipo de contrato con ID ${id} no encontrado`)
    if (data.name) {
      const dup = await prisma.contractType.findFirst({
        where: { companyId, name: data.name.trim(), NOT: { id } },
      })
      if (dup)
        throw new Error(
          `Ya existe un tipo de contrato con el nombre "${data.name}"`
        )
    }
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.description !== undefined)
        updateData.description = data.description?.trim() ?? null
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      const updated = await tx.contractType.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'ContractType',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated
    })
  }

  async delete(companyId: string, id: string, userId?: string) {
    const existing = await this.getById(companyId, id)
    if (!existing)
      throw new Error(`Tipo de contrato con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.contractType.update({
        where: { id },
        data: { isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'ContractType',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: deleted })
          ),
        },
      })
      return deleted
    })
  }
}

export default new ContractTypesService()
