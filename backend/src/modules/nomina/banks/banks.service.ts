import prisma from '../../../services/prisma.service.js'
import {
  CreateBankDTO,
  BankDTO,
  ListBanksFilters,
  PaginationParams,
  UpdateBankDTO,
} from './banks.types.js'

export class BanksService {
  /**
   * Crear un nuevo banco (catálogo global, sin companyId)
   */
  async createBank(data: CreateBankDTO, userId?: string): Promise<BankDTO> {
    // Verificar que no exista un banco con el mismo código
    const existingBank = await prisma.bank.findUnique({
      where: {
        code: data.code.toUpperCase().trim(),
      },
    })

    if (existingBank) {
      throw new Error(`Ya existe un banco con el código "${data.code}"`)
    }

    // Verificar que no exista un banco con el mismo nombre
    const existingName = await prisma.bank.findFirst({
      where: {
        name: data.name.trim(),
      },
    })

    if (existingName) {
      throw new Error(`Ya existe un banco con el nombre "${data.name}"`)
    }

    return await prisma.$transaction(async (tx) => {
      // Crear el banco
      const bank = await tx.bank.create({
        data: {
          name: data.name.trim(),
          code: data.code.toUpperCase().trim(),
          isActive: true,
        },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Bank',
          entityId: bank.id,
          action: 'CREATE',
          userId,
          changes: {
            before: {},
            after: bank,
          },
        },
      })

      return bank as BankDTO
    })
  }

  /**
   * Obtener banco por ID
   */
  async getBankById(bankId: string): Promise<BankDTO | null> {
    return (await prisma.bank.findUnique({
      where: { id: bankId },
    })) as BankDTO | null
  }

  /**
   * Listar bancos con filtros y paginación
   */
  async listBanks(filters?: ListBanksFilters, pagination?: PaginationParams) {
    const limit = pagination?.limit || 20
    const offset = pagination?.offset || 0
    const orderBy = filters?.orderBy || 'name'
    const order = filters?.order || 'asc'

    // Construir where clause
    const where: any = {}

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        {
          name: {
            icontains: filters.search,
          },
        },
        {
          code: {
            icontains: filters.search,
          },
        },
      ]
    }

    // Construir orderBy
    const orderByObj: any = {}
    orderByObj[orderBy] = order

    // Obtener total y registros
    const [total, banks] = await Promise.all([
      prisma.bank.count({ where }),
      prisma.bank.findMany({
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
      count: banks.length,
      banks: banks as BankDTO[],
    }
  }

  /**
   * Actualizar banco
   */
  async updateBank(
    bankId: string,
    data: UpdateBankDTO,
    userId?: string
  ): Promise<BankDTO> {
    // Obtener banco actual
    const bank = await this.getBankById(bankId)
    if (!bank) {
      throw new Error(`Banco con ID ${bankId} no encontrado`)
    }

    // Si se cambia el código, verificar que no exista otro con el mismo código
    if (data.code && data.code.toUpperCase().trim() !== bank.code) {
      const existingCode = await prisma.bank.findUnique({
        where: { code: data.code.toUpperCase().trim() },
      })
      if (existingCode) {
        throw new Error(`Ya existe un banco con el código "${data.code}"`)
      }
    }

    // Si se cambia el nombre, verificar que no exista otro con el mismo nombre
    if (data.name && data.name.trim() !== bank.name) {
      const existingName = await prisma.bank.findFirst({
        where: { name: data.name.trim() },
      })
      if (existingName) {
        throw new Error(`Ya existe un banco con el nombre "${data.name}"`)
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Preparar datos para actualizar
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.code !== undefined)
        updateData.code = data.code.toUpperCase().trim()
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      // Actualizar banco
      const updated = await tx.bank.update({
        where: { id: bankId },
        data: updateData,
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Bank',
          entityId: bankId,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: bank,
              after: updated,
            })
          ),
        },
      })

      return updated as BankDTO
    })
  }

  /**
   * Eliminar (soft delete) banco
   */
  async deleteBank(bankId: string, userId?: string): Promise<BankDTO> {
    const bank = await this.getBankById(bankId)
    if (!bank) {
      throw new Error(`Banco con ID ${bankId} no encontrado`)
    }

    return await prisma.$transaction(async (tx) => {
      // Soft delete: set isActive = false
      const updated = await tx.bank.update({
        where: { id: bankId },
        data: { isActive: false },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Bank',
          entityId: bankId,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: bank,
              after: updated,
            })
          ),
        },
      })

      return updated as BankDTO
    })
  }
}

export default new BanksService()
