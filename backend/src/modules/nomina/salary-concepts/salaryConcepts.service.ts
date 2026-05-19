import prisma from '../../../services/prisma.service.js'
import {
  CreateSalaryConceptDTO,
  UpdateSalaryConceptDTO,
  SalaryConceptDTO,
  ListSalaryConceptsFilters,
  PaginationParams,
} from './salaryConcepts.types.js'

export class SalaryConceptsService {
  async createSalaryConcept(
    companyId: string,
    data: CreateSalaryConceptDTO,
    userId?: string
  ): Promise<SalaryConceptDTO> {
    const existing = await prisma.salaryConcept.findUnique({
      where: {
        companyId_code: { companyId, code: data.code.trim().toUpperCase() },
      },
    })
    if (existing)
      throw new Error(`Ya existe un concepto con el código "${data.code}"`)

    return prisma.$transaction(async (tx) => {
      const concept = await tx.salaryConcept.create({
        data: {
          companyId,
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          type: data.type,
          description: data.description?.trim() ?? null,
          isTaxable: data.isTaxable ?? true,
          isActive: true,
          formula: data.formula?.trim() || null,
          executionOrder: data.executionOrder ?? 0,
          inputVars: data.inputVars ?? [],
          contractTypeId: data.contractTypeId ?? null,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'SalaryConcept',
          entityId: concept.id,
          action: 'CREATE',
          userId,
          changes: { before: {}, after: concept },
        },
      })
      return concept as SalaryConceptDTO
    })
  }

  async getSalaryConceptById(
    companyId: string,
    id: string
  ): Promise<SalaryConceptDTO | null> {
    return prisma.salaryConcept.findFirst({
      where: { id, companyId },
    }) as Promise<SalaryConceptDTO | null>
  }

