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
        fax: null,
        rif: 'J-000000000',
        nit: null,
        website: null,
        email: 'camabar.rep.serv.admon@gmail.com',
        contact: 'CARLOS ANDRES PEREZ RODRIGUEZ',
        isDefault: true,
        support1: null,
        support2: null,
        support3: null,
        usesWeb: false,
        dbServer: null,
        dbUser: null,
        dbPassword: null,
        dbPort: null,
        license: null,
        archived: false,
        additionalInfo: null,
        usesPrefix: false,
        prefixName: null,
        dbPrefix: null,
        serverPrefix: null,
        userPrefix: null,
        deleted: false,
      },
      create: {
        id: 'camabarca-001',
        name: 'CAMIONES Y MAQUINARIAS BARCELONA C.A. (CAMABARCA)',
        address:
          'AV ROMULO BETANCOURT. BARCELONA-CARACAS EDIF CAMABAR PISO PB LOCAL N/A SECTOR LA PONDEROSA. ENTRADA A LAS VILLAS OLIMPICAS BARCELONA ANZOATEGUI ZONA POSTAL 6001',
        phones: '0424.847.87.47',
        fax: null,
        rif: 'J-000000000',
        nit: null,
        website: null,
        email: 'camabar.rep.serv.admon@gmail.com',
        contact: 'CARLOS ANDRES PEREZ RODRIGUEZ',
        isDefault: true,
        support1: null,
        support2: null,
        support3: null,
        usesWeb: false,
        dbServer: null,
        dbUser: null,
        dbPassword: null,
        dbPort: null,
        license: null,
        archived: false,
        additionalInfo: null,
        usesPrefix: false,
        prefixName: null,
        dbPrefix: null,
        serverPrefix: null,
        userPrefix: null,
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
