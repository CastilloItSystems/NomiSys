import prisma from '../../../services/prisma.service.js'
import {
  CreatePayrollRunDTO,
  UpdatePayrollRunDTO,
  PayrollRunDTO,
  PayrollRunLineDTO,
  ListPayrollRunsFilters,
  PaginationParams,
} from './payrollRuns.types.js'
import {
  evaluateFormula,
  buildBaseScope,
  FormulaScope,
} from '../../../services/formulaEvaluator.service.js'

const FREQUENCY_MULTIPLIER: Record<string, number> = {
  Mensual: 1,
  Quincenal: 0.5,
  Semanal: 0.25,
}

// Days in a standard month used for daily-rate conversions
const DAYS_IN_MONTH = 30

export class PayrollRunsService {
  async create(
    companyId: string,
    data: CreatePayrollRunDTO,
    userId?: string
  ): Promise<PayrollRunDTO> {
    // Verify period belongs to company
    const period = await prisma.payrollPeriod.findFirst({
      where: { id: data.periodId, companyId },
    })
    if (!period)
      throw new Error(`Período con ID ${data.periodId} no encontrado`)
    // Check for existing run on this period with same runType
    const existing = await prisma.payrollRun.findUnique({
      where: {
        companyId_periodId_runType: {
          companyId,
          periodId: data.periodId,
          runType: data.runType ?? 'Regular',
        },
      },
    })
    if (existing)
      throw new Error(
        `Ya existe un cálculo de nómina tipo "${data.runType ?? 'Regular'}" para este período`
      )
    return prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          companyId,
          periodId: data.periodId,
          runType: data.runType ?? 'Regular',
          status: 'Borrador',
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
          employeeCount: 0,
          notes: data.notes?.trim() ?? null,
          isActive: true,
        },
      })
      await tx.auditLog.create({
        data: {
          entity: 'PayrollRun',
          entityId: run.id,
          action: 'CREATE',
          userId,
          changes: JSON.parse(JSON.stringify({ before: {}, after: run })),
        },
      })
      return run as unknown as PayrollRunDTO
    })
  }

  async getById(companyId: string, id: string): Promise<PayrollRunDTO | null> {
    return prisma.payrollRun.findFirst({
      where: { id, companyId },
    }) as unknown as Promise<PayrollRunDTO | null>
  }

  async list(
    companyId: string,
    filters?: ListPayrollRunsFilters,
    pagination?: PaginationParams
  ) {
    const limit = pagination?.limit ?? 20
    const offset = pagination?.offset ?? 0
    const where: any = { companyId }
    if (filters?.periodId) where.periodId = filters.periodId
    if (filters?.status) where.status = filters.status
    if (filters?.runType) where.runType = filters.runType
    const orderBy: any = {
      [filters?.orderBy ?? 'createdAt']: filters?.order ?? 'desc',
    }
    const [total, items] = await Promise.all([
      prisma.payrollRun.count({ where }),
      prisma.payrollRun.findMany({ where, take: limit, skip: offset, orderBy }),
    ])
    return {
      total,
      limit,
      offset,
      count: items.length,
      runs: items as unknown as PayrollRunDTO[],
    }
  }

  async getLines(
    companyId: string,
    runId: string
  ): Promise<PayrollRunLineDTO[]> {
    return prisma.payrollRunLine.findMany({
      where: { companyId, runId },
    }) as unknown as Promise<PayrollRunLineDTO[]>
  }

  async update(
    companyId: string,
    id: string,
    data: UpdatePayrollRunDTO,
    userId?: string
  ): Promise<PayrollRunDTO> {
    const existing = await this.getById(companyId, id)
    if (!existing)
      throw new Error(`Cálculo de nómina con ID ${id} no encontrado`)
    if (['Pagado', 'Anulado'].includes(existing.status))
      throw new Error(
        `No se puede editar un cálculo en estado ${existing.status}`
      )
    return prisma.$transaction(async (tx) => {
      const updated = await tx.payrollRun.update({
        where: { id },
        data: { notes: data.notes?.trim() ?? null },
      })
      await tx.auditLog.create({
        data: {
          entity: 'PayrollRun',
          entityId: id,
          action: 'UPDATE',
          userId,
          changes: JSON.parse(
            JSON.stringify({ before: existing, after: updated })
          ),
        },
      })
      return updated as unknown as PayrollRunDTO
    })
  }

  async process(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<PayrollRunDTO> {
    const run = await this.getById(companyId, id)
    if (!run) throw new Error(`Cálculo de nómina con ID ${id} no encontrado`)
    if (!['Borrador', 'Procesado'].includes(run.status))
      throw new Error(
        `Solo se pueden procesar cálculos en estado Borrador o Procesado`
      )

    // Load period, config, employees
    const period = await prisma.payrollPeriod.findFirst({
      where: { id: run.periodId, companyId },
    })
    if (!period) throw new Error(`Período de nómina no encontrado`)
    const config = await prisma.payrollConfig.findUnique({
      where: { companyId },
    })
    const ivssRate = config ? Number(config.ivssRate) : 0.04
    const faovRate = config ? Number(config.faovRate) : 0.01
    const incesRate = config ? Number(config.incesRate) : 0.005
    const salarioMinimo = config ? Number(config.salarioMinimo) : 0
    const ivssMax = config ? config.ivssMaxSalarios : 5
    const multiplier = FREQUENCY_MULTIPLIER[(period as any).frequency] ?? 1

    // Bono alimentación — no salarial, no cotiza IVSS, se aplica por período
    const bonoAlimentacionAplica = config ? config.bonoAlimentacionAplica : true
    const bonoAlimentacionDiario = config ? Number(config.bonoAlimentacion) : 0
    // Calculate working days in the period
    const periodStart = new Date((period as any).startDate)
    const periodEnd = new Date((period as any).endDate)
    const daysDiff = Math.max(
      1,
      Math.round((periodEnd.getTime() - periodStart.getTime()) / 86400000) + 1
    )
    const bonoAlimentacionPeriodo = bonoAlimentacionAplica
      ? bonoAlimentacionDiario * daysDiff
      : 0

    // ISLR — only if configured
    const islrAplica = config ? config.islrAplica : false

    // Utilidades — días de salario (LOTTT mínimo 15 días)
    const utilidadesDias = config ? config.utilidadesDias : 15
    const isUtilidades = run.runType === 'Utilidades'

    // Load active salary concepts ordered by executionOrder (formula engine)
    // contractTypeId = null → universal (applies to all employees)
    // contractTypeId = X    → only employees whose contractTypeId = X
    const allSalaryConcepts = await prisma.salaryConcept.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ executionOrder: 'asc' }, { code: 'asc' }],
    })

    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
    })
    if (employees.length === 0)
      throw new Error(`No hay empleados activos en esta empresa`)

    return prisma.$transaction(
      async (tx) => {
        // Delete existing lines if re-processing
        await tx.payrollRunLine.deleteMany({ where: { runId: id } })
        await tx.payrollRun.update({
          where: { id },
          data: { status: 'Procesando' },
        })

        let totalGross = 0
        let totalDeductions = 0
        let totalNet = 0

        for (const emp of employees) {
          let grossSalary: number
          const concepts: any[] = []

          // ── Per-employee input vars (entered by RR.HH. before processing) ──
          const runInput = await tx.payrollRunInput.findUnique({
            where: { runId_employeeId: { runId: id, employeeId: emp.id } },
          })
          const inputVars: Record<string, number> =
            (runInput?.vars as Record<string, number>) ?? {}
          const manualConceptCodes = Object.keys(inputVars)
            .filter((k) => k.startsWith('manual_'))
            .map((k) => k.replace('manual_', ''))

          // ── Load employee-specific concept settings (EmployeeConcept) ───
          const employeeConcepts = await tx.employeeConcept.findMany({
            where: { companyId, employeeId: emp.id },
          })
          const empConceptMap = new Map<
            string,
            { manualAmount: number | null; disabled: boolean }
          >()
          for (const ec of employeeConcepts) {
            empConceptMap.set(ec.conceptId, {
              manualAmount: ec.manualAmount ? Number(ec.manualAmount) : null,
              disabled: ec.disabled,
            })
          }

          if (isUtilidades) {
            const dailyRate = Number(emp.currentSalary) / DAYS_IN_MONTH
            grossSalary = dailyRate * utilidadesDias
            concepts.push({
              name: `Utilidades (${utilidadesDias} días)`,
              type: 'Ingreso',
              amount: grossSalary,
            })
          } else {
            grossSalary = Number(emp.currentSalary) * multiplier

            // Empleados CCP con conceptos contractuales propios (ej. 5x2):
            // el concepto A del tabulador reemplaza la línea "Salario Base" para
            // evitar doble conteo (A ya incorpora la fracción de días laborables).
            const hasCcpConcepts =
              emp.contractTypeId !== null &&
              emp.contractTypeId !== undefined &&
              allSalaryConcepts.some(
                (c) => c.contractTypeId === emp.contractTypeId && c.code === 'A'
              )

            if (!hasCcpConcepts) {
              concepts.push({
                name: 'Salario Base',
                type: 'Ingreso',
                amount: grossSalary,
              })
            } else {
              // Salario Base = 0 para CCP; grossSalary aún se usa como base
              // de referencia para el scope de fórmulas (salario_basico).
              grossSalary = 0
            }

            // Bono Alimentación (no salarial — no cotiza IVSS)
            if (bonoAlimentacionAplica && bonoAlimentacionPeriodo > 0) {
              concepts.push({
                name: `Bono de Alimentación (${daysDiff} días)`,
                type: 'Ingreso No Salarial',
                amount: bonoAlimentacionPeriodo,
              })
            }
          }

          // ── Attendance & leave data for this employee in the period ──
          const [attendanceRecords, leaveRecords] = await Promise.all([
            tx.attendance.findMany({
              where: {
                companyId,
                employeeId: emp.id,
                date: { gte: periodStart, lte: periodEnd },
              },
            }),
            tx.leaveRequest.findMany({
              where: {
                companyId,
                employeeId: emp.id,
                status: 'Aprobado',
                OR: [
                  { startDate: { lte: periodEnd }, endDate: { gte: periodStart } },
                ],
              },
            }),
          ])

          // Count attendance by status
          const attendanceCounts = {
            presente: 0,
            permiso: 0,
            reposo: 0,
            vacaciones: 0,
            ausente: 0,
            feriado: 0,
          }
          for (const rec of attendanceRecords) {
            const status = rec.status.toLowerCase()
            if (status === 'presente') attendanceCounts.presente++
            else if (status === 'permiso') attendanceCounts.permiso++
            else if (status === 'reposo' || status === 'médico')
              attendanceCounts.reposo++
            else if (status === 'vacaciones') attendanceCounts.vacaciones++
            else if (status === 'ausente') attendanceCounts.ausente++
            else if (status === 'feriado') attendanceCounts.feriado++
          }

          // Add leave request days (medical leave = reposo)
          for (const leave of leaveRecords) {
            const leaveType = leave.type.toLowerCase()
            const start = new Date(
              Math.max(leave.startDate.getTime(), periodStart.getTime())
            )
            const end = new Date(
              Math.min(leave.endDate.getTime(), periodEnd.getTime())
            )
            const days =
              Math.round((end.getTime() - start.getTime()) / 86400000) + 1
            if (leaveType === 'médico' || leaveType === 'medico') {
              attendanceCounts.reposo += days
            } else if (leaveType === 'personal') {
              attendanceCounts.permiso += days
            }
          }

          const attendanceVars = {
            dias_presente: attendanceCounts.presente,
            dias_permiso: attendanceCounts.permiso,
            dias_reposo: attendanceCounts.reposo,
            dias_vacaciones: attendanceCounts.vacaciones,
            dias_ausente: attendanceCounts.ausente,
            dias_feriado: attendanceCounts.feriado,
          }

          // Calculate actual worked days (present + permission + medical leave)
          const diasTrabajadosReales =
            attendanceCounts.presente +
            attendanceCounts.permiso +
            attendanceCounts.reposo

          // ── Formula-based salary concepts ──
          // Filter: universal (contractTypeId = null) OR matching employee's contract type
          // OR manually injected through inputs (manual_<CODE>)
          const salaryConcepts = allSalaryConcepts.filter(
            (c) =>
              c.contractTypeId === null ||
              c.contractTypeId === emp.contractTypeId ||
              manualConceptCodes.includes(c.code)
          )

          // Build scope: system vars + attendance vars + employee inputs + previously computed concept codes
          const scope: FormulaScope = buildBaseScope({
            salarioBasico: Number(emp.currentSalary),
            diasTrabajados: diasTrabajadosReales || daysDiff,
            inputVars,
            attendanceVars,
          })

          let formulaGrossSalarial = 0 // taxable amount from formula concepts
          let formulaGrossNoSalarial = 0 // non-taxable amount from formula concepts
          let conceptDedTotal = 0

          for (const concept of salaryConcepts) {
            // Allow RR.HH. to disable a concept for this employee in this run.
            // Convention in inputs: disabled_<CONCEPT_CODE> = 1
            const disableKey = `disabled_${concept.code}`
            const isDisabled = Number(inputVars[disableKey] ?? 0) === 1
            if (isDisabled) {
              concepts.push({
                code: concept.code,
                name: concept.name,
                type: concept.type,
                amount: 0,
                warning: 'Excluido manualmente para este empleado',
              })
              scope[concept.code] = 0
              continue
            }

            // Manual override / manual concept amount
            // Convention in inputs: manual_<CONCEPT_CODE> = amount
            const manualKey = `manual_${concept.code}`
            const manualRaw = inputVars[manualKey]
            const hasManual = manualRaw !== undefined && manualRaw !== null
            if (hasManual) {
              const amount = Math.max(
                0,
                Math.round(Number(manualRaw) * 100) / 100
              )
              scope[concept.code] = amount

              concepts.push({
                code: concept.code,
                name: concept.name,
                type: concept.type,
                amount: concept.type === 'Deducción' ? -amount : amount,
                warning: concept.formula
                  ? 'Monto manual aplicado (sobrescribe fórmula)'
                  : 'Monto manual aplicado',
              })

              if (concept.type === 'Ingreso') {
                if (concept.isTaxable) formulaGrossSalarial += amount
                else formulaGrossNoSalarial += amount
              }
              if (concept.type === 'Deducción') conceptDedTotal += amount
              continue
            }

            // Without manual amount, only formula concepts can be auto-calculated.
            if (!concept.formula) continue

            // Check if all required inputVars are present
            const missingVars = concept.inputVars.filter(
              (v) => !(v in scope) || scope[v] === undefined
            )
            if (missingVars.length > 0) {
              concepts.push({
                code: concept.code,
                name: concept.name,
                type: concept.type,
                amount: 0,
                warning: `Variables faltantes: ${missingVars.join(', ')}`,
              })
              scope[concept.code] = 0
              continue
            }

            const outcome = evaluateFormula(concept.formula!, scope)
            if (outcome.ok === false) {
              concepts.push({
                code: concept.code,
                name: concept.name,
                type: concept.type,
                amount: 0,
                warning: `Error en fórmula: ${outcome.error}`,
              })
              scope[concept.code] = 0
              continue
            }

            const amount = Math.round(outcome.value * 100) / 100
            scope[concept.code] = amount // available to subsequent formulas

            concepts.push({
              code: concept.code,
              name: concept.name,
              type: concept.type,
              amount: concept.type === 'Deducción' ? -amount : amount,
            })

            if (concept.type === 'Ingreso') {
              if (concept.isTaxable) formulaGrossSalarial += amount
              else formulaGrossNoSalarial += amount
            }
            if (concept.type === 'Deducción') conceptDedTotal += amount
            // Aporte Patronal doesn't affect employee net
          }

          // Augment grossSalary with taxable formula concepts for IVSS base
          const salarioSalarial =
            (isUtilidades ? grossSalary : grossSalary) + formulaGrossSalarial

          // ── Legal deductions (apply to salarial base) ──
          const ivssBase = Math.min(salarioSalarial, salarioMinimo * ivssMax)
          const ivssDed = ivssBase * ivssRate
          const faovDed = emp.faovRegistered ? salarioSalarial * faovRate : 0
          const incesDed = emp.incesRegistered ? salarioSalarial * incesRate : 0

          if (ivssDed > 0)
            concepts.push({
              name: 'IVSS (Empleado)',
              type: 'Deducción Legal',
              amount: -ivssDed,
            })
          if (faovDed > 0)
            concepts.push({
              name: 'FAOV',
              type: 'Deducción Legal',
              amount: -faovDed,
            })
          if (incesDed > 0)
            concepts.push({
              name: 'INCES',
              type: 'Deducción Legal',
              amount: -incesDed,
            })

          // ── ISLR — approximate monthly withholding ──
          let islrDed = 0
          if (islrAplica && !isUtilidades) {
            const islrUMT = config ? Number(config.islrUMT) : 0
            if (islrUMT > 0 && salarioSalarial > islrUMT * 1000) {
              islrDed = (salarioSalarial - islrUMT * 1000) * 0.06
              concepts.push({
                name: 'Retención ISLR',
                type: 'Deducción Legal',
                amount: -islrDed,
              })
            }
          }

          // Active employee deductions
          const deductions = await tx.employeeDeduction.findMany({
            where: {
              companyId,
              employeeId: emp.id,
              isActive: true,
              startDate: { lte: new Date() },
            },
          })
          let customDed = 0
          for (const ded of deductions) {
            let dedAmount = 0
            if (ded.calcType === 'Monto Fijo')
              dedAmount = Number(ded.amount ?? 0)
            else if (ded.calcType === 'Porcentaje')
              dedAmount = salarioSalarial * (Number(ded.percentage ?? 0) / 100)
            customDed += dedAmount
            const conceptRec = await tx.salaryConcept.findFirst({
              where: { id: ded.conceptId },
            })
            concepts.push({
              name: conceptRec?.name ?? 'Deducción',
              type: 'Deducción',
              amount: -dedAmount,
            })
          }

          // Active loans — deduct installment amount
          const loans = await tx.loan.findMany({
            where: {
              companyId,
              employeeId: emp.id,
              status: 'Activo',
              isActive: true,
            },
          })
          let loanDed = 0
          for (const loan of loans) {
            loanDed += Number(loan.installmentAmount)
            concepts.push({
              name: 'Préstamo',
              type: 'Deducción',
              amount: -Number(loan.installmentAmount),
            })
          }

          const dedTotal =
            ivssDed +
            faovDed +
            incesDed +
            islrDed +
            customDed +
            loanDed +
            conceptDedTotal

          const totalIngreso =
            grossSalary +
            formulaGrossSalarial +
            formulaGrossNoSalarial +
            (isUtilidades ? 0 : bonoAlimentacionPeriodo)
          const netSalary = totalIngreso - dedTotal

          await tx.payrollRunLine.create({
            data: {
              companyId,
              runId: id,
              employeeId: emp.id,
              grossSalary: totalIngreso,
              totalDeductions: dedTotal,
              netSalary,
              details: { concepts },
            },
          })

          totalGross += totalIngreso
          totalDeductions += dedTotal
          totalNet += netSalary
        }

        const updated = await tx.payrollRun.update({
          where: { id },
          data: {
            status: 'Procesado',
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: employees.length,
            processedAt: new Date(),
          },
        })
        await tx.auditLog.create({
          data: {
            entity: 'PayrollRun',
            entityId: id,
            action: 'PROCESS',
            userId,
            changes: JSON.parse(
              JSON.stringify({ before: run, after: updated })
            ),
          },
        })
        return updated as unknown as PayrollRunDTO
      },
      { timeout: 60000 }
    )
  }

  async approve(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<PayrollRunDTO> {
    const run = await this.getById(companyId, id)
    if (!run) throw new Error(`Cálculo de nómina con ID ${id} no encontrado`)
    if (run.status !== 'Procesado')
      throw new Error(`Solo se pueden aprobar cálculos en estado Procesado`)
    return prisma.$transaction(async (tx) => {
      const updated = await tx.payrollRun.update({
        where: { id },
        data: { status: 'Aprobado', approvedAt: new Date() },
      })
      await tx.auditLog.create({
        data: {
          entity: 'PayrollRun',
          entityId: id,
          action: 'APPROVE',
          userId,
          changes: JSON.parse(JSON.stringify({ before: run, after: updated })),
        },
      })
      return updated as unknown as PayrollRunDTO
    })
  }

  async pay(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<PayrollRunDTO> {
    const run = await this.getById(companyId, id)
    if (!run) throw new Error(`Cálculo de nómina con ID ${id} no encontrado`)
    if (run.status !== 'Aprobado')
      throw new Error(`Solo se pueden pagar cálculos en estado Aprobado`)
    return prisma.$transaction(
      async (tx) => {
        // Mark loans installments as reducing balance
        const lines = await tx.payrollRunLine.findMany({ where: { runId: id } })
        for (const line of lines) {
          const details = line.details as any
          const loanConcepts = (details?.concepts ?? []).filter(
            (c: any) => c.name === 'Préstamo'
          )
          if (loanConcepts.length > 0) {
            const loans = await tx.loan.findMany({
              where: {
                companyId,
                employeeId: line.employeeId,
                status: 'Activo',
              },
            })
            for (const loan of loans) {
              const newBalance = Math.max(
                0,
                Number(loan.remainingBalance) - Number(loan.installmentAmount)
              )
              await tx.loan.update({
                where: { id: loan.id },
                data: {
                  remainingBalance: newBalance,
                  status: newBalance === 0 ? 'Pagado' : 'Activo',
                  isActive: newBalance > 0,
                },
              })
            }
          }
        }
        const updated = await tx.payrollRun.update({
          where: { id },
          data: { status: 'Pagado', paidAt: new Date() },
        })
        await tx.auditLog.create({
          data: {
            entity: 'PayrollRun',
            entityId: id,
            action: 'PAY',
            userId,
            changes: JSON.parse(
              JSON.stringify({ before: run, after: updated })
            ),
          },
        })
        return updated as unknown as PayrollRunDTO
      },
      { timeout: 60000 }
    )
  }

  async delete(
    companyId: string,
    id: string,
    userId?: string
  ): Promise<PayrollRunDTO> {
    const run = await this.getById(companyId, id)
    if (!run) throw new Error(`Cálculo de nómina con ID ${id} no encontrado`)
    if (['Pagado', 'Aprobado'].includes(run.status))
      throw new Error(`No se puede eliminar un cálculo en estado ${run.status}`)
    return prisma.$transaction(async (tx) => {
      await tx.payrollRunLine.deleteMany({ where: { runId: id } })
      const deleted = await tx.payrollRun.update({
        where: { id },
        data: { status: 'Anulado', isActive: false },
      })
      await tx.auditLog.create({
        data: {
          entity: 'PayrollRun',
          entityId: id,
          action: 'DELETE',
          userId,
          changes: JSON.parse(JSON.stringify({ before: run, after: deleted })),
        },
      })
      return deleted as unknown as PayrollRunDTO
    })
  }

  // ── Per-employee run inputs (variables for formula engine) ──

  async getInputs(companyId: string, runId: string) {
    const run = await this.getById(companyId, runId)
    if (!run) throw new Error(`Cálculo de nómina con ID ${runId} no encontrado`)
    const inputs = await prisma.payrollRunInput.findMany({
      where: { runId },
    })
    return inputs
  }

  async upsertInput(
    companyId: string,
    runId: string,
    employeeId: string,
    vars: Record<string, number>
  ) {
    const run = await this.getById(companyId, runId)
    if (!run) throw new Error(`Cálculo de nómina con ID ${runId} no encontrado`)
    return prisma.payrollRunInput.upsert({
      where: { runId_employeeId: { runId, employeeId } },
      create: { companyId, runId, employeeId, vars },
      update: { vars },
    })
  }

  // Bulk upsert: [ { employeeId, vars } ]
  async upsertInputsBulk(
    companyId: string,
    runId: string,
    entries: { employeeId: string; vars: Record<string, number> }[]
  ) {
    const run = await this.getById(companyId, runId)
    if (!run) throw new Error(`Cálculo de nómina con ID ${runId} no encontrado`)
    return prisma.$transaction(
      entries.map((e) =>
        prisma.payrollRunInput.upsert({
          where: { runId_employeeId: { runId, employeeId: e.employeeId } },
          create: { companyId, runId, employeeId: e.employeeId, vars: e.vars },
          update: { vars: e.vars },
        })
      )
    )
  }
}

export default new PayrollRunsService()
