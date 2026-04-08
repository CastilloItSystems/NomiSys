import prisma from '../../../services/prisma.service.js'
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeDTO,
  ListEmployeesFiltersInterface,
  ListEmployeesResponseInterface,
  fieldNameMap,
} from './employees.types.js'
import { logger } from '../../../shared/utils/logger.js'

export class EmployeesService {
  /**
   * Normalize employee data: convert field aliases to canonical names
   * All values are expected to be in English already
   */
  private normalizeEmployeeData(
    data: any
  ): CreateEmployeeDTO | UpdateEmployeeDTO {
    const normalized = { ...data }

    // Normalize field aliases
    if (normalized.workShift && !normalized.workSchedule) {
      normalized.workSchedule = normalized.workShift
    }
    if (normalized.payFrequency && !normalized.paymentFrequency) {
      normalized.paymentFrequency = normalized.payFrequency
    }
    if (normalized.salaryAmount && !normalized.currentSalary) {
      normalized.currentSalary = normalized.salaryAmount
    }
    if (
      normalized.isFaovEnrolled !== undefined &&
      normalized.faovRegistered === undefined
    ) {
      normalized.faovRegistered = normalized.isFaovEnrolled
    }
    if (
      normalized.isIncesEnrolled !== undefined &&
      normalized.incesRegistered === undefined
    ) {
      normalized.incesRegistered = normalized.isIncesEnrolled
    }
    if (
      normalized.dependents !== undefined &&
      normalized.familyCharges === undefined
    ) {
      normalized.familyCharges = normalized.dependents
    }

    // Remove aliases
    delete normalized.workShift
    delete normalized.payFrequency
    delete normalized.salaryAmount
    delete normalized.isFaovEnrolled
    delete normalized.isIncesEnrolled
    delete normalized.dependents

    // Remove unsupported extra fields
    delete normalized.middleName
    delete normalized.secondLastName
    delete normalized.maritalStatus
    delete normalized.nationality
    delete normalized.birthPlace
    delete normalized.costCenter
    delete normalized.currency
    delete normalized.emergencyContactName
    delete normalized.emergencyContactPhone
    delete normalized.observations

    return normalized
  }

  /**
   * Create a new employee with initial salary and job info records
   */
  async createEmployee(
    companyId: string,
    data: CreateEmployeeDTO,
    userId?: string
  ): Promise<EmployeeDTO> {
    try {
      // Normalize incoming data (field aliases → canonical names)
      const normalizedData = this.normalizeEmployeeData(
        data
      ) as CreateEmployeeDTO

      // Create employee and related records in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Employee record
        const employee = await tx.employee.create({
          data: {
            companyId,
            firstName: normalizedData.firstName,
            lastName: normalizedData.lastName,
            documentType: normalizedData.documentType,
            documentNumber: normalizedData.documentNumber,
            birthDate: new Date(normalizedData.birthDate),
            gender: normalizedData.gender,
            phone: normalizedData.phone,
            email: normalizedData.email,
            address: normalizedData.address,
            employeeCode: normalizedData.employeeCode,
            hireDate: new Date(normalizedData.hireDate),
            departmentId: normalizedData.departmentId,
            positionId: normalizedData.positionId,
            contractType: normalizedData.contractType as string,
            workSchedule: normalizedData.workSchedule as string,
            currentSalary: normalizedData.currentSalary,
            salaryType: 'USD',
            paymentFrequency:
              (normalizedData.paymentFrequency as string) || 'MONTHLY',
            supervisorId: normalizedData.supervisorId || null,
            ivssNumber: normalizedData.ivssNumber || null,
            rifNumber: normalizedData.rifNumber || null,
            faovRegistered: normalizedData.faovRegistered ?? false,
            incesRegistered: normalizedData.incesRegistered ?? false,
            familyCharges: normalizedData.familyCharges ?? 0,
            bankId: normalizedData.bankId,
            accountType: normalizedData.accountType as string,
            accountNumber: normalizedData.accountNumber,
            status: 'ACTIVE',
            isActive: true,
          },
        })

        // 2. Create initial EmployeeSalaryHistory record
        await tx.employeeSalaryHistory.create({
          data: {
            employeeId: employee.id,
            salary: normalizedData.currentSalary,
            salaryType: 'USD',
            effectiveDate: new Date(normalizedData.hireDate),
            previousSalary: 0,
            reason: 'Employee creation - Initial salary',
          },
        })

        // 3. Create initial EmployeeJobInfo record (current assignment)
        await tx.employeeJobInfo.create({
          data: {
            employeeId: employee.id,
            departmentId: normalizedData.departmentId,
            positionId: normalizedData.positionId,
            effectiveDate: new Date(normalizedData.hireDate),
            endDate: null, // NULL indicates current assignment
          },
        })

        // 4. Create audit log
        await tx.auditLog.create({
          data: {
            entity: 'Employee',
            entityId: employee.id,
            action: 'CREATE',
            changes: JSON.parse(
              JSON.stringify({
                before: {},
                after: normalizedData,
              })
            ),
            userId,
          },
        })

        return employee
      })

