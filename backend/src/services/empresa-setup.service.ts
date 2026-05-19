/**
 * empresa-setup.service.ts
 *
 * Initializes the global Permission catalog and creates default system roles
 * for a newly created (or existing) Empresa. Called on app startup and on
 * empresa creation so the system never ends up in an inconsistent state.
 */

import prisma from './prisma.service.js'
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATALOG,
} from '../shared/constants/permissionRegistry.js'

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
