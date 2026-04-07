# 🏭 Módulo de Puestos de Servicio (Service Bays)

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características](#características)
3. [Estructura del Módulo](#estructura-del-módulo)
4. [Modelos de Datos](#modelos-de-datos)
5. [API Service](#api-service)
6. [Componentes](#componentes)
7. [Validaciones](#validaciones)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Integración con Backend](#integración-con-backend)
10. [Rutas y Navegación](#rutas-y-navegación)

---

## 📖 Descripción General

El módulo de **Puestos de Servicio** permite gestionar las bahías de trabajo del taller, controlando:

- **Bahías de servicio** (puestos físicos de trabajo)
- **Asignaciones de técnicos** a bahías y órdenes de trabajo
- **Seguimiento de tiempos** de entrada/salida
- **Reportes** de utilización y horas trabajadas
- **Historial** completo de ocupación

### Casos de Uso

✅ Crear y configurar bahías de trabajo  
✅ Asignar vehículos y técnicos a bahías específicas  
✅ Controlar disponibilidad en tiempo real  
✅ Generar reportes de utilización  
✅ Gestionar equipamiento por bahía  
✅ Mantener historial de trabajos realizados

---

## ✨ Características

### Gestión de Bahías

- **8 Áreas de Especialización**:

  - Mecánica
  - Electricidad
  - Pintura
  - Latonería
  - Diagnóstico
  - Cambio de Aceite
  - Múltiple (uso general)

- **4 Estados**:

  - 🟢 Disponible
  - 🟡 Ocupado
  - 🔵 Mantenimiento
  - 🔴 Fuera de Servicio

- **5 Capacidades**:
  - Individual (1 vehículo pequeño)
  - Pequeña (1 vehículo mediano)
  - Mediana (1 vehículo grande)
  - Grande (2 vehículos medianos)
  - Múltiple (3+ vehículos pequeños)

### Características Técnicas

- ✅ CRUD completo con validación
- ✅ Códigos únicos para cada bahía
- ✅ Configuración de equipamiento
- ✅ Control de capacidad de técnicos
- ✅ Soft delete (eliminación lógica)
- ✅ Orden personalizado de visualización
- ✅ Búsqueda y filtrado avanzado
- ✅ Integración con órdenes de trabajo
- ✅ Dashboard en tiempo real
- ✅ Reportes detallados

---

## 🗂️ Estructura del Módulo

```
taller-template-web/
├── libs/
│   ├── interfaces/
│   │   └── workshop/
│   │       └── serviceBay.interface.ts       # Interfaces y tipos
│   └── zods/
│       └── workshop/
│           └── serviceBaySchemas.ts          # Schemas de validación
├── app/
│   ├── api/
│   │   └── serviceBayService.ts              # Servicio API
│   └── (main)/
│       └── nomisys/
│           └── operation/
│               └── service-bays/
│                   └── page.tsx              # Página principal
└── components/
    └── workshop/
        └── service-bays/
            ├── ServiceBayList.tsx            # Lista/Tabla
            └── ServiceBayForm.tsx            # Formulario
```

---

## 📊 Modelos de Datos

### ServiceBay (Bahía de Servicio)

```typescript
interface ServiceBay {
  _id: string; // ID único
  name: string; // Nombre descriptivo
  code: string; // Código único (ej: "MEC-01")
  area: BayArea; // Área de especialización
  status: BayStatus; // Estado actual
  capacity: BayCapacity; // Capacidad física
  maxTechnicians: number; // Máximo de técnicos simultáneos
  equipment: string[]; // Equipo disponible
  currentWorkOrder?: string; // Orden de trabajo actual
  currentTechnicians: CurrentTechnician[]; // Técnicos actuales
  occupiedSince?: Date; // Desde cuándo está ocupada
  estimatedEndTime?: Date; // Hora estimada de finalización
  isActive: boolean; // Si está habilitada
  order: number; // Orden de visualización
  notes?: string; // Notas adicionales
  eliminado: boolean; // Soft delete
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Última actualización
}
```

### Tipos y Enums

```typescript
// Áreas de especialización
type BayArea =
  | "mecanica"
  | "electricidad"
  | "pintura"
  | "latoneria"
  | "diagnostico"
  | "cambio_aceite"
  | "multiple";

// Estados de la bahía
type BayStatus = "disponible" | "ocupado" | "mantenimiento" | "fuera_servicio";

// Capacidades
type BayCapacity = "individual" | "pequeña" | "mediana" | "grande" | "multiple";

// Técnico actual
interface CurrentTechnician {
  technician: string;
  role: "principal" | "asistente";
  entryTime: Date;
}
```

### DTOs

```typescript
// Para crear nueva bahía
interface CreateServiceBayDto {
  name: string;
  code: string;
  area: BayArea;
  capacity: BayCapacity;
  maxTechnicians: number;
  equipment?: string[];
  notes?: string;
  order?: number;
}

// Para actualizar bahía
interface UpdateServiceBayDto {
  name?: string;
  code?: string;
  area?: BayArea;
  status?: BayStatus;
  capacity?: BayCapacity;
  maxTechnicians?: number;
  equipment?: string[];
  notes?: string;
  order?: number;
  isActive?: boolean;
}

// Filtros de búsqueda
interface ServiceBayFilters {
  status?: BayStatus;
  area?: BayArea;
  isActive?: "true" | "false" | "all";
  sortBy?: "name" | "code" | "order" | "createdAt";
  sortOrder?: "asc" | "desc";
}
```

---

## 🔌 API Service

### Métodos CRUD

#### `getServiceBays(filters?: ServiceBayFilters)`

Obtiene todas las bahías con filtros opcionales.

```typescript
const bays = await getServiceBays({
  status: "disponible",
  area: "mecanica",
  isActive: "true",
});
```

**Respuesta:**

```typescript
{
  ok: true,
  bays: ServiceBay[],
  total: number
}
```

#### `getAvailableServiceBays(area?, capacity?)`

Obtiene solo bahías disponibles.

```typescript
const available = await getAvailableServiceBays("mecanica", "mediana");
```

#### `getServiceBay(id: string)`

Obtiene una bahía específica por ID.

```typescript
const bay = await getServiceBay("507f1f77bcf86cd799439011");
```

#### `createServiceBay(data: CreateServiceBayDto)`

Crea nueva bahía de servicio.

```typescript
const newBay = await createServiceBay({
  name: "Bahía Mecánica 1",
  code: "MEC-01",
  area: "mecanica",
  capacity: "mediana",
  maxTechnicians: 2,
  equipment: ["Multímetro", "Gato Hidráulico"],
  notes: "Equipada para trabajos generales",
  order: 1,
});
```

#### `updateServiceBay(id: string, data: UpdateServiceBayDto)`

Actualiza bahía existente.

```typescript
await updateServiceBay("507f...", {
  status: "mantenimiento",
  notes: "En mantenimiento preventivo",
});
```

#### `deleteServiceBay(id: string)`

Elimina bahía (soft delete).

```typescript
await deleteServiceBay("507f...");
```

### Métodos de Asignación

#### `enterBay(workOrderId: string, data: EnterBayData)`

Registra entrada de técnico(s) a una bahía.

```typescript
// Un técnico
await enterBay("orden123", {
  serviceBay: "bay123",
  technician: "tech456",
  role: "principal",
  estimatedHours: 3,
  notes: "Revisar frenos",
});

// Múltiples técnicos
await enterBay("orden123", {
  serviceBay: "bay123",
  technicians: [
    {
      technician: "tech456",
      role: "principal",
      estimatedHours: 3,
    },
    {
      technician: "tech789",
      role: "asistente",
      estimatedHours: 3,
    },
  ],
});
```

#### `exitBay(workOrderId: string, data: ExitBayData)`

Registra salida de técnico(s) de una bahía.

```typescript
await exitBay("orden123", {
  technician: "tech456",
  notes: "Trabajo completado",
});
```

### Métodos de Reportes

#### `getServiceBaysDashboard()`

Dashboard con estado en tiempo real.

```typescript
const dashboard = await getServiceBaysDashboard();
// {
//   summary: {
//     totalBays: 8,
//     occupiedBays: 3,
//     availableBays: 5,
//     ...
//   },
//   activeBays: [...],
//   byArea: {...}
// }
```

#### `getTechnicianHoursReport(params)`

Reporte de horas trabajadas por técnico.

```typescript
const report = await getTechnicianHoursReport({
  startDate: "2025-11-01",
  endDate: "2025-11-30",
  technicianId: "tech123", // opcional
});
```

#### `getBayUtilizationReport(params)`

Reporte de utilización de bahías.

```typescript
const report = await getBayUtilizationReport({
  startDate: "2025-11-01",
  endDate: "2025-11-30",
  area: "mecanica", // opcional
});
```

#### `getBayHistory(bayId: string, limit?: number)`

Historial de una bahía específica.

```typescript
const history = await getBayHistory("bay123", 50);
```

---

## 🎨 Componentes

### ServiceBayList

**Ubicación:** `components/workshop/service-bays/ServiceBayList.tsx`

Componente principal que muestra tabla con todas las bahías.

#### Características:

- **DataTable** con columnas:

  - Código (Badge)
  - Nombre
  - Área (con icono)
  - Estado (Tag con colores)
  - Capacidad
  - Técnicos (actual/máximo)
  - Equipos (cantidad)
  - Activa/Inactiva
  - Acciones

- **Funcionalidades**:
  - Búsqueda global
  - Paginación (5, 10, 25, 50 registros)
  - Ordenamiento por columnas
  - Filtro por nombre
  - Diálogo de creación/edición
  - Diálogo de confirmación de eliminación
  - Toast notifications

#### Props:

```typescript
// No recibe props, es autocontenido
```

#### Ejemplo de Uso:

```tsx
import ServiceBayList from "@/components/workshop/service-bays/ServiceBayList";

export default function ServiceBaysPage() {
  return <ServiceBayList />;
}
```

### ServiceBayForm

**Ubicación:** `components/workshop/service-bays/ServiceBayForm.tsx`

Formulario para crear/editar bahías.

#### Props:

```typescript
interface ServiceBayFormProps {
  serviceBay: ServiceBay | null; // null para crear, objeto para editar
  onSave: () => void; // Callback al guardar exitosamente
  onCancel: () => void; // Callback al cancelar
  toast: React.RefObject<any>; // Referencia al Toast para notificaciones
}
```

#### Campos del Formulario:

**Información Básica:**

- Nombre (requerido, 3-100 caracteres)
- Código (requerido, único, 2-20 caracteres, uppercase)
- Área de especialización (requerido, dropdown)
- Capacidad (requerido, dropdown)
- Estado (solo en edición, dropdown)
- Máximo de técnicos (requerido, 1-10)
- Orden de visualización (opcional)

**Equipamiento y Notas:**

- Equipo disponible (opcional, Chips)
- Notas adicionales (opcional, textarea, max 500 caracteres)
- Bahía activa (solo en edición, checkbox)

#### Validaciones:

- Código: Solo letras mayúsculas, números y guiones
- Nombre: Mínimo 3 caracteres
- Técnicos: Entre 1 y 10
- Notas: Máximo 500 caracteres

#### Ejemplo de Uso:

```tsx
<Dialog visible={formDialog} onHide={hideDialog}>
  <ServiceBayForm
    serviceBay={selectedBay}
    onSave={handleSave}
    onCancel={hideDialog}
    toast={toastRef}
  />
</Dialog>
```

---

## ✅ Validaciones

### Schema de Creación

```typescript
createServiceBaySchema = {
  name: string().min(3).max(100),
  code: string().min(2).max(20).regex(/^[A-Z0-9-]+$/),
  area: enum([...]),
  capacity: enum([...]),
  maxTechnicians: number().int().min(1).max(10),
  equipment: array(string()).optional(),
  notes: string().max(500).optional(),
  order: number().int().min(0).default(0)
}
```

### Schema de Actualización

Todos los campos opcionales excepto validaciones de formato.

### Mensajes de Error

```typescript
{
  "El nombre debe tener al menos 3 caracteres",
    "El código debe contener solo letras mayúsculas, números y guiones",
    "Debe permitir al menos 1 técnico",
    "No puede exceder 10 técnicos",
    "Las notas no pueden exceder 500 caracteres";
}
```

---

## 💡 Ejemplos de Uso

### Crear Bahía Mecánica

```typescript
const nuevaBahia = await createServiceBay({
  name: "Bahía Mecánica Premium",
  code: "MEC-P1",
  area: "mecanica",
  capacity: "grande",
  maxTechnicians: 3,
  equipment: [
    "Gato Hidráulico 5 Ton",
    "Compresor de Aire",
    "Set de Herramientas Profesional",
    "Escáner OBD2",
  ],
  notes: "Bahía equipada para trabajos complejos de motor y suspensión",
  order: 1,
});
```

### Asignar Vehículo a Bahía

```typescript
// 1. Buscar bahía disponible
const disponibles = await getAvailableServiceBays("mecanica", "mediana");
const bahia = disponibles.bays[0];

// 2. Registrar entrada
await enterBay(ordenTrabajoId, {
  serviceBay: bahia._id,
  technician: tecnicoId,
  role: "principal",
  estimatedHours: 2,
  notes: "Cambio de aceite y filtros",
});

// 3. Al terminar, registrar salida
await exitBay(ordenTrabajoId, {
  technician: tecnicoId,
  notes: "Trabajo completado satisfactoriamente",
});
```

### Generar Reporte de Utilización

```typescript
const reporte = await getBayUtilizationReport({
  startDate: "2025-11-01",
  endDate: "2025-11-30",
  area: "mecanica",
});

console.log("Utilización promedio:", reporte.overallSummary.averageUtilization);
reporte.report.forEach((bay) => {
  console.log(`${bay.bayName}: ${bay.utilizationPercentage}%`);
});
```

### Dashboard en Tiempo Real

```typescript
const fetchDashboard = async () => {
  const data = await getServiceBaysDashboard();

  // Mostrar resumen
  console.log(
    `Bahías ocupadas: ${data.summary.occupiedBays}/${data.summary.totalBays}`,
  );

  // Listar bahías activas
  data.activeBays.forEach((bay) => {
    console.log(
      `${bay.bayName} - ${bay.workOrderNumber} - ${bay.technicians.length} técnicos`,
    );
  });

  // Estadísticas por área
  Object.entries(data.byArea).forEach(([area, stats]) => {
    console.log(`${area}: ${stats.occupied}/${stats.total} ocupadas`);
  });
};

// Actualizar cada 30 segundos
setInterval(fetchDashboard, 30000);
```

---

## 🔗 Integración con Backend

### Base URL

```typescript
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
```

### Endpoints

| Método | Endpoint                     | Descripción                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/service-bays`              | Obtener todas las bahías   |
| GET    | `/service-bays/available`    | Obtener bahías disponibles |
| GET    | `/service-bays/:id`          | Obtener bahía por ID       |
| POST   | `/service-bays`              | Crear nueva bahía          |
| PUT    | `/service-bays/:id`          | Actualizar bahía           |
| DELETE | `/service-bays/:id`          | Eliminar bahía             |
| POST   | `/work-orders/:id/enter-bay` | Registrar entrada          |
| POST   | `/work-orders/:id/exit-bay`  | Registrar salida           |
| GET    | `/dashboard/service-bays`    | Dashboard en tiempo real   |
| GET    | `/reports/technician-hours`  | Reporte de horas           |
| GET    | `/reports/bay-utilization`   | Reporte de utilización     |
| GET    | `/reports/bays/:id/history`  | Historial de bahía         |

### Autenticación

Todos los endpoints requieren token JWT en el header:

```typescript
headers: {
  'x-token': localStorage.getItem('token')
}
```

### Manejo de Errores

```typescript
try {
  const result = await createServiceBay(data);
  toast.success("Bahía creada correctamente");
} catch (error: any) {
  const errorMessage =
    error.response?.data?.msg || error.message || "Error al crear bahía";
  toast.error(errorMessage);
}
```

---

## 🗺️ Rutas y Navegación

### Ruta Principal

```
/nomisys/operation/service-bays
```

### Estructura de Navegación Sugerida

```
NomiSys
└── Operaciones
    ├── Órdenes de Trabajo
    ├── Tablero Kanban
    └── Puestos de Servicio  👈
```

### Página

**Ubicación:** `app/(main)/nomisys/operation/service-bays/page.tsx`

```tsx
"use client";
import ServiceBayList from "@/components/workshop/service-bays/ServiceBayList";

export default function ServiceBaysPage() {
  return <ServiceBayList />;
}
```

---

## 📱 UI/UX

### Colores por Estado

```typescript
const BAY_STATUS_COLORS = {
  disponible: "success", // Verde
  ocupado: "warning", // Amarillo
  mantenimiento: "info", // Azul
  fuera_servicio: "danger", // Rojo
};
```

### Iconos por Área

```typescript
const BAY_AREA_ICONS = {
  mecanica: "pi-wrench",
  electricidad: "pi-bolt",
  pintura: "pi-palette",
  latoneria: "pi-car",
  diagnostico: "pi-chart-line",
  cambio_aceite: "pi-circle-fill",
  multiple: "pi-sitemap",
};
```

### Responsive

- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Columnas ajustadas, scroll horizontal
- **Mobile**: Layout optimizado con columnas esenciales

---

## 🚀 Inicio Rápido

### 1. Navegar al Módulo

```
http://localhost:3000/nomisys/operation/service-bays
```

### 2. Crear Primera Bahía

1. Clic en **"Nueva Bahía"**
2. Completar formulario:
   - Nombre: "Bahía Mecánica 1"
   - Código: "MEC-01"
   - Área: Mecánica
   - Capacidad: Mediana
   - Máx. Técnicos: 2
3. Agregar equipamiento (opcional)
4. Guardar

### 3. Asignar a Orden de Trabajo

```typescript
// En el componente de orden de trabajo
const asignarBahia = async () => {
  const bays = await getAvailableServiceBays("mecanica");
  // Mostrar lista de bahías disponibles
  // Usuario selecciona bahía
  await enterBay(workOrderId, {
    serviceBay: selectedBayId,
    technician: currentTechnicianId,
    role: "principal",
  });
};
```

---

## 🔧 Configuración

### Variables de Entorno

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### Dependencias

```json
{
  "dependencies": {
    "primereact": "^10.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "framer-motion": "^10.x",
    "axios": "^1.x"
  }
}
```

---

## 📈 Mejoras Futuras

### Planificadas

- [ ] Calendario de reservas de bahías
- [ ] Notificaciones push cuando se libera una bahía
- [ ] Vista de mapa del taller con bahías
- [ ] Integración con cámaras de seguridad
- [ ] QR codes para check-in/check-out
- [ ] Análisis predictivo de tiempos
- [ ] App móvil para técnicos

### Sugerencias

- [ ] Asignación automática de bahías según tipo de trabajo
- [ ] Alertas de mantenimiento preventivo
- [ ] Historial de incidencias por bahía
- [ ] Integración con sistema de inventario
- [ ] Gestión de limpieza y sanitización

---

## 📞 Soporte

### Dudas Técnicas

1. Revisar logs del backend
2. Verificar token de autenticación
3. Consultar documentación del backend: `docs/api/SERVICE_BAY_FRONTEND_INTEGRATION.md`

### Problemas Comunes

**Bahía no aparece disponible:**

- Verificar `isActive: true`
- Verificar `eliminado: false`
- Verificar `status: 'disponible'`

**Error al asignar:**

- Verificar que la bahía no esté ocupada
- Verificar capacidad de técnicos
- Verificar que el técnico existe

**Código duplicado:**

- Los códigos deben ser únicos
- Usar formato consistente (ej: AREA-NN)

---

## 📝 Changelog

### v1.0.0 - 2025-11-08

- ✨ Implementación inicial
- ✅ CRUD completo
- ✅ Validaciones con Zod
- ✅ Integración con backend
- ✅ UI responsive con PrimeReact
- ✅ Documentación completa

---

**Última actualización:** 8 de Noviembre, 2025  
**Versión:** 1.0.0  
**Módulo:** Service Bays  
**Autor:** Sistema de Gestión de Taller
