import type { PrismaClient } from '../../src/generated/prisma/client.js'

const COMPANY_ID = 'camabarca-001'

// ─── Fixed IDs for idempotent upserts ────────────────────────────────────────
const IDS = {
  // Contract types
  ctCcp5x2: 'ct-ccp5x2-001',
  ctRegular: 'ct-regular-001',

  // Departments
  deptOps: 'dept-ops-001',
  deptAdmin: 'dept-admin-001',

  // Positions
  posOperador: 'pos-operador-001',
  posAnalista: 'pos-analista-001',

  // Bank
  bankBdv: 'bank-bdv-001',

  // Salary concepts (CCP 5x2)
  scA: 'sc-ccp-A-001',
  scC: 'sc-ccp-C-001',
  scFtv15: 'sc-ccp-FTV15-001',
  scB: 'sc-ccp-B-001',
  scD: 'sc-ccp-D-001',
  scE: 'sc-ccp-E-001',

  // Employees
  emp1: 'emp-ccp-001',
  emp2: 'emp-ccp-002',
  emp3: 'emp-regular-001',

  // Payroll period
  period: 'period-mayo-2026-01',

  // Payroll run
  run: 'run-mayo-2026-01',
}

export async function seedNomina(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Seeding nómina CCP PDVSA 5×2...')

  // ── 1. Contract Types ───────────────────────────────────────────────────────
  const ctCcp5x2 = await prisma.contractType.upsert({
    where: { id: IDS.ctCcp5x2 },
    create: {
      id: IDS.ctCcp5x2,
      companyId: COMPANY_ID,
      name: 'CCP PDVSA 5x2',
      description:
        'Convención Colectiva Petrolera PDVSA — Régimen 5×2 (cinco días trabajo, dos descanso)',
      isActive: true,
    },
    update: { name: 'CCP PDVSA 5x2', isActive: true },
  })
  console.log(`  ✅ ContractType: ${ctCcp5x2.name}`)

  const ctRegular = await prisma.contractType.upsert({
    where: { id: IDS.ctRegular },
    create: {
      id: IDS.ctRegular,
      companyId: COMPANY_ID,
      name: 'Nómina Mensual Regular',
      description:
        'Contrato de trabajo a tiempo indeterminado, régimen mensual ordinario',
      isActive: true,
    },
    update: { name: 'Nómina Mensual Regular', isActive: true },
  })
  console.log(`  ✅ ContractType: ${ctRegular.name}`)

  // ── 2. Departments ──────────────────────────────────────────────────────────
  const deptOps = await prisma.department.upsert({
    where: { id: IDS.deptOps },
    create: {
      id: IDS.deptOps,
      companyId: COMPANY_ID,
      name: 'Operaciones',
      description: 'Personal de campo y operaciones petroleras',
      isActive: true,
    },
    update: { name: 'Operaciones' },
  })
  console.log(`  ✅ Departamento: ${deptOps.name}`)

  const deptAdmin = await prisma.department.upsert({
    where: { id: IDS.deptAdmin },
    create: {
      id: IDS.deptAdmin,
      companyId: COMPANY_ID,
      name: 'Administración',
      description: 'Personal administrativo y de soporte',
      isActive: true,
    },
    update: { name: 'Administración' },
  })
  console.log(`  ✅ Departamento: ${deptAdmin.name}`)

  // ── 3. Positions ────────────────────────────────────────────────────────────
  const posOperador = await prisma.position.upsert({
    where: { id: IDS.posOperador },
    create: {
      id: IDS.posOperador,
      companyId: COMPANY_ID,
      name: 'Operador de Campo',
      description: 'Operador técnico de campo, régimen CCP PDVSA',
      isActive: true,
    },
    update: { name: 'Operador de Campo' },
  })
  console.log(`  ✅ Posición: ${posOperador.name}`)

  const posAnalista = await prisma.position.upsert({
    where: { id: IDS.posAnalista },
    create: {
      id: IDS.posAnalista,
      companyId: COMPANY_ID,
      name: 'Analista Administrativo',
      description: 'Analista de administración y nómina',
      isActive: true,
    },
    update: { name: 'Analista Administrativo' },
  })
  console.log(`  ✅ Posición: ${posAnalista.name}`)

  // ── 4. Bank ─────────────────────────────────────────────────────────────────
  const bankBdv = await prisma.bank.upsert({
    where: { id: IDS.bankBdv },
    create: {
      id: IDS.bankBdv,
      name: 'Banco de Venezuela (BDV)',
      code: '0102',
      isActive: true,
    },
    update: { name: 'Banco de Venezuela (BDV)' },
  })
  console.log(`  ✅ Banco: ${bankBdv.name}`)

  // ── 5. Salary Concepts — CCP PDVSA 5×2 ─────────────────────────────────────
  // All scoped to ctCcp5x2 → only employees with contractTypeId = ctCcp5x2 receive them
  //
  // Formula variables available:
  //   salario_basico        — emp.currentSalary
  //   salario_diario        — salario_basico / dias_trabajados
  //   salario_hora          — salario_basico / (dias_trabajados * horas_jornada)
  //   dias_trabajados       — days in the payroll period
  //   horas_jornada         — 8 (default)
  //   horas_viaje           — per-employee inputVar
  //   A, C, B, D            — previously computed concept codes

  const concepts = [
    {
      id: IDS.scA,
      code: 'A',
      name: 'Sueldo Básico CCP',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 1,
      // En 5x2: el trabajador labora 5 de cada 7 días del calendario.
      // A = SB_diario × 5 días × semanas_del_período = salario_basico × 5/7
      // (salario_basico = currentSalary = SB_diario × 30, equivalente mensual)
      // NOTA: el servicio NO debe añadir línea 'Salario Base' para empleados CCP;
      //       A reemplaza ese concepto con la fracción correcta 5x2.
      formula: 'salario_basico * 5 / 7',
      inputVars: [],
      description:
        'Concepto A — Sueldo Básico CCP (Cl. 4.24). 5 días de SB por cada 7 del período. Reemplaza la línea "Salario Base" para trabajadores CCP.',
    },
    {
      id: IDS.scC,
      code: 'C',
      name: 'Prima Especial Sistema 5x2',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 2,
      // 2.5 SB diarios por semana × semanas del período (Cláusula 23.q)
      // salario_diario = salario_basico / dias_trabajados → salario_diario * 2.5 * (dias_trabajados / 7)
      formula: 'salario_diario * 2.5 * (dias_trabajados / 7)',
      inputVars: [],
      description:
        'Concepto C — Prima Convenida Compensación Sistema 5x2 (Cl. 23.q). 2.5 salarios básicos diarios por semana trabajada.',
    },
    {
      id: IDS.scFtv15,
      code: 'F_TV15',
      name: 'Tiempo de Viaje 15%',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 3,
      // (salario/hora) * 1.52 recargo * horas de viaje
      formula:
        '(salario_basico / (dias_trabajados * horas_jornada)) * 1.52 * horas_viaje',
      inputVars: ['horas_viaje'],
      description:
        'Concepto F_TV15 — Tiempo de viaje con recargo del 52% (CCP Art. 15). inputVar: horas_viaje (RR.HH. debe ingresar las horas de viaje por empleado antes de procesar).',
    },
    {
      id: IDS.scB,
      code: 'B',
      name: 'Prima Dominical (5x2)',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 10,
      // Prima Dominical: SN_diario × 1.5 por semana (Cl. 23.d)
      // SN_diario = (A + C + F_TV15) / 5  → divisor 5 = días laborales por semana en 5x2
      // F_TV15 forma parte del SN (Cl. 23.b + tabla componentes SN #8)
      formula: '(A + C + F_TV15) / 5 * 1.5',
      inputVars: [],
      description:
        'Concepto B — Prima Dominical (Cl. 23.d). 1.5 días de Salario Normal. Base SN incluye A + C + TV.',
    },
    {
      id: IDS.scD,
      code: 'D',
      name: 'Descanso Legal (5x2)',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 11,
      // Descanso Legal: SN_diario × 1 por semana (Cl. 61 tabla 5x2 ítem D)
      // SN_diario = (A + B + C + F_TV15) / 5  (incluye B ya calculado en la base)
      formula: '(A + B + C + F_TV15) / 5',
      inputVars: [],
      description:
        'Concepto D — Descanso Legal (Cl. 61). 1 día de Salario Normal. Base SN incluye A + B + C + TV.',
    },
    {
      id: IDS.scE,
      code: 'E',
      name: 'Descanso Contractual (5x2)',
      type: 'Ingreso',
      isTaxable: true,
      executionOrder: 12,
      // Descanso Contractual: SN_diario × 1 adicional por semana (Cl. 61 tabla 5x2 ítem E)
      // Misma base que Descanso Legal — divisor 5 = días laborales por semana
      formula: '(A + B + C + F_TV15) / 5',
      inputVars: [],
      description:
        'Concepto E — Descanso Contractual (Cl. 61). 1 día de Salario Normal adicional al descanso legal (día contractual = segundo día de descanso semanal).',
    },
  ]

  for (const c of concepts) {
    const sc = await prisma.salaryConcept.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        companyId: COMPANY_ID,
        contractTypeId: IDS.ctCcp5x2,
        code: c.code,
        name: c.name,
        type: c.type,
        isTaxable: c.isTaxable,
        isActive: true,
        executionOrder: c.executionOrder,
        formula: c.formula,
        inputVars: c.inputVars,
        description: c.description,
      },
      update: {
        contractTypeId: IDS.ctCcp5x2,
        name: c.name,
        type: c.type,
        isTaxable: c.isTaxable,
        isActive: true,
        executionOrder: c.executionOrder,
        formula: c.formula,
        inputVars: c.inputVars,
        description: c.description,
      },
    })
    console.log(
      `  ✅ Concepto CCP: ${sc.code} — ${sc.name} (orden ${sc.executionOrder})`
    )
  }

  // ── 6. Employees ────────────────────────────────────────────────────────────
  const employees = [
    {
      id: IDS.emp1,
      employeeCode: 'EMP-CCP-001',
      firstName: 'Carlos',
      secondName: 'Eduardo',
      lastName: 'Rodríguez',
      secondLastName: 'Pérez',
      documentType: 'V',
      documentNumber: '12345678',
      birthDate: new Date('1985-03-15'),
      gender: 'M',
      phone: '0414-1234567',
      email: 'carlos.rodriguez@camabarca.com',
      address: 'Urb. Las Mercedes, Calle 5, Casa 12, Barcelona, Anzoátegui',
      hireDate: new Date('2018-06-01'),
      departmentId: IDS.deptOps,
      positionId: IDS.posOperador,
      contractType: 'CCP PDVSA 5x2',
      contractTypeId: IDS.ctCcp5x2,
      workSchedule: 'FULL_TIME',
      currentSalary: 850.0,
      salaryType: 'USD',
      paymentFrequency: 'MONTHLY',
      ivssNumber: '1234567890',
      rifNumber: null,
      faovRegistered: true,
      incesRegistered: true,
      familyCharges: 2,
      bankId: IDS.bankBdv,
      accountType: 'Ahorro',
      accountNumber: '01020123456789012345',
      status: 'ACTIVE',
    },
    {
      id: IDS.emp2,
      employeeCode: 'EMP-CCP-002',
      firstName: 'María',
      secondName: 'Alejandra',
      lastName: 'González',
      secondLastName: 'Suárez',
      documentType: 'V',
      documentNumber: '18765432',
      birthDate: new Date('1990-07-22'),
      gender: 'F',
      phone: '0424-9876543',
      email: 'maria.gonzalez@camabarca.com',
      address: 'Res. Valle Verde, Apto 3B, Puerto La Cruz, Anzoátegui',
      hireDate: new Date('2020-01-15'),
      departmentId: IDS.deptOps,
      positionId: IDS.posOperador,
      contractType: 'CCP PDVSA 5x2',
      contractTypeId: IDS.ctCcp5x2,
      workSchedule: 'FULL_TIME',
      currentSalary: 750.0,
      salaryType: 'USD',
      paymentFrequency: 'MONTHLY',
      ivssNumber: '9876543210',
      rifNumber: null,
      faovRegistered: true,
      incesRegistered: false,
      familyCharges: 0,
      bankId: IDS.bankBdv,
      accountType: 'Ahorro',
      accountNumber: '01020987654321098765',
      status: 'ACTIVE',
    },
    {
      id: IDS.emp3,
      employeeCode: 'EMP-REG-001',
      firstName: 'Pedro',
      secondName: null,
      lastName: 'Martínez',
      secondLastName: 'López',
      documentType: 'V',
      documentNumber: '22334455',
      birthDate: new Date('1988-11-30'),
      gender: 'M',
      phone: '0412-5556677',
      email: 'pedro.martinez@camabarca.com',
      address: 'Av. Principal, Qta. El Rosal N°45, Barcelona, Anzoátegui',
      hireDate: new Date('2021-09-01'),
      departmentId: IDS.deptAdmin,
      positionId: IDS.posAnalista,
      contractType: 'Nómina Mensual Regular',
      contractTypeId: IDS.ctRegular,
      workSchedule: 'FULL_TIME',
      currentSalary: 500.0,
      salaryType: 'USD',
      paymentFrequency: 'MONTHLY',
      ivssNumber: '5544332211',
      rifNumber: null,
      faovRegistered: true,
      incesRegistered: true,
      familyCharges: 1,
      bankId: IDS.bankBdv,
      accountType: 'Corriente',
      accountNumber: '01025544332211223344',
      status: 'ACTIVE',
    },
  ]

  for (const e of employees) {
    const emp = await prisma.employee.upsert({
      where: { id: e.id },
      create: { ...e, companyId: COMPANY_ID, isActive: true },
      update: {
        contractType: e.contractType,
        contractTypeId: e.contractTypeId,
        currentSalary: e.currentSalary,
        isActive: true,
        status: e.status,
      },
    })
    console.log(
      `  ✅ Empleado: ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) — Contrato: ${e.contractType}`
    )
  }

  // ── 7. Payroll Period — Primera quincena Mayo 2026 ──────────────────────────
  const period = await prisma.payrollPeriod.upsert({
    where: { id: IDS.period },
    create: {
      id: IDS.period,
      companyId: COMPANY_ID,
      name: '1ra Quincena Mayo 2026',
      frequency: 'Quincenal',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-15'),
      paymentDate: new Date('2026-05-15'),
      status: 'Abierto',
      isActive: true,
    },
    update: { name: '1ra Quincena Mayo 2026', status: 'Abierto' },
  })
  console.log(`  ✅ Período: ${period.name} (${period.status})`)

  // ── 8. Payroll Run — Borrador (listo para procesar) ─────────────────────────
  const run = await prisma.payrollRun.upsert({
    where: { id: IDS.run },
    create: {
      id: IDS.run,
      companyId: COMPANY_ID,
      periodId: IDS.period,
      runType: 'Regular',
      status: 'Borrador',
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      employeeCount: 0,
      notes:
        'Nómina de prueba CCP PDVSA 5×2. Antes de procesar: ingresar horas_viaje por empleado usando el botón "Procesar Nómina".',
      isActive: true,
    },
    update: { status: 'Borrador', notes: 'Nómina de prueba CCP PDVSA 5×2.' },
  })
  console.log(`  ✅ PayrollRun: ${run.id} — Estado: ${run.status}`)
  console.log('')
  console.log('  📋 PRÓXIMOS PASOS para probar el flujo CCP 5×2:')
  console.log('     1. Ir a Nómina → Cálculos de Nómina')
  console.log('     2. Abrir la nómina "1ra Quincena Mayo 2026"')
  console.log(
    '     3. Click en "Procesar Nómina" → se abrirá el diálogo de variables'
  )
  console.log(
    '     4. Ingresar horas_viaje para Carlos y María (p.ej. 12 horas c/u)'
  )
  console.log(
    '     5. Guardar variables → la nómina se procesará automáticamente'
  )
  console.log(
    '     6. Verificar: Carlos y María tienen conceptos A, C, F_TV15, B, D'
  )
  console.log(
    '        Pedro (regular) solo tiene Salario Base + deducciones legales'
  )
}
