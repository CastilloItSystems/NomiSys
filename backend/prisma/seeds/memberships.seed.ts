import type { PrismaClient } from '../../src/generated/prisma/client.js'

const USER_ROLE_ASSIGNMENTS = [
  { email: 'owner@test.com', roleName: 'OWNER' },
  { email: 'admin@test.com', roleName: 'ADMIN' },
  { email: 'gerente@test.com', roleName: 'GERENTE' },
  { email: 'vendedor@test.com', roleName: 'VENDEDOR' },
  { email: 'almacenista@test.com', roleName: 'ALMACENISTA' },
  { email: 'viewer@test.com', roleName: 'VIEWER' },
]

export default async function seedMemberships(
  prisma: PrismaClient,
  companyId: string
) {
  try {
    for (const assignment of USER_ROLE_ASSIGNMENTS) {
      const user = await prisma.user.findUnique({
        where: { email: assignment.email },
      })

      if (!user) {
        console.warn(`⚠️ User not found: ${assignment.email}`)
        continue
      }

      const role = await prisma.companyRole.findFirst({
        where: {
          companyId,
          name: assignment.roleName,
        },
      })

      if (!role) {
        console.warn(`⚠️ Role not found: ${assignment.roleName}`)
        continue
      }

      await prisma.membership.upsert({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId,
          },
        },
        update: {
          roleId: role.id,
          status: 'active' as any,
        },
        create: {
          userId: user.id,
          companyId,
          roleId: role.id,
          status: 'active' as any,
        },
      })

      console.log(
        `✅ Membership created: ${assignment.email} -> ${assignment.roleName}`
      )
    }

    console.log('✅ Memberships seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding memberships:', error)
    throw error
  }
}
