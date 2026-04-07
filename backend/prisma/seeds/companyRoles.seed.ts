import type { PrismaClient } from '../../src/generated/prisma/client.js'

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.approve',
  ],
  ADMIN: ['users.view', 'users.create', 'users.update', 'users.approve'],
  GERENTE: ['users.view', 'users.update'],
  ALMACENISTA: ['users.view'],
  VENDEDOR: ['users.view'],
  VIEWER: ['users.view'],
}

export default async function seedCompanyRoles(
  prisma: PrismaClient,
  companyId: string
) {
  try {
    for (const [roleName, permissionCodes] of Object.entries(
      ROLE_PERMISSIONS
    )) {
      const role = await prisma.companyRole.upsert({
        where: {
          name_companyId: {
            name: roleName,
            companyId,
          },
        },
        update: {
          description: `Role ${roleName}`,
          isSystem: true,
        },
        create: {
          name: roleName,
          description: `Role ${roleName}`,
          companyId,
          isSystem: true,
        },
      })

      await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })

      for (const code of permissionCodes) {
        const permission = await prisma.permission.findUnique({
          where: { code },
        })

        if (!permission) {
          console.warn(`⚠️ Permission not found: ${code}`)
          continue
        }

        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      }

      console.log(`✅ Role created: ${role.name}`)
    }

    console.log('✅ Company roles seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding company roles:', error)
    throw error
  }
}
