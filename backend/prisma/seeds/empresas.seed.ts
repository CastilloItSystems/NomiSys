import type { PrismaClient } from '../../src/generated/prisma/client.js'

async function seedCompanies(prisma: PrismaClient): Promise<string> {
  try {
    console.log('🌱 Starting companies seed...\n')

    const companyDemo = await prisma.company.upsert({
      where: { id: 'camabarca-001' },
      update: {
        name: 'CAMIONES Y MAQUINARIAS BARCELONA C.A. (CAMABARCA)',
        address:
          'AV ROMULO BETANCOURT. BARCELONA-CARACAS EDIF CAMABAR PISO PB LOCAL N/A SECTOR LA PONDEROSA. ENTRADA A LAS VILLAS OLIMPICAS BARCELONA ANZOATEGUI ZONA POSTAL 6001',
        phones: '0424.847.87.47',
        email: 'camabar.rep.serv.admon@gmail.com',
        contact: 'CARLOS ANDRES PEREZ RODRIGUEZ',
        isDefault: true,
        deleted: false,
      },
      create: {
        id: 'camabarca-001',
        name: 'CAMIONES Y MAQUINARIAS BARCELONA C.A. (CAMABARCA)',
        address:
          'AV ROMULO BETANCOURT. BARCELONA-CARACAS EDIF CAMABAR PISO PB LOCAL N/A SECTOR LA PONDEROSA. ENTRADA A LAS VILLAS OLIMPICAS BARCELONA ANZOATEGUI ZONA POSTAL 6001',
        phones: '0424.847.87.47',
        email: 'camabar.rep.serv.admon@gmail.com',
        contact: 'CARLOS ANDRES PEREZ RODRIGUEZ',
        isDefault: true,
        deleted: false,
      },
    })

    console.log(`✅ Company created/updated: ${companyDemo.name}`)
    console.log(`   ID: ${companyDemo.id}`)
    console.log(`   Email: ${companyDemo.email}`)
    console.log('\n✅ Companies seeded successfully!')

    return companyDemo.id
  } catch (error) {
    console.error('❌ Error seeding companies:', error)
    throw error
  }
}

export default seedCompanies
