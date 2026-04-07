import 'dotenv/config'
import { PrismaClient } from '../../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

import seedCompanies from './empresas.seed.js'
import seedPermissions from './permissions.seed.js'
import seedCompanyRoles from './companyRoles.seed.js'
import seedUsers from './users.seed.js'
import seedMemberships from './memberships.seed.js'
import { seedMembershipPermissions } from './membership-permissions.seed.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n')

    // Phase 1: Create company
    const companyId = await seedCompanies(prisma)
    console.log('')

    // Phase 2: Create global permissions
    await seedPermissions(prisma)
    console.log('')

    // Phase 3: Create roles per company + assign permissions
    await seedCompanyRoles(prisma, companyId)
    console.log('')

    // Phase 4: Global users
    await seedUsers(prisma)
    console.log('')

    // Phase 5: Memberships user-company-role
    await seedMemberships(prisma, companyId)
    console.log('')

    // Phase 6: Per-membership permission overrides
    await seedMembershipPermissions(prisma, companyId)
    console.log('')

    console.log('\n🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
