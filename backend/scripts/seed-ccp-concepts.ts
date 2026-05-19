/**
 * Seed CCP (Contrato Colectivo Petrolero) concepts for 5x2 system
 * Run with: npx ts-node --esm scripts/seed-ccp-concepts.ts
 */

import prisma from '../src/services/prisma.service.js'

// Contract type for 5x2 system
const CONTRACT_TYPE_5X2 = '5x2'
const CONTRACT_TYPE_7X7 = '7x7'
const CONTRACT_TYPE_4X4 = '4x4'
const CONTRACT_TYPE_5_5_5_6 = '5-5-5-6'

// CCP Universal Concepts (apply to all systems)
const UNIVERSAL_CONCEPTS = [
  {
    code: 'HE',
    name: 'Horas Extraordinarias',
    type: 'Ingreso',
    description: 'Horas extras según Cláusula 23.a. Se aplica la más favorable entre SB*1.93 y SN*1.66',
    isTaxable: true,
    formula: 'max((salario_basico / horas_jornada) * 1.93 * horas_extras, (salario_diario * 1.66 * horas_extras))',
    executionOrder: 100,
    inputVars: ['horas_extras'],
  },
  {
    code: 'TV',
    name: 'Tiempo de Viaje',
    type: 'Ingreso',
    description: 'TV ≤ 1.5h: (SB/8)*1.52*N. TV > 1.5h: tramo1 + (SB/8)*1.77*(N-1.5)',
    isTaxable: true,
    formula: 'horas_viaje <= 1.5 ? (salario_basico / 8) * 1.52 * horas_viaje : ((salario_basico / 8) * 1.52 * 1.5) + ((salario_basico / 8) * 1.77 * (horas_viaje - 1.5))',
    executionOrder: 110,
    inputVars: ['horas_viaje'],
  },
  {
    code: 'TVN',
    name: 'TV Nocturno Adicional',
    type: 'Ingreso',
    description: 'Adicional por TV entre 6pm-6am: (SB/8)*0.38*horas',
    isTaxable: true,
    formula: '(salario_basico / 8) * 0.38 * horas_viaje_nocturno',
    executionOrder: 115,
    inputVars: ['horas_viaje_nocturno'],
  },
]

// 5x2 System Concepts
const CONCEPTS_5X2 = [
  {
    code: 'A',
    name: 'Días Trabajados (5x2)',
    type: 'Ingreso',
    description: 'Salario básico por días trabajados en sistema 5x2 (5 días)',
    isTaxable: true,
    formula: 'salario_diario * 5',
    executionOrder: 10,
    inputVars: [],
  },
  {
    code: 'C',
    name: 'Prima Especial 5x2',
    type: 'Ingreso',
    description: 'Prima por sistema 5x2: 2.5 días de SB (Cláusula 61)',
    isTaxable: true,
    formula: 'salario_diario * 2.5',
    executionOrder: 20,
    inputVars: [],
  },
  {
    code: 'B',
    name: 'Prima Dominical',
    type: 'Ingreso',
    description: '1.5 días sobre SN calculado (A+C+F)/dias_trabajados * 1.5',
    isTaxable: true,
    formula: 'dias_trabajados > 0 ? ((A + C + F) / dias_trabajados) * 1.5 : 0',
    executionOrder: 30,
    inputVars: [],
  },
  {
    code: 'F',
    name: 'Tiempo de Viaje Semanal',
    type: 'Ingreso',
    description: 'TV semanal integrado para 5x2',
    isTaxable: true,
    formula: 'TV',
    executionOrder: 25,
    inputVars: [],
  },
  {
    code: 'D',
    name: 'Descanso Legal (5x2)',
    type: 'Ingreso',
    description: '1 día descanso legal sobre SN: (A+B+C+F)/dias_trabajados * 1',
    isTaxable: true,
    formula: 'dias_trabajados > 0 ? ((A + B + C + F) / dias_trabajados) * 1 : 0',
    executionOrder: 40,
    inputVars: [],
  },
  {
    code: 'E',
    name: 'Descanso Contractual (5x2)',
    type: 'Ingreso',
    description: '1 día descanso contractual sobre SN',
    isTaxable: true,
    formula: 'dias_trabajados > 0 ? ((A + B + C + D + F) / dias_trabajados) * 1 : 0',
    executionOrder: 50,
    inputVars: [],
  },
  {
    code: 'G',
    name: 'Bono Nocturno (5x2)',
    type: 'Ingreso',
    description: '38% sobre SN/hora por horas nocturnas trabajadas',
    isTaxable: true,
    formula: 'salario_hora * 0.38 * horas_bono_nocturno',
    executionOrder: 60,
    inputVars: ['horas_bono_nocturno'],
  },
  {
    code: 'H',
    name: 'TEG - Tiempo Extra Guardia (5x2)',
    type: 'Ingreso',
    description: 'Completar jornada mixta/nocturna. Más favorable: SB*1.81 o SN*1.66',
    isTaxable: true,
    formula: 'max((salario_basico / horas_jornada) * 1.81 * horas_teg, (salario_diario / horas_jornada) * 1.66 * horas_teg)',
    executionOrder: 65,
    inputVars: ['horas_teg'],
  },
]

