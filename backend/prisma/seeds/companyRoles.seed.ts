import type { PrismaClient } from '../../src/generated/prisma/client.js'

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.approve',
    'departments.view',
    'departments.create',
    'departments.update',
    'departments.delete',
    'positions.view',
    'positions.create',
    'positions.update',
    'positions.delete',
    'banks.view',
    'employees.view',
    'employees.create',
    'employees.update',
    'employees.delete',
    'employees.approve',
    'employees.export',
    'reports.export',
  ],
  ADMIN: [
    'users.view',
    'users.create',
    'users.update',
    'users.approve',
    'departments.view',
    'departments.create',
    'departments.update',
    'departments.delete',
    'positions.view',
    'positions.create',
    'positions.update',
    'positions.delete',
    'banks.view',
    'employees.view',
    'employees.create',
    'employees.update',
    'employees.delete',
    'employees.approve',
    'employees.export',
    'reports.export',
  ],
  GERENTE: [
    'users.view',
    'departments.view',
    'departments.create',
    'departments.update',
    'positions.view',
    'positions.create',
    'positions.update',
    'banks.view',
    'employees.view',
    'employees.create',
    'employees.update',
    'employees.export',
    'reports.export',
  ],
  ALMACENISTA: ['users.view', 'banks.view', 'employees.view'],
  VENDEDOR: ['users.view', 'banks.view', 'employees.view'],
  VIEWER: [
    'users.view',
    'departments.view',
    'positions.view',
    'banks.view',
    'employees.view',
  ],
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
