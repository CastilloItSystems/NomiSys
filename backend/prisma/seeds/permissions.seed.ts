import type { PrismaClient } from '../../src/generated/prisma/client.js'

export const PERMISSIONS = [
  { code: 'users.view', description: 'Ver usuarios' },
  { code: 'users.create', description: 'Crear usuarios' },
  { code: 'users.update', description: 'Actualizar usuarios' },
  { code: 'users.delete', description: 'Eliminar usuarios' },
  { code: 'users.approve', description: 'Aprobar acciones de usuarios' },

  // Nómina - Departamentos
  { code: 'departments.view', description: 'Ver departamentos' },
  { code: 'departments.create', description: 'Crear departamentos' },
  { code: 'departments.update', description: 'Actualizar departamentos' },
  { code: 'departments.delete', description: 'Eliminar departamentos' },

  // Nómina - Posiciones/Cargos
  { code: 'positions.view', description: 'Ver posiciones/cargos' },
  { code: 'positions.create', description: 'Crear posiciones/cargos' },
  { code: 'positions.update', description: 'Actualizar posiciones/cargos' },
  { code: 'positions.delete', description: 'Eliminar posiciones/cargos' },

  // Nómina - Bancos (catálogo global, lectura para todos)
  { code: 'banks.view', description: 'Ver catálogo de bancos' },

  // Nómina - Empleados
  { code: 'employees.view', description: 'Ver empleados' },
  { code: 'employees.create', description: 'Crear empleados' },
  { code: 'employees.update', description: 'Actualizar empleados' },
  { code: 'employees.delete', description: 'Eliminar empleados' },
  {
    code: 'employees.approve',
    description: 'Aprobar cambios de empleados (cédula, etc.)',
  },
  { code: 'employees.export', description: 'Exportar listado de empleados' },
  { code: 'reports.export', description: 'Exportar reportes' },
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
