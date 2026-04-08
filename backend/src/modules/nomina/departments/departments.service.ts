import prisma from '../../../services/prisma.service.js'
import {
  CreateDepartmentDTO,
  DepartmentDTO,
  ListDepartmentsFilters,
  PaginationParams,
  UpdateDepartmentDTO,
} from './departments.types.js'

export class DepartmentsService {
  /**
   * Crear un nuevo departamento
   */
  async createDepartment(
    companyId: string,
    data: CreateDepartmentDTO,
    userId?: string
  ): Promise<DepartmentDTO> {
    // Verificar que no exista un departamento con el mismo nombre en esta empresa
    const existingDept = await prisma.department.findFirst({
      where: {
        companyId,
        name: data.name,
      },
    })

    if (existingDept) {
      throw new Error(
        `Ya existe un departamento con el nombre "${data.name}" en esta empresa`
      )
    }

    return await prisma.$transaction(async (tx) => {
      // Crear el departamento
      const department = await tx.department.create({
        data: {
          companyId,
          name: data.name.trim(),
          code: data.code?.trim() || null,
          description: data.description?.trim() || null,
          isActive: true,
        },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Department',
          entityId: department.id,
          action: 'CREATE',
          userId,
          changes: {
            before: {},
            after: department,
          },
        },
      })

      return department as DepartmentDTO
    })
  }

  /**
   * Obtener departamento por ID
   */
  async getDepartmentById(
    companyId: string,
    departmentId: string
  ): Promise<DepartmentDTO | null> {
    return (await prisma.department.findFirst({
      where: {
        id: departmentId,
        companyId,
      },
    })) as DepartmentDTO | null
  }

  /**
   * Listar departamentos con filtros y paginación
   */
  async listDepartments(
    companyId: string,
    filters?: ListDepartmentsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit || 20
    const offset = pagination?.offset || 0
    const orderBy = filters?.orderBy || 'name'
    const order = filters?.order || 'asc'

    // Construir where clause
    const where: any = {
      companyId,
    }

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
    const [total, departments] = await Promise.all([
      prisma.department.count({ where }),
      prisma.department.findMany({
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
      count: departments.length,
      departments: departments as DepartmentDTO[],
    }
  }

  /**
   * Actualizar departamento
   */
  async updateDepartment(
    companyId: string,
    departmentId: string,
    data: UpdateDepartmentDTO,
    userId?: string
  ): Promise<DepartmentDTO> {
    // Obtener departamento actual
    const department = await this.getDepartmentById(companyId, departmentId)
    if (!department) {
      throw new Error(`Departamento con ID ${departmentId} no encontrado`)
    }

    // Si se cambia el nombre, verificar que no exista otro con el mismo nombre
    if (data.name && data.name.trim() !== department.name) {
      const existingDept = await prisma.department.findFirst({
        where: {
          companyId,
          name: data.name.trim(),
        },
      })
      if (existingDept) {
        throw new Error(
          `Ya existe un departamento con el nombre "${data.name}" en esta empresa`
        )
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Preparar datos para actualizar
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.code !== undefined) updateData.code = data.code?.trim() || null
      if (data.description !== undefined)
        updateData.description = data.description?.trim() || null
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      // Actualizar departamento
      const updated = await tx.department.update({
        where: { id: departmentId },
        data: updateData,
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Department',
          entityId: departmentId,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: department,
              after: updated,
            })
          ),
        },
      })

      return updated as DepartmentDTO
    })
  }

  /**
   * Eliminar (soft delete) departamento
   */
  async deleteDepartment(
    companyId: string,
    departmentId: string,
    userId?: string
  ): Promise<DepartmentDTO> {
    const department = await this.getDepartmentById(companyId, departmentId)
    if (!department) {
      throw new Error(`Departamento con ID ${departmentId} no encontrado`)
    }

    return await prisma.$transaction(async (tx) => {
      // Soft delete: set isActive = false
      const updated = await tx.department.update({
        where: { id: departmentId },
        data: { isActive: false },
      })

      // Registrar auditoría
      await tx.auditLog.create({
        data: {
          entity: 'Department',
          entityId: departmentId,
          action: 'DELETE',
          userId,
          changes: JSON.parse(
            JSON.stringify({
              before: department,
              after: updated,
            })
          ),
        },
      })

      return updated as DepartmentDTO
    })
  }
}

export default new DepartmentsService()
