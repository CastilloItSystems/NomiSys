// backend/src/shared/constants/permissions.ts
// Catálogo de permisos del sistema.
// Módulos: Usuarios, Nómina
// Patrón: module.action (ej.: users.view, departments.create)

export const PERMISSIONS = {
  // ── Usuarios ────────────────────────────────────────────────────────────
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_APPROVE: 'users.approve',

  // ── Nómina: Departamentos ───────────────────────────────────────────────
  DEPARTMENTS_VIEW: 'departments.view',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // ── Nómina: Posiciones/Cargos ──────────────────────────────────────────
  POSITIONS_VIEW: 'positions.view',
  POSITIONS_CREATE: 'positions.create',
  POSITIONS_UPDATE: 'positions.update',
  POSITIONS_DELETE: 'positions.delete',

  // ── Nómina: Bancos ─────────────────────────────────────────────────────
  BANKS_VIEW: 'banks.view',

  // ── Nómina: Empleados ──────────────────────────────────────────────────
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',
  EMPLOYEES_APPROVE: 'employees.approve',
  EMPLOYEES_EXPORT: 'employees.export',

  // ── Reportes (compartido) ──────────────────────────────────────────────
  REPORTS_EXPORT: 'reports.export',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
