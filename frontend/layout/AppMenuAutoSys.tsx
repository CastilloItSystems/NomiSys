import { useRefineriaStore } from "@/store/refineriaStore";
import AppSubMenu from "./AppSubMenu";
import type { MenuModel } from "@/types";
import { useNomiSysStore } from "@/store/autoSysStore";
import { useVentasStore } from "@/store/ventasStore";
import { Badge } from "primereact/badge";

const AppMenuNomiSys = () => {
  const { activeNomiSys } = useNomiSysStore();
  const { obtenerEstadisticas } = useVentasStore();
  const estadisticas = obtenerEstadisticas();

  const model: MenuModel[] = [
    // =============================================
    // DASHBOARDS Y OPERACIONES PRINCIPALES
    // =============================================
    {
      label: activeNomiSys?.nombre || "Selecciona un NomiSys",
      icon: "pi pi-home",
      items: [
        {
          label: "Dashboard de Operaciones",
          icon: "pi pi-fw pi-chart-line",
          to: "/nomisys/operation",
        },
        {
          label: "Dashboard de Finanzas",
          icon: "pi pi-fw pi-dollar",
          to: "/nomisys/finance",
        },
        {
          label: "Dashboard de Ventas",
          icon: "pi pi-fw pi-shopping-cart",
          to: "/nomisys/ventas",
          badge:
            estadisticas.pendientes > 0 ? estadisticas.pendientes : undefined,
          badgeClassName: "p-badge-danger",
        },

        {
          label: "Inicio",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
      ],
    },

    // =============================================
    // MÓDULOS
    // =============================================
    {
      label: "modulos",
      icon: "pi pi-fw pi-align-left",
      items: [
        // =============================================
        // MÓDULO: INVENTARIO
        // =============================================
        {
          label: "inventario",
          icon: "pi pi-fw pi-box",
          items: [
            {
              label: "configuraciones",
              icon: "pi pi-fw pi-cog",
              items: [
                {
                  label: "categorias",
                  icon: "pi pi-fw pi-tags",
                  to: "/nomisys/inventario/categorias",
                },
                {
                  label: "marcas",
                  icon: "pi pi-fw pi-flag",
                  to: "/nomisys/inventario/marcas",
                },
                {
                  label: "modelos",
                  icon: "pi pi-fw pi-book",
                  to: "/nomisys/inventario/modelos",
                },
                {
                  label: "unidades de medida",
                  icon: "pi pi-fw pi-box",
                  to: "/nomisys/inventario/unidades",
                },
                {
                  label: "proveedores",
                  icon: "pi pi-fw pi-users",
                  to: "/nomisys/inventario/proveedores",
                },
                {
                  label: "almacenes",
                  icon: "pi pi-fw pi-database",
                  to: "/nomisys/inventario/almacenes",
                },
              ],
            },
            {
              label: "operaciones diarias",
              icon: "pi pi-fw pi-refresh",
              items: [
                {
                  label: "artículos",
                  icon: "pi pi-fw pi-box",
                  to: "/nomisys/inventario/items",
                },
                {
                  label: "stock actual",
                  icon: "pi pi-fw pi-chart-bar",
                  to: "/nomisys/inventario/stock",
                },
                {
                  label: "movimientos",
                  icon: "pi pi-fw pi-history",
                  to: "/nomisys/inventario/movimientos",
                },
              ],
            },
            {
              label: "compras y ventas",
              icon: "pi pi-fw pi-shopping-cart",
              items: [
                {
                  label: "órdenes de compra",
                  icon: "pi pi-fw pi-shopping-cart",
                  to: "/nomisys/inventario/ordenes-compra",
                },
                {
                  label: "recepciones",
                  icon: "pi pi-fw pi-inbox",
                  to: "/nomisys/inventario/recepciones",
                },
                {
                  label: "órdenes de venta",
                  icon: "pi pi-fw pi-money-bill",
                  to: "/nomisys/inventario/ordenes-venta",
                },
                {
                  label: "reservas",
                  icon: "pi pi-fw pi-bookmark",
                  to: "/nomisys/inventario/reservas",
                },
                {
                  label: "notas de salida",
                  icon: "pi pi-fw pi-external-link",
                  to: "/nomisys/inventario/notas-salida",
                },
              ],
            },
            {
              label: "almacén",
              icon: "pi pi-fw pi-warehouse",
              items: [
                {
                  label: "transferencias",
                  icon: "pi pi-arrow-right-arrow-left",
                  to: "/nomisys/inventario/transferencias",
                },
                {
                  label: "ajustes",
                  icon: "pi pi-sliders-h",
                  to: "/nomisys/inventario/ajustes",
                },
                {
                  label: "conteos cíclicos",
                  icon: "pi pi-list-check",
                  to: "/nomisys/inventario/conteos",
                },
                {
                  label: "reconciliaciones",
                  icon: "pi pi-check-square",
                  to: "/nomisys/inventario/reconciliaciones",
                },
              ],
            },
            {
              label: "trazabilidad",
              icon: "pi pi-fw pi-map",
              items: [
                {
                  label: "lotes",
                  icon: "pi pi-fw pi-inbox",
                  to: "/nomisys/inventario/trazabilidad/lotes",
                },
                {
                  label: "números de serie",
                  icon: "pi pi-fw pi-barcode",
                  to: "/nomisys/inventario/trazabilidad/seriales",
                },
              ],
            },
            {
              label: "logística",
              icon: "pi pi-fw pi-truck",
              items: [
                {
                  label: "préstamos",
                  icon: "pi pi-fw pi-bookmark",
                  to: "/nomisys/inventario/prestamos",
                },
                {
                  label: "devoluciones",
                  icon: "pi pi-fw pi-undo",
                  to: "/nomisys/inventario/devoluciones",
                },
              ],
            },
          ],
        },

        // =============================================
        // MÓDULO: CRM (CLIENTES Y VEHÍCULOS)
        // =============================================
        {
          label: "crm",
          icon: "pi pi-fw pi-users",
          items: [
            {
              label: "configuraciones",
              icon: "pi pi-fw pi-cog",
              items: [
                {
                  label: "marcas de vehículos",
                  icon: "pi pi-fw pi-tag",
                  to: "/nomisys/crm/vehiculos/marcas",
                },
                {
                  label: "modelos de vehículos",
                  icon: "pi pi-fw pi-list",
                  to: "/nomisys/crm/vehiculos/modelos",
                },
              ],
            },
            {
              label: "gestión de datos",
              icon: "pi pi-fw pi-database",
              items: [
                {
                  label: "clientes",
                  icon: "pi pi-fw pi-users",
                  to: "/nomisys/crm/clientes",
                },
                {
                  label: "vehículos",
                  icon: "pi pi-fw pi-car",
                  to: "/nomisys/crm/vehiculos/",
                },
              ],
            },
          ],
        },

        // =============================================
        // MÓDULO: TALLER
        // =============================================
        {
          label: "taller",
          icon: "pi pi-fw pi-wrench",
          items: [
            {
              label: "configuraciones",
              icon: "pi pi-fw pi-cog",
              items: [
                {
                  label: "categorías de servicios",
                  icon: "pi pi-fw pi-tags",
                  to: "/nomisys/workshop/service-categories",
                },
                {
                  label: "subcategorías de servicios",
                  icon: "pi pi-fw pi-tag",
                  to: "/nomisys/workshop/service-subcategories",
                },
                {
                  label: "estados de órdenes",
                  icon: "pi pi-fw pi-tags",
                  to: "/nomisys/workshop/work-order-statuses",
                },
                {
                  label: "servicios",
                  icon: "pi pi-fw pi-cog",
                  to: "/nomisys/workshop/services",
                },
              ],
            },
            {
              label: "operaciones diarias",
              icon: "pi pi-fw pi-refresh",
              items: [
                {
                  label: "bahías de servicio",
                  icon: "pi pi-fw pi-cog",
                  to: "/nomisys/operation/service-bays",
                },
                {
                  label: "dashboard órdenes de trabajo",
                  icon: "pi pi-fw pi-chart-line",
                  to: "/nomisys/operation/workshop",
                },
                {
                  label: "gestión órdenes de trabajo",
                  icon: "pi pi-fw pi-file-edit",
                  to: "/nomisys/workshop",
                },
                {
                  label: "gestión de puestos",
                  icon: "pi pi-fw pi-sitemap",
                  to: "/nomisys/workshop/service-bays",
                },
              ],
            },
            {
              label: "facturación y pagos",
              icon: "pi pi-fw pi-dollar",
              items: [
                {
                  label: "facturas",
                  icon: "pi pi-fw pi-file",
                  to: "/nomisys/workshop/invoices",
                },
                {
                  label: "pagos",
                  icon: "pi pi-fw pi-money-bill",
                  to: "/nomisys/workshop/payments",
                },
              ],
            },
          ],
        },

        // =============================================
        // MÓDULO: CONCESIONARIO
        // =============================================
        {
          label: "concesionario",
          icon: "pi pi-fw pi-car",
          items: [
            {
              label: "dashboard",
              icon: "pi pi-fw pi-chart-line",
              to: "/nomisys/concesionario",
            },
            {
              label: "inventario de vehículos",
              icon: "pi pi-fw pi-car",
              to: "/nomisys/concesionario/vehicles",
            },
            {
              label: "cotizaciones",
              icon: "pi pi-fw pi-file-text",
              to: "/nomisys/concesionario/quotes",
            },
            {
              label: "financiamiento",
              icon: "pi pi-fw pi-money-bill",
              to: "/nomisys/concesionario/financing",
            },
          ],
        },

        // =============================================
        // MÓDULO: FINANZAS
        // =============================================
        {
          label: "finanzas",
          icon: "pi pi-fw pi-dollar",
          items: [
            {
              label: "análisis financiero",
              icon: "pi pi-fw pi-chart-line",
              items: [
                {
                  label: "dashboard financiero",
                  icon: "pi pi-fw pi-chart-line",
                  to: "/nomisys/finance",
                },
              ],
            },
            {
              label: "gestión de cuentas",
              icon: "pi pi-fw pi-wallet",
              items: [
                {
                  label: "cuentas por cobrar",
                  icon: "pi pi-fw pi-arrow-up",
                  to: "/nomisys/finance/cuentas-cobrar",
                },
                {
                  label: "cuentas por pagar",
                  icon: "pi pi-fw pi-arrow-down",
                  to: "/nomisys/finance/cuentas-pagar",
                },
              ],
            },
          ],
        },

        // =============================================
        // MÓDULO: CONFIGURACIÓN GENERAL
        // =============================================
        {
          label: "configuracion",
          icon: "pi pi-fw pi-cog",
          items: [
            {
              label: "sistema",
              icon: "pi pi-fw pi-server",
              items: [
                {
                  label: "configuración general",
                  icon: "pi pi-fw pi-cog",
                  to: "/nomisys/configuracion/general",
                },
                {
                  label: "usuarios y permisos",
                  icon: "pi pi-fw pi-users",
                  to: "/nomisys/configuracion/usuarios",
                },
              ],
            },
            {
              label: "reportes y analíticas",
              icon: "pi pi-fw pi-chart-bar",
              items: [
                {
                  label: "reportes financieros",
                  icon: "pi pi-fw pi-file-pdf",
                  to: "/nomisys/reportes/financieros",
                },
                {
                  label: "reportes de operaciones",
                  icon: "pi pi-fw pi-chart-line",
                  to: "/nomisys/reportes/operaciones",
                },
                {
                  label: "reportes de inventario",
                  icon: "pi pi-fw pi-box",
                  to: "/nomisys/reportes/inventario",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return <AppSubMenu model={model} />;
};

export default AppMenuNomiSys;
