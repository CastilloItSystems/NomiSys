// Catálogo de permisos compartido — alineado con PERMISSIONS en backend

export const PERMISSION_GROUPS: {
  label: string;
  icon: string;
  prefix: string;
}[] = [
  { label: "Usuarios", icon: "pi pi-users", prefix: "users" },
  // Nómina
  { label: "Departamentos", icon: "pi pi-sitemap", prefix: "departments" },
  { label: "Posiciones", icon: "pi pi-briefcase", prefix: "positions" },
  { label: "Bancos", icon: "pi pi-credit-card", prefix: "banks" },
  { label: "Empleados", icon: "pi pi-users", prefix: "employees" },
  { label: "Reportes", icon: "pi pi-file", prefix: "reports" },
];

export const PERMISSION_LABELS: Record<string, string> = {
  // Usuarios
  "users.view": "Ver",
  "users.create": "Crear",
  "users.update": "Editar",
  "users.delete": "Eliminar",
  "users.approve": "Aprobar",
  // Nómina: Departamentos
  "departments.view": "Ver departamentos",
  "departments.create": "Crear departamento",
  "departments.update": "Editar departamento",
  "departments.delete": "Eliminar departamento",
  // Nómina: Posiciones/Cargos
  "positions.view": "Ver posiciones",
  "positions.create": "Crear posición",
  "positions.update": "Editar posición",
  "positions.delete": "Eliminar posición",
  // Nómina: Bancos
  "banks.view": "Ver bancos",
  // Nómina: Empleados
  "employees.view": "Ver empleados",
  "employees.create": "Crear empleado",
  "employees.update": "Editar empleado",
  "employees.delete": "Eliminar empleado",
  "employees.approve": "Aprobar cambios de empleado",
  "employees.export": "Exportar empleados",
  // Reportes
  "reports.export": "Exportar reportes",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);
