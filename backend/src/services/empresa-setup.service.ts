/**
 * empresa-setup.service.ts
 *
 * Initializes the global Permission catalog and creates default system roles
 * for a newly created (or existing) Empresa. Called on app startup and on
 * empresa creation so the system never ends up in an inconsistent state.
 */

import prisma from './prisma.service.js'

// ── Global permission catalog ──────────────────────────────────────────────

export const PERMISSION_CATALOG = [
  // Usuarios
  { code: 'users.view', description: 'Ver usuarios' },
  { code: 'users.create', description: 'Crear usuarios' },
  { code: 'users.update', description: 'Actualizar usuarios' },
  { code: 'users.delete', description: 'Eliminar usuarios' },
  { code: 'users.approve', description: 'Aprobar acciones de usuarios' },

  // Nómina: Departamentos
  { code: 'departments.view', description: 'Ver departamentos' },
  { code: 'departments.create', description: 'Crear departamentos' },
  { code: 'departments.update', description: 'Actualizar departamentos' },
  { code: 'departments.delete', description: 'Eliminar departamentos' },

  // Nómina: Posiciones/Cargos
  { code: 'positions.view', description: 'Ver posiciones/cargos' },
  { code: 'positions.create', description: 'Crear posiciones/cargos' },
  { code: 'positions.update', description: 'Actualizar posiciones/cargos' },
  { code: 'positions.delete', description: 'Eliminar posiciones/cargos' },

  // Nómina: Bancos (catálogo global, lectura para todos)
  { code: 'banks.view', description: 'Ver catálogo de bancos' },

  // Nómina: Empleados
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

// ── Default system roles per empresa ──────────────────────────────────────

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
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

// ── Public helpers ─────────────────────────────────────────────────────────

/**
 * Ensures the global Permission catalog is present in the database.
 * Safe to call multiple times — uses upsert (idempotent).
 */
export async function ensurePermissionCatalog(): Promise<void> {
  for (const perm of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    })
  }
}

/**
 * Creates (or re-syncs) the default system roles for an empresa.
 * Requires the Permission catalog to already exist — call
 * `ensurePermissionCatalog()` first if unsure.
 *
 * Safe to call on existing empresas: roles are upserted and their
 * permissions are fully replaced each time (re-sync).
 */
export async function seedDefaultRolesForEmpresa(
  companyId: string
): Promise<void> {
  // Fetch all permission records once for efficiency
  const allPermissions = await prisma.permission.findMany({
    select: { id: true, code: true },
  })
  const permByCode = new Map(allPermissions.map((p) => [p.code, p.id]))

  for (const [roleName, permissionCodes] of Object.entries(
    DEFAULT_ROLE_PERMISSIONS
  )) {
    const role = await prisma.companyRole.upsert({
      where: { name_companyId: { name: roleName, companyId } },
      update: { description: `${roleName} role`, isSystem: true },
      create: {
        name: roleName,
        description: `${roleName} role`,
        companyId,
        isSystem: true,
      },
    })

    // Re-sync permissions (delete all, recreate)
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })

    const permissionData = permissionCodes
      .filter((code) => permByCode.has(code))
      .map((code) => ({ roleId: role.id, permissionId: permByCode.get(code)! }))

    if (permissionData.length > 0) {
      await prisma.rolePermission.createMany({ data: permissionData })
    }
  }
}