// 7x7 System Concepts (12-hour shifts)
const CONCEPTS_7X7 = [
  {
    code: 'A7',
    name: 'Días Trabajados (7x7)',
    type: 'Ingreso',
    description: '7 días trabajados jornada 12h',
    isTaxable: true,
    formula: 'salario_diario * 7',
    executionOrder: 10,
    inputVars: [],
  },
  {
    code: 'C7',
    name: 'Prima Especial 7x7',
    type: 'Ingreso',
    description: 'Prima sistema 7x7 según Cláusula 61',
    isTaxable: true,
    formula: 'salario_diario * 3',
    executionOrder: 20,
    inputVars: [],
  },
  {
    code: 'B7',
    name: 'Prima Dominical (7x7)',
    type: 'Ingreso',
    description: 'Prima dominical sobre SN en sistema 7x7',
    isTaxable: true,
    formula: 'dias_trabajados > 0 ? ((A7 + C7) / dias_trabajados) * 1.5 : 0',
    executionOrder: 30,
    inputVars: [],
  },
  {
    code: 'G7',
    name: 'Bono Nocturno (7x7)',
    type: 'Ingreso',
    description: 'Bono nocturno para guardia 12h',
    isTaxable: true,
    formula: 'salario_hora * 0.38 * horas_bono_nocturno',
    executionOrder: 40,
    inputVars: ['horas_bono_nocturno'],
  },
]

async function seedCCPConcepts(companyId: string) {
  console.log(`Seeding CCP concepts for company: ${companyId}`)

  // Create or find contract types
  const contractTypes = [
    { id: CONTRACT_TYPE_5X2, name: 'Sistema 5x2', description: '5 días trabajo + 2 descanso' },
    { id: CONTRACT_TYPE_7X7, name: 'Sistema 7x7', description: '7 días trabajo + 7 descanso (12h)' },
    { id: CONTRACT_TYPE_4X4, name: 'Sistema 4x4', description: '4 días trabajo + 4 descanso (12h)' },
    { id: CONTRACT_TYPE_5_5_5_6, name: 'Sistema 5-5-5-6', description: '3 sem 5d + 1 sem 6d' },
  ]

  for (const ct of contractTypes) {
    await prisma.contractType.upsert({
      where: { companyId_code: { companyId, code: ct.id } },
      create: { companyId, code: ct.id, name: ct.name, description: ct.description },
      update: { name: ct.name, description: ct.description },
    })
  }
  console.log('✓ Contract types created')

  // Seed universal concepts first
  for (const concept of UNIVERSAL_CONCEPTS) {
    await prisma.salaryConcept.upsert({
      where: { companyId_code: { companyId, code: concept.code } },
      create: { ...concept, companyId, contractTypeId: null },
      update: { ...concept, contractTypeId: null },
    })
  }
  console.log('✓ Universal concepts created')

  // Seed 5x2 concepts
  const ct5x2 = await prisma.contractType.findUnique({
    where: { companyId_code: { companyId, code: CONTRACT_TYPE_5X2 } },
  })
  if (ct5x2) {
    for (const concept of CONCEPTS_5X2) {
      await prisma.salaryConcept.upsert({
        where: { companyId_code: { companyId, code: concept.code } },
        create: { ...concept, companyId, contractTypeId: ct5x2.id },
        update: { ...concept, contractTypeId: ct5x2.id },
      })
    }
    console.log('✓ 5x2 concepts created')
  }

  // Seed 7x7 concepts
  const ct7x7 = await prisma.contractType.findUnique({
    where: { companyId_code: { companyId, code: CONTRACT_TYPE_7X7 } },
  })
  if (ct7x7) {
    for (const concept of CONCEPTS_7X7) {
      await prisma.salaryConcept.upsert({
        where: { companyId_code: { companyId, code: concept.code } },
        create: { ...concept, companyId, contractTypeId: ct7x7.id },
        update: { ...concept, contractTypeId: ct7x7.id },
      })
    }
    console.log('✓ 7x7 concepts created')
  }

  console.log('\n✅ CCP concepts seeding completed!')
}

// Get companyId from command line or use first company
async function main() {
  const companyId = process.argv[2]
  
  if (!companyId) {
    const firstCompany = await prisma.company.findFirst()
    if (!firstCompany) {
      console.error('No companies found. Please provide a companyId as argument.')
      process.exit(1)
    }
    await seedCCPConcepts(firstCompany.id)
  } else {
    await seedCCPConcepts(companyId)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