      return this.mapToDTO(result)
    } catch (error) {
      logger.error('Error creating employee:', error)
      throw error
    }
  }

  /**
   * List employees with filtering and pagination
   */
  async listEmployees(
    companyId: string,
    filters: ListEmployeesFiltersInterface
  ): Promise<ListEmployeesResponseInterface> {
    try {
      const {
        search,
        departmentId,
        positionId,
        status,
        contractType,
        workSchedule,
        page = 1,
        limit = 20,
      } = filters

      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {
        companyId,
        isActive: true, // Only active records
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (departmentId) where.departmentId = departmentId
      if (positionId) where.positionId = positionId
      if (status) where.status = status
      if (contractType) where.contractType = contractType
      if (workSchedule) where.workSchedule = workSchedule

      // Fetch data
      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.employee.count({ where }),
      ])

      const pages = Math.ceil(total / limit)

      return {
        data: employees.map((e) => this.mapToDTO(e)),
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      }
    } catch (error) {
      logger.error('Error listing employees:', error)
      throw error
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(
    employeeId: string,
    companyId: string
  ): Promise<EmployeeDTO | null> {
    try {
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          companyId,
        },
      })

      return employee ? this.mapToDTO(employee) : null
    } catch (error) {
      logger.error('Error fetching employee:', error)
      throw error
    }
  }

  /**
   * Update employee record
   * If salary changes, creates SalaryHistory record
   * If position/department changes, closes current JobInfo and creates new one
   */
  async updateEmployee(
    employeeId: string,
    companyId: string,
    data: UpdateEmployeeDTO,
    userId?: string
  ): Promise<EmployeeDTO> {
    try {
      // Normalize incoming data (field aliases → canonical names)
      const normalizedData = this.normalizeEmployeeData(
        data
      ) as UpdateEmployeeDTO

      const result = await prisma.$transaction(async (tx) => {
        // Get current employee
        const currentEmployee = await tx.employee.findFirst({
          where: { id: employeeId, companyId },
        })

        if (!currentEmployee) {
          throw new Error('Employee not found')
        }

        // Prepare update data
        const updateData: any = {}
        const changes: any = { before: {}, after: {} }

        // Track changes
        if (
          normalizedData.firstName !== undefined &&
          normalizedData.firstName !== currentEmployee.firstName
        ) {
          updateData.firstName = normalizedData.firstName
          changes.before.firstName = currentEmployee.firstName
          changes.after.firstName = normalizedData.firstName
        }
        if (
          normalizedData.lastName !== undefined &&
          normalizedData.lastName !== currentEmployee.lastName
        ) {
          updateData.lastName = normalizedData.lastName
          changes.before.lastName = currentEmployee.lastName
          changes.after.lastName = normalizedData.lastName
        }
        if (
          normalizedData.email !== undefined &&
          normalizedData.email !== currentEmployee.email
        ) {
          updateData.email = normalizedData.email
          changes.before.email = currentEmployee.email
          changes.after.email = normalizedData.email
        }
        if (
          normalizedData.phone !== undefined &&
          normalizedData.phone !== currentEmployee.phone
        ) {
          updateData.phone = normalizedData.phone
          changes.before.phone = currentEmployee.phone
          changes.after.phone = normalizedData.phone
        }
        if (
          normalizedData.address !== undefined &&
          normalizedData.address !== currentEmployee.address
        ) {
          updateData.address = normalizedData.address
          changes.before.address = currentEmployee.address
          changes.after.address = normalizedData.address
        }
        if (
          normalizedData.contractType !== undefined &&
          normalizedData.contractType !== currentEmployee.contractType
        ) {
          updateData.contractType = normalizedData.contractType
          changes.before.contractType = currentEmployee.contractType
          changes.after.contractType = normalizedData.contractType
        }
        if (
          normalizedData.workSchedule !== undefined &&
          normalizedData.workSchedule !== currentEmployee.workSchedule
        ) {
          updateData.workSchedule = normalizedData.workSchedule
          changes.before.workSchedule = currentEmployee.workSchedule
          changes.after.workSchedule = normalizedData.workSchedule
        }
        if (
          normalizedData.supervisorId !== undefined &&
          normalizedData.supervisorId !== currentEmployee.supervisorId
        ) {
          updateData.supervisorId = normalizedData.supervisorId || null
          changes.before.supervisorId = currentEmployee.supervisorId
          changes.after.supervisorId = normalizedData.supervisorId
        }

        // Handle salary change - create history record
        if (
          normalizedData.currentSalary !== undefined &&
          normalizedData.currentSalary !== Number(currentEmployee.currentSalary)
        ) {
          updateData.currentSalary = normalizedData.currentSalary
          changes.before.currentSalary = currentEmployee.currentSalary
          changes.after.currentSalary = normalizedData.currentSalary

          await tx.employeeSalaryHistory.create({
            data: {
              employeeId,
              salary: normalizedData.currentSalary,
              salaryType: 'USD',
              effectiveDate: new Date(),
              previousSalary: currentEmployee.currentSalary,
              reason: 'Salary change',
            },
          })
        }

        if (
          normalizedData.paymentFrequency !== undefined &&
          normalizedData.paymentFrequency !== currentEmployee.paymentFrequency
        ) {
          updateData.paymentFrequency = normalizedData.paymentFrequency
          changes.before.paymentFrequency = currentEmployee.paymentFrequency
          changes.after.paymentFrequency = normalizedData.paymentFrequency
        }

        // Venezuela-specific fields
        if (normalizedData.ivssNumber !== undefined) {
          updateData.ivssNumber = normalizedData.ivssNumber
          changes.before.ivssNumber = currentEmployee.ivssNumber
          changes.after.ivssNumber = normalizedData.ivssNumber
        }
        if (normalizedData.rifNumber !== undefined) {
          updateData.rifNumber = normalizedData.rifNumber
          changes.before.rifNumber = currentEmployee.rifNumber
          changes.after.rifNumber = normalizedData.rifNumber
        }
        if (normalizedData.faovRegistered !== undefined) {
          updateData.faovRegistered = normalizedData.faovRegistered
          changes.before.faovRegistered = currentEmployee.faovRegistered
          changes.after.faovRegistered = normalizedData.faovRegistered
        }
        if (normalizedData.incesRegistered !== undefined) {
          updateData.incesRegistered = normalizedData.incesRegistered
          changes.before.incesRegistered = currentEmployee.incesRegistered
          changes.after.incesRegistered = normalizedData.incesRegistered
        }
        if (normalizedData.familyCharges !== undefined) {
          updateData.familyCharges = normalizedData.familyCharges
          changes.before.familyCharges = currentEmployee.familyCharges
          changes.after.familyCharges = normalizedData.familyCharges
        }

        // Banking information
        if (data.bankId !== undefined) {
          updateData.bankId = data.bankId
          changes.before.bankId = currentEmployee.bankId
          changes.after.bankId = data.bankId
        }
        if (data.accountType !== undefined) {
          updateData.accountType = data.accountType
          changes.before.accountType = currentEmployee.accountType
          changes.after.accountType = data.accountType
        }
        if (data.accountNumber !== undefined) {
          updateData.accountNumber = data.accountNumber
          changes.before.accountNumber = currentEmployee.accountNumber
          changes.after.accountNumber = data.accountNumber
        }

        // Status control
        if (data.status !== undefined) {
          updateData.status = data.status
          changes.before.status = currentEmployee.status
          changes.after.status = data.status
        }
        if (data.isActive !== undefined) {
          updateData.isActive = data.isActive
          changes.before.isActive = currentEmployee.isActive
          changes.after.isActive = data.isActive
        }

        // Update employee
        const updated = await tx.employee.update({
          where: { id: employeeId },
          data: updateData,
        })

        // Create audit log if there were changes
        if (Object.keys(changes.after).length > 0) {
          await tx.auditLog.create({
            data: {
              entity: 'Employee',
              entityId: employeeId,
              action: 'UPDATE',
              changes: JSON.parse(JSON.stringify(changes)),
              userId,
            },
          })
        }

        return updated
      })

      return this.mapToDTO(result)
    } catch (error) {
      logger.error('Error updating employee:', error)
      throw error
    }
  }

  /**
   * Soft delete employee
   */
  async deleteEmployee(
    employeeId: string,
    companyId: string,
    userId?: string
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Soft delete
        await tx.employee.update({
          where: { id: employeeId },
          data: { isActive: false },
        })

        // Audit log
        await tx.auditLog.create({
          data: {
            entity: 'Employee',
            entityId: employeeId,
            action: 'DELETE',
            changes: JSON.parse(
              JSON.stringify({
                before: { isActive: true },
                after: { isActive: false },
              })
            ),
            userId,
          },
        })
      })
    } catch (error) {
      logger.error('Error deleting employee:', error)
      throw error
    }
  }

  /**
   * Change employee status with history tracking
   */
  async changeStatus(
    employeeId: string,
    companyId: string,
    newStatus: 'Activo' | 'Inactivo' | 'Suspendido' | 'Egresado',
    reason: string,
    userId?: string
  ): Promise<EmployeeDTO> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get current employee
        const currentEmployee = await tx.employee.findFirst({
          where: { id: employeeId, companyId },
        })

        if (!currentEmployee) {
          throw new Error('Employee not found')
        }

        const oldStatus = currentEmployee.status

        // Update status
        const updated = await tx.employee.update({
          where: { id: employeeId },
          data: { status: newStatus },
        })

        // Create status history record
        await tx.employeeStatusHistory.create({
          data: {
            employeeId,
            status: newStatus,
            effectiveDate: new Date(),
            reason: reason || `Cambio de estado: ${oldStatus} → ${newStatus}`,
            comments: `Cambio de estado realizado por usuario ${userId}`,
          },
        })

        // Audit log
        await tx.auditLog.create({
          data: {
            entity: 'Employee',
            entityId: employeeId,
            action: 'UPDATE_STATUS',
            changes: JSON.parse(
              JSON.stringify({
                before: { status: oldStatus },
                after: { status: newStatus, reason },
              })
            ),
            userId,
          },
        })

        return updated
      })

      return this.mapToDTO(result)
    } catch (error) {
      logger.error('Error changing employee status:', error)
      throw error
    }
  }

  /**
   * Get employee salary history
   */
  async getEmployeeSalaryHistory(
    employeeId: string,
    companyId: string
  ): Promise<any[]> {
    try {
      // Verify employee belongs to company
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
      })

      if (!employee) {
        throw new Error('Employee not found')
      }

      return await prisma.employeeSalaryHistory.findMany({
        where: { employeeId },
        orderBy: { effectiveDate: 'desc' },
      })
    } catch (error) {
      logger.error('Error fetching salary history:', error)
      throw error
    }
  }

  /**
   * Get employee job info history
   */
  async getEmployeeJobHistory(
    employeeId: string,
    companyId: string
  ): Promise<any[]> {
    try {
      // Verify employee belongs to company
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
      })

      if (!employee) {
        throw new Error('Employee not found')
      }

      return await prisma.employeeJobInfo.findMany({
        where: { employeeId },
        orderBy: { effectiveDate: 'desc' },
      })
    } catch (error) {
      logger.error('Error fetching job history:', error)
      throw error
    }
  }

  /**
   * Get employee status history
   */
  async getEmployeeStatusHistory(
    employeeId: string,
    companyId: string
  ): Promise<any[]> {
    try {
      // Verify employee belongs to company
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
      })

      if (!employee) {
        throw new Error('Employee not found')
      }

      return await prisma.employeeStatusHistory.findMany({
        where: { employeeId },
        orderBy: { effectiveDate: 'desc' },
      })
    } catch (error) {
      logger.error('Error fetching status history:', error)
      throw error
    }
  }

  /**
   * Map Prisma Employee to DTO
   */
  private mapToDTO(employee: any): EmployeeDTO {
    return {
      id: employee.id,
      companyId: employee.companyId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      documentType: employee.documentType,
      documentNumber: employee.documentNumber,
      birthDate: employee.birthDate.toISOString().split('T')[0],
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      employeeCode: employee.employeeCode,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      contractType: employee.contractType,
      workSchedule: employee.workSchedule,
      currentSalary: employee.currentSalary,
      paymentFrequency: employee.paymentFrequency,
      supervisorId: employee.supervisorId,
      ivssNumber: employee.ivssNumber,
      rifNumber: employee.rifNumber,
      faovRegistered: employee.faovRegistered,
      incesRegistered: employee.incesRegistered,
      familyCharges: employee.familyCharges,
      bankId: employee.bankId,
      accountType: employee.accountType,
      accountNumber: employee.accountNumber,
      status: employee.status,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }
  }
}

export default new EmployeesService()