  async listSalaryConcepts(
    companyId: string,
    filters?: ListSalaryConceptsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 50
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.type) where.type = filters.type
    if (filters?.isActive !== undefined) where.isActive = filters.isActive
    if (filters?.search)
      where.name = { contains: filters.search, mode: 'insensitive' }
    const orderBy: any = {
      [filters?.orderBy ?? 'name']: filters?.order ?? 'asc',
    }
    const [total, salaryConcepts] = await Promise.all([
      prisma.salaryConcept.count({ where }),
      prisma.salaryConcept.findMany({
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
      count: salaryConcepts.length,
      salaryConcepts: salaryConcepts as SalaryConceptDTO[],
    }
  }

  async updateSalaryConcept(
    companyId: string,
    id: string,
    data: UpdateSalaryConceptDTO,
    userId?: string
  ): Promise<SalaryConceptDTO> {
    const concept = await this.getSalaryConceptById(companyId, id)
    if (!concept) throw new Error(`Concepto con ID ${id} no encontrado`)
    if (data.code && data.code.trim().toUpperCase() !== concept.code) {
      const dup = await prisma.salaryConcept.findUnique({
        where: {
          companyId_code: { companyId, code: data.code.trim().toUpperCase() },
        },
      })
      if (dup)
        throw new Error(`Ya existe un concepto con el código "${data.code}"`)
    }
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.code !== undefined)
        updateData.code = data.code.trim().toUpperCase()
      if (data.type !== undefined) updateData.type = data.type
      if (data.description !== undefined)
        updateData.description = data.description?.trim() ?? null
      if (data.isTaxable !== undefined) updateData.isTaxable = data.isTaxable
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.formula !== undefined)
        updateData.formula = data.formula?.trim() || null
      if (data.executionOrder !== undefined)
        updateData.executionOrder = data.executionOrder
      if (data.inputVars !== undefined) updateData.inputVars = data.inputVars
      if ('contractTypeId' in data)
        updateData.contractTypeId = data.contractTypeId ?? null
      const updated = await tx.salaryConcept.update({
        where: { id },
        data: updateData,
      })
      await tx.auditLog.create({
        data: {
          entity: 'SalaryConcept',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: concept, after: updated })
          ),
        },
      })
      return updated as SalaryConceptDTO
    })
  }

  async deleteSalaryConcept(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<SalaryConceptDTO> {
    const concept = await this.getSalaryConceptById(companyId, id)
    if (!concept) throw new Error(`Concepto con ID ${id} no encontrado`)
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.salaryConcept.update({
        where: { id },
        data: { isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'SalaryConcept',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: concept, after: deleted })
          ),
        },
      })
      return deleted as SalaryConceptDTO
    })
  }

  /**
   * Get all available variables that can be used in formulas.
   * Returns system variables, attendance variables, concept codes, and input vars.
   */
  async getAvailableVariables(companyId: string): Promise<{
    systemVars: Array<{ name: string; description: string; example: number }>
    attendanceVars: Array<{ name: string; description: string; example: number }>
    conceptCodes: string[]
    inputVars: string[]
  }> {
    // System variables always available
    const systemVars = [
      { name: 'salario_basico', description: 'Salario básico del empleado', example: 100 },
      { name: 'salario_diario', description: 'Salario diario (salario_basico / dias_trabajados)', example: 100 },
      { name: 'salario_hora', description: 'Salario por hora (salario_basico / (dias_trabajados * horas_jornada))', example: 12.5 },
      { name: 'dias_trabajados', description: 'Días trabajados en el período', example: 15 },
      { name: 'horas_jornada', description: 'Horas de la jornada laboral (8, 7.5, 7)', example: 8 },
    ]

    // Attendance variables from attendance records
    const attendanceVars = [
      { name: 'dias_presente', description: 'Días con asistencia presente', example: 12 },
      { name: 'dias_permiso', description: 'Días de permiso remunerado', example: 1 },
      { name: 'dias_reposo', description: 'Días de reposo médico', example: 0 },
      { name: 'dias_vacaciones', description: 'Días de vacaciones en el período', example: 0 },
      { name: 'dias_ausente', description: 'Días ausente (injustificado)', example: 0 },
      { name: 'dias_feriado', description: 'Días feriados trabajados', example: 2 },
    ]

    // Get all active concept codes for this company (they become variables after calculation)
    const concepts = await prisma.salaryConcept.findMany({
      where: { companyId, isActive: true },
      select: { code: true, name: true },
      orderBy: { executionOrder: 'asc' },
    })
    const conceptCodes = concepts.map((c) => c.code)

    // Collect all unique inputVars from all concepts
    const conceptsWithInputVars = await prisma.salaryConcept.findMany({
      where: { companyId, isActive: true, NOT: { inputVars: { equals: [] } } },
      select: { inputVars: true },
    })
    const inputVarsSet = new Set<string>()
    for (const c of conceptsWithInputVars) {
      for (const v of c.inputVars) {
        inputVarsSet.add(v)
      }
    }
    const inputVars = Array.from(inputVarsSet).sort()

    return {
      systemVars,
      attendanceVars,
      conceptCodes,
      inputVars,
    }
  }

  /**
   * Seed CCP (Contrato Colectivo Petrolero) concepts for a company
   */
  async seedCCPConcepts(companyId: string, userId?: string): Promise<void> {
    // Contract types to create (using name as unique)
    const contractTypeData = [
      { name: '5x2', displayName: 'Sistema 5x2', description: '5 días trabajo + 2 descanso' },
      { name: '7x7', displayName: 'Sistema 7x7', description: '7 días trabajo + 7 descanso (12h)' },
      { name: '4x4', displayName: 'Sistema 4x4', description: '4 días trabajo + 4 descanso (12h)' },
    ]

    // Map to store contract type IDs
    const contractTypeIds: Record<string, string> = {}

    for (const ct of contractTypeData) {
      // Find existing by companyId and name (unique)
      const existing = await prisma.contractType.findFirst({
        where: { companyId, name: ct.name },
      })
      let record
      if (existing) {
        record = await prisma.contractType.update({
          where: { id: existing.id },
          data: { name: ct.displayName, description: ct.description },
        })
      } else {
        record = await prisma.contractType.create({
          data: { companyId, name: ct.displayName, description: ct.description },
        })
      }
      contractTypeIds[ct.name] = record.id
    }

    // Universal concepts (apply to all systems)
    const universalConcepts = [
      {
        code: 'HE',
        name: 'Horas Extraordinarias',
        type: 'Ingreso' as const,
        description: 'Horas extras según Cláusula 23.a',
        isTaxable: true,
        formula: 'max((salario_basico / horas_jornada) * 1.93 * horas_extras, (salario_diario) * 1.66 * horas_extras)',
        executionOrder: 100,
        inputVars: ['horas_extras'],
        contractTypeId: null as any,
      },
      {
        code: 'TV',
        name: 'Tiempo de Viaje',
        type: 'Ingreso' as const,
        description: 'TV según Cláusula 23.b',
        isTaxable: true,
        formula: 'horas_viaje <= 1.5 ? (salario_basico / 8) * 1.52 * horas_viaje : ((salario_basico / 8) * 1.52 * 1.5) + ((salario_basico / 8) * 1.77 * (horas_viaje - 1.5))',
        executionOrder: 110,
        inputVars: ['horas_viaje'],
        contractTypeId: null as any,
      },
    ]

    for (const concept of universalConcepts) {
      await prisma.salaryConcept.upsert({
        where: { companyId_code: { companyId, code: concept.code } },
        create: { ...concept, companyId },
        update: { ...concept, companyId },
      })
    }

    // Get contract type ID for 5x2
    const ct5x2Id = contractTypeIds['5x2']
    if (ct5x2Id) {
      const concepts5x2 = [
        {
          code: 'A',
          name: 'Días Trabajados (5x2)',
          type: 'Ingreso' as const,
          description: 'Salario básico por 5 días',
          isTaxable: true,
          formula: 'salario_diario * 5',
          executionOrder: 10,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
        {
          code: 'C',
          name: 'Prima Especial 5x2',
          type: 'Ingreso' as const,
          description: 'Prima por sistema 5x2: 2.5 días',
          isTaxable: true,
          formula: 'salario_diario * 2.5',
          executionOrder: 20,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
        {
          code: 'B',
          name: 'Prima Dominical',
          type: 'Ingreso' as const,
          description: '1.5 días sobre SN',
          isTaxable: true,
          formula: 'dias_trabajados > 0 ? ((A + C + F) / dias_trabajados) * 1.5 : 0',
          executionOrder: 30,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
        {
          code: 'F',
          name: 'Tiempo de Viaje Semanal',
          type: 'Ingreso' as const,
          description: 'TV integrado para 5x2',
          isTaxable: true,
          formula: 'TV',
          executionOrder: 25,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
        {
          code: 'D',
          name: 'Descanso Legal (5x2)',
          type: 'Ingreso' as const,
          description: '1 día descanso legal sobre SN',
          isTaxable: true,
          formula: 'dias_trabajados > 0 ? ((A + B + C + F) / dias_trabajados) * 1 : 0',
          executionOrder: 40,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
        {
          code: 'E',
          name: 'Descanso Contractual (5x2)',
          type: 'Ingreso' as const,
          description: '1 día descanso contractual sobre SN',
          isTaxable: true,
          formula: 'dias_trabajados > 0 ? ((A + B + C + D + F) / dias_trabajados) * 1 : 0',
          executionOrder: 50,
          inputVars: [],
          contractTypeId: ct5x2Id,
        },
      ]

      for (const concept of concepts5x2) {
        await prisma.salaryConcept.upsert({
          where: { companyId_code: { companyId, code: concept.code } },
          create: { ...concept, companyId },
          update: { ...concept, companyId },
        })
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        entity: 'SalaryConcept',
        entityId: companyId,
        action: 'SEED_CCP',
        userId,
        changes: { message: 'CCP concepts seeded' },
      },
    })
  }
}

export default new SalaryConceptsService()
