import prisma from '../../../services/prisma.service.js'
import {
  EmployeeConceptDTO,
  CreateEmployeeConceptDTO,
  UpdateEmployeeConceptDTO,
  ListEmployeeConceptsFilters,
  PaginationParams,
} from './employeeConcepts.types.js'

export class EmployeeConceptsService {
  async getForEmployee(
    companyId: string,
    employeeId: string
  ): Promise<EmployeeConceptDTO[]> {
    const records: any[] = await prisma.employeeConcept.findMany({
      where: { companyId, employeeId },
      include: { concept: true },
    })
    // Sort by concept executionOrder
    records.sort((a, b) => {
      const orderA = a.concept?.executionOrder ?? 0
      const orderB = b.concept?.executionOrder ?? 0
      return orderA - orderB
    })
    return records as unknown as EmployeeConceptDTO[]
  }

  async upsert(
    companyId: string,
    data: CreateEmployeeConceptDTO,
    userId?: string
  ): Promise<EmployeeConceptDTO> {
    const existing = await prisma.employeeConcept.findUnique({
      where: {
        companyId_employeeId_conceptId: {
          companyId,
          employeeId: data.employeeId,
          conceptId: data.conceptId,
        },
      },
    })

    return prisma.$transaction(async (tx) => {
      let record
      if (existing) {
        record = await tx.employeeConcept.update({
          where: { id: existing.id },
          data: {
            manualAmount: data.manualAmount ?? null,
            disabled: data.disabled ?? false,
            notes: data.notes ?? null,
          },
        })
      } else {
        record = await tx.employeeConcept.create({
          data: {
            companyId,
            employeeId: data.employeeId,
            conceptId: data.conceptId,
            manualAmount: data.manualAmount ?? null,
            disabled: data.disabled ?? false,
            notes: data.notes ?? null,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          entity: 'EmployeeConcept',
          entityId: record.id,
          action: existing ? 'UPDATE' : 'CREATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing ?? {}, after: record })
          ),
        },
      })

      return record as unknown as EmployeeConceptDTO
    })
  }

  async upsertMany(
    companyId: string,
    employeeId: string,
    concepts: Array<{ conceptId: string; manualAmount?: number; disabled?: boolean; notes?: string }>,
    userId?: string
  ): Promise<EmployeeConceptDTO[]> {
    return prisma.$transaction(async (tx) => {
      const results: EmployeeConceptDTO[] = []
      
      for (const c of concepts) {
        const existing = await tx.employeeConcept.findUnique({
          where: {
            companyId_employeeId_conceptId: {
              companyId,
              employeeId,
              conceptId: c.conceptId,
            },
          },
        })

        let record
        if (existing) {
          record = await tx.employeeConcept.update({
            where: { id: existing.id },
            data: {
              manualAmount: c.manualAmount ?? null,
              disabled: c.disabled ?? false,
              notes: c.notes ?? null,
            },
          })
        } else {
          record = await tx.employeeConcept.create({
            data: {
              companyId,
              employeeId,
              conceptId: c.conceptId,
              manualAmount: c.manualAmount ?? null,
              disabled: c.disabled ?? false,
              notes: c.notes ?? null,
            },
          })
        }
        results.push(record as unknown as EmployeeConceptDTO)
      }

      await tx.auditLog.create({
        data: {
          entity: 'EmployeeConcept',
          entityId: employeeId,
          action: 'BULK_UPSERT',
          userId,
          changes: { count: concepts.length },
        },
      })

      return results
    })
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<EmployeeConceptDTO> {
    const existing = await prisma.employeeConcept.findUnique({
      where: { id, companyId },
    })
    if (!existing) throw new Error(`EmployeeConcept with ID ${id} not found`)

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.employeeConcept.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          entity: 'EmployeeConcept',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: {} })
          ),
        },
      })

      return deleted as unknown as EmployeeConceptDTO
    })
  }
}

export default new EmployeeConceptsService()
