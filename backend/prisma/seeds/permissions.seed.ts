import type { PrismaClient } from '../../src/generated/prisma/client.js'

export const PERMISSIONS = [
  { code: 'users.view', description: 'Ver usuarios' },
  { code: 'users.create', description: 'Crear usuarios' },
  { code: 'users.update', description: 'Actualizar usuarios' },
  { code: 'users.delete', description: 'Eliminar usuarios' },
  { code: 'users.approve', description: 'Aprobar acciones de usuarios' },
]

export default async function seedPermissions(prisma: PrismaClient) {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    })
  }

  console.log(`✅ ${PERMISSIONS.length} permisos sembrados`)
}
