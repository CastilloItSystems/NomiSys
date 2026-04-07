import AppSubMenu from "./AppSubMenu";
import type { MenuModel } from "@/types";
import { useEmpresasStore } from "@/store/empresasStore";

const AppMenuEmpresa = () => {
  const { activeEmpresa } = useEmpresasStore();

  const model: MenuModel[] = [
    // ── INICIO ──
    {
      label: activeEmpresa?.prefixName || "Selecciona una Empresa",
      icon: "pi pi-home",
      items: [
        {
          label: "Inicio",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
        {
          label: "Dashboard de Nómina",
          icon: "pi pi-fw pi-chart-line",
          to: "/empresa/nomina",
        },
      ],
    },

    // ── NÓMINA ──
    {
      label: "Nómina",
      icon: "pi pi-fw pi-id-card",
      items: [
        {
          label: "Dashboard de Nómina",
          icon: "pi pi-fw pi-chart-line",
          to: "/empresa/nomina",
        },
        {
          label: "Empleados",
          icon: "pi pi-fw pi-users",
          items: [
            {
              label: "Lista de Empleados",
              icon: "pi pi-fw pi-user",
              to: "/empresa/nomina/empleados",
            },
            {
              label: "Departamentos",
              icon: "pi pi-fw pi-sitemap",
              to: "/empresa/nomina/departamentos",
            },
            {
              label: "Cargos",
              icon: "pi pi-fw pi-briefcase",
              to: "/empresa/nomina/cargos",
            },
          ],
        },
        {
          label: "Período de Nómina",
          icon: "pi pi-fw pi-calendar",
          items: [
            {
              label: "Períodos",
              icon: "pi pi-fw pi-calendar-plus",
              to: "/empresa/nomina/periodos",
            },
            {
              label: "Cálculo de Nómina",
              icon: "pi pi-fw pi-calculator",
              to: "/empresa/nomina/calculo",
            },
            {
              label: "Comprobantes de Pago",
              icon: "pi pi-fw pi-file-pdf",
              to: "/empresa/nomina/comprobantes",
            },
          ],
        },
        {
          label: "Tiempo y Asistencia",
          icon: "pi pi-fw pi-clock",
          items: [
            {
              label: "Asistencia",
              icon: "pi pi-fw pi-check-circle",
              to: "/empresa/nomina/asistencia",
            },
            {
              label: "Horas Extra",
              icon: "pi pi-fw pi-plus-circle",
              to: "/empresa/nomina/horas-extra",
            },
            {
              label: "Vacaciones",
              icon: "pi pi-fw pi-sun",
              to: "/empresa/nomina/vacaciones",
            },
            {
              label: "Permisos",
              icon: "pi pi-fw pi-file-edit",
              to: "/empresa/nomina/permisos",
            },
          ],
        },
        {
          label: "Deducciones y Beneficios",
          icon: "pi pi-fw pi-dollar",
          items: [
            {
              label: "Conceptos Salariales",
              icon: "pi pi-fw pi-list",
              to: "/empresa/nomina/conceptos",
            },
            {
              label: "Deducciones",
              icon: "pi pi-fw pi-minus-circle",
              to: "/empresa/nomina/deducciones",
            },
            {
              label: "Préstamos",
              icon: "pi pi-fw pi-money-bill",
              to: "/empresa/nomina/prestamos",
            },
          ],
        },
        {
          label: "Reportes",
          icon: "pi pi-fw pi-chart-bar",
          items: [
            {
              label: "Resumen de Nómina",
              icon: "pi pi-fw pi-th-large",
              to: "/empresa/nomina/reportes",
            },
            {
              label: "Reporte Fiscal",
              icon: "pi pi-fw pi-file-text",
              to: "/empresa/nomina/reportes/fiscal",
            },
            {
              label: "Historial de Pagos",
              icon: "pi pi-fw pi-history",
              to: "/empresa/nomina/reportes/historial",
            },
          ],
        },
        {
          label: "Configuración",
          icon: "pi pi-fw pi-cog",
          items: [
            {
              label: "Tipos de Contrato",
              icon: "pi pi-fw pi-file",
              to: "/empresa/nomina/config/contratos",
            },
            {
              label: "Configuración Salarial",
              icon: "pi pi-fw pi-sliders-h",
              to: "/empresa/nomina/config/salarios",
            },
            {
              label: "Períodos de Pago",
              icon: "pi pi-fw pi-calendar",
              to: "/empresa/nomina/config/periodos-pago",
            },
          ],
        },
      ],
    },

    // ── CONFIGURACIÓN ──
    {
      label: "Configuración",
      icon: "pi pi-fw pi-cog",
      items: [
        {
          label: "General",
          icon: "pi pi-fw pi-cog",
          to: "/empresa/configuracion/general",
        },
        {
          label: "Usuarios y Permisos",
          icon: "pi pi-fw pi-users",
          to: "/empresa/configuracion/usuarios",
        },
        {
          label: "Catálogo",
          icon: "pi pi-fw pi-tags",
          items: [
            {
              label: "Categorías",
              icon: "pi pi-fw pi-tags",
              to: "/empresa/inventario/categorias",
            },
            {
              label: "Marcas",
              icon: "pi pi-fw pi-flag",
              to: "/empresa/inventario/marcas",
            },
            {
              label: "Modelos",
              icon: "pi pi-fw pi-book",
              to: "/empresa/inventario/modelos",
            },
            {
              label: "Compatibilidad",
              icon: "pi pi-fw pi-th-large",
              to: "/empresa/inventario/compatibilidad",
            },
            {
              label: "Unidades de Medida",
              icon: "pi pi-fw pi-box",
              to: "/empresa/inventario/unidades",
            },
          ],
        },
      ],
    },
  ];

  return <AppSubMenu model={model} />;
};

export default AppMenuEmpresa;
