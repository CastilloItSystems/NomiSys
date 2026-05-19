import type { PrismaClient } from '../../src/generated/prisma/client.js'
import { DEFAULT_ROLE_PERMISSIONS } from '../../src/shared/constants/permissionRegistry.js'

export default async function seedCompanyRoles(
  prisma: PrismaClient,
  companyId: string
) {
  try {
    for (const [roleName, permissionCodes] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS
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
