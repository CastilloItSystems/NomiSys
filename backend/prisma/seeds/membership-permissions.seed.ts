// backend/prisma/seeds/membership-permissions.seed.ts
import type { PrismaClient } from '../../src/generated/prisma/client.js'

export async function seedMembershipPermissions(
  prisma: PrismaClient,
  companyId: string
) {
  const user = await prisma.user.findUnique({
    where: { email: 'viewer@test.com' },
  })

  if (!user) return

  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!membership) return

  const permission = await prisma.permission.findUnique({
    where: { code: 'users.view' },
  })

  if (!permission) return

  await prisma.membershipPermission.upsert({
    where: {
      membershipId_permissionId: {
        membershipId: membership.id,
        permissionId: permission.id,
      },
    },
    update: {
      action: 'GRANT' as any,
      reason: 'Extra permission: users.view',
    },
    create: {
      membershipId: membership.id,
      permissionId: permission.id,
      action: 'GRANT' as any,
      reason: 'Extra permission: users.view',
    },
  })

  console.log('✅ Permission override created for viewer@test.com')
}
