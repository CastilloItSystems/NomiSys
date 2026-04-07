# Tablero Kanban de Órdenes de Trabajo

## Descripción

El tablero Kanban proporciona una interfaz visual e interactiva para gestionar las órdenes de trabajo del taller. Permite visualizar el flujo de trabajo, arrastrar y soltar órdenes entre estados, y acceder rápidamente a la información detallada de cada orden.

## Características Principales

### 🎯 Visualización Kanban

- **Columnas por Estado**: Cada columna representa un estado de orden de trabajo (Pendiente, En Progreso, Completado, etc.)
- **Contador de Órdenes**: Cada columna muestra el número de órdenes en ese estado
- **Código de Colores**: Los estados tienen colores personalizados definidos en el backend
- **Scroll Horizontal**: Navega fácilmente entre múltiples columnas

### 🖱️ Drag & Drop

- **Arrastrar Tarjetas**: Agarra cualquier tarjeta y arrástrala a una columna diferente
- **Cambio de Estado Automático**: Al soltar la tarjeta, el estado se actualiza en el backend
- **Feedback Visual**: La columna se resalta cuando arrastras una tarjeta sobre ella
- **Overlay de Arrastre**: Una vista previa semi-transparente sigue al cursor durante el arrastre
- **Actualización en Tiempo Real**: Notificación de éxito/error tras cada cambio

### 📋 Tarjetas de Orden (KanbanCard)

Cada tarjeta muestra información esencial:

**Información Principal:**

- Número de orden (monospace, destacado)
- Cliente (nombre completo)
- Placa del vehículo
- Kilometraje

**Indicadores Visuales:**

- **Prioridad**: Tag con color según nivel (Baja, Normal, Alta, Urgente)
- **Días Transcurridos**: Badge con código de colores:
  - Verde: ≤ 3 días
  - Amarillo: 4-7 días
  - Rojo: > 7 días
- **Cantidad de Items**: Badge mostrando número de servicios/repuestos
- **Costo Total**: Monto en VES destacado

**Datos Adicionales:**

- Motivo de la orden (texto truncado a 2 líneas)
- Fecha estimada de entrega (si existe)

### 🔍 Detalles de Orden (Dialog)

Al hacer clic en cualquier tarjeta, se abre un dialog modal con información completa:

**Sección Cliente y Vehículo:**

- Nombre completo del cliente
- Teléfono y correo (si existen)
- Placa del vehículo
- Kilometraje actual

**Información de la Orden:**

- Número de orden
- Estado actual (con color)
- Motivo de la orden
- Prioridad
- Técnico asignado
- Fechas (apertura, estimada de entrega, entrega real)
- Descripción detallada del problema
- Observaciones

**Lista de Items:**
Tabla detallada de todos los servicios y repuestos:

- Nombre y descripción
- Cantidad y precio unitario
- Precio final (con descuentos aplicados)
- Estado del item (pendiente, en proceso, completado, cancelado)

**Resumen Financiero:**

- Subtotal de servicios
- Subtotal de repuestos
- Descuento aplicado
- Impuesto (IVA)
- **Costo Total** (destacado)

### 🔄 Actualización de Datos

- **Botón Actualizar**: Recarga todos los datos del tablero
- **Estado de Carga**: Spinner durante la carga inicial
- **Recarga Post-Drop**: Después de cambiar el estado, se recargan los datos para reflejar cambios del backend

## Arquitectura

### Componentes

```
components/workshop/kanban/
├── WorkOrderKanban.tsx       # Componente principal con lógica DnD
├── KanbanColumn.tsx           # Columna individual con droppable area
└── KanbanCard.tsx             # Tarjeta de orden con información resumida
```

### Tecnologías Utilizadas

- **@dnd-kit**: Biblioteca moderna de drag-and-drop
  - `@dnd-kit/core`: Funcionalidad principal
  - `@dnd-kit/sortable`: Ordenamiento dentro de listas
  - `@dnd-kit/utilities`: Utilidades CSS para transformaciones
- **PrimeReact**: Componentes UI (Card, Tag, Badge, Dialog, Button, Toast)
- **Framer Motion**: Animaciones de entrada
- **TypeScript**: Type safety completo

### Flujo de Datos

```
1. Carga Inicial
   ├── getWorkOrders() → Todas las órdenes de trabajo
   └── getWorkOrderStatuses() → Estados activos (ordenados)

2. Usuario Arrastra Tarjeta
   ├── handleDragStart() → Guarda ID de tarjeta activa
   ├── handleDragOver() → Actualiza estado local (UX inmediata)
   └── handleDragEnd() → Llama a changeWorkOrderStatus() API

3. Backend Actualiza
   ├── changeWorkOrderStatus(orderId, newStatusId)
   └── Toast de éxito/error

4. Recarga de Datos
   └── loadData() → Refresca tablero con datos actualizados
```

## Uso

### Navegación

La página del tablero Kanban se encuentra en:

```
/nomisys/operation/workshop
```

### Acciones del Usuario

**Ver Detalles:**

1. Click en cualquier tarjeta
2. Se abre dialog con información completa
3. Click fuera o botón X para cerrar

**Cambiar Estado:**

1. Agarra una tarjeta (click y mantén presionado)
2. Arrastra hacia la columna de destino
3. Suelta cuando la columna se resalte
4. Espera confirmación (Toast)

**Actualizar Tablero:**

1. Click en botón "Actualizar" (esquina superior derecha)
2. Espera mientras se recargan los datos

## Configuración de Estados

Los estados mostrados en el tablero provienen del backend:

- Endpoint: `GET /work-order-statuses`
- Filtro: Solo estados con `estado: "activo"`
- Orden: Por campo `orden` (ascendente)

### Propiedades de Estado

```typescript
interface WorkOrderStatus {
  _id: string;
  codigo: string;
  nombre: string; // Nombre mostrado en columna
  color?: string; // Color de fondo de header
  icono?: string; // Icono PrimeIcons (ej: "pi-clock")
  orden?: number; // Orden de visualización
  estado: "activo" | "inactivo";
}
```

## Personalización

### Colores de Prioridad

Definidos en `KanbanCard.tsx`:

```typescript
const priorityConfig = {
  baja: { severity: "secondary", label: "Baja", icon: "pi-arrow-down" },
  normal: { severity: "info", label: "Normal", icon: "pi-minus" },
  alta: { severity: "warning", label: "Alta", icon: "pi-arrow-up" },
  urgente: {
    severity: "danger",
    label: "Urgente",
    icon: "pi-exclamation-circle",
  },
};
```

### Días Transcurridos

Lógica de colores en `KanbanCard.tsx`:

```typescript
const getDaysColor = () => {
  if (daysElapsed > 7) return "danger"; // Rojo
  if (daysElapsed > 3) return "warning"; // Amarillo
  return "success"; // Verde
};
```

### Ancho de Columnas

Definido en `KanbanColumn.tsx`:

```typescript
minWidth: "320px";
maxWidth: "380px";
```

Responsive en `globals.css`:

```css
@media (max-width: 768px) {
  .kanban-column {
    min-width: 280px;
    max-width: 280px;
  }
}

@media (max-width: 576px) {
  .kanban-column {
    min-width: 260px;
    max-width: 260px;
  }
}
```

## Estilos CSS

Los estilos del Kanban están en `styles/globals.css`:

- `.kanban-board`: Contenedor principal con scroll horizontal
- `.kanban-column`: Columna individual
- `.kanban-column-content`: Área scrollable de tarjetas
- `.kanban-card-enter`: Animación de entrada de tarjetas
- `.kanban-column-dragging-over`: Estado hover durante drag
- `.work-order-details`: Estilos del dialog de detalles

## Sensores de Drag & Drop

### PointerSensor

```typescript
activationConstraint: {
  distance: 8,  // Píxeles de movimiento antes de iniciar drag
}
```

Esto previene que clicks accidentales inicien el drag.

### KeyboardSensor

Permite drag & drop usando teclado (accesibilidad):

- Tab para navegar entre tarjetas
- Espacio/Enter para agarrar
- Flechas para mover
- Espacio/Enter para soltar

## Detección de Colisiones

Usa `closestCorners` para determinar sobre qué columna está el drag:

```typescript
collisionDetection = { closestCorners };
```

Otras opciones disponibles:

- `closestCenter`: Centro más cercano
- `rectIntersection`: Intersección de rectángulos
- `pointerWithin`: Puntero dentro del área

## Manejo de Errores

### Errores de Carga

```typescript
toast.current?.show({
  severity: "error",
  summary: "Error",
  detail: "Error al cargar datos del tablero",
  life: 3000,
});
```

### Errores de Actualización

Si falla el cambio de estado:

1. Muestra Toast de error
2. Revierte el cambio local (rollback)
3. El usuario puede reintentar

```typescript
// Revert the change
setWorkOrders((workOrders) => {
  return workOrders.map((wo) => {
    if (wo._id === activeId) {
      return { ...wo, estado: oldStatusId }; // Restaura estado anterior
    }
    return wo;
  });
});
```

## Optimizaciones

### Actualización Optimista

El estado se actualiza localmente ANTES de la respuesta del servidor:

```typescript
// Update local state immediately for smooth UX
setWorkOrders((workOrders) => {
  return workOrders.map((wo) => {
    if (wo._id === activeId) {
      return { ...wo, estado: overStatus._id };
    }
    return wo;
  });
});
```

Esto proporciona feedback instantáneo al usuario.

### Lazy Loading

Las columnas solo renderizan las tarjetas visibles gracias al scroll virtual.

### Memoización

React optimiza re-renders automáticamente al usar keys únicas (`workOrder._id`).

## Accesibilidad

- **Keyboard Navigation**: Navegación completa por teclado
- **Screen Readers**: Todos los elementos tienen labels apropiados
- **Focus Management**: El focus se mantiene durante drag & drop
- **Color Contrast**: Función `getContrastColor()` asegura legibilidad

## Testing

### Casos de Prueba Sugeridos

1. **Carga Inicial**

   - Verificar que se muestren todas las columnas
   - Verificar que las tarjetas estén en las columnas correctas
   - Verificar contadores de órdenes

2. **Drag & Drop**

   - Arrastrar y soltar entre columnas
   - Verificar actualización del backend
   - Verificar Toast de éxito
   - Probar rollback en caso de error

3. **Detalles de Orden**

   - Click en tarjeta abre dialog
   - Toda la información se muestra correctamente
   - Dialog se cierra al hacer click fuera

4. **Responsive**

   - Scroll horizontal funciona en mobile
   - Columnas tienen ancho adecuado
   - Tarjetas son legibles en pantallas pequeñas

5. **Performance**
   - Drag & drop es fluido con 100+ órdenes
   - No hay lag en la actualización de estado
   - Recarga de datos es rápida

## Troubleshooting

### Problema: Las tarjetas no se mueven

**Causa**: Sensor de drag requiere movimiento mínimo

**Solución**: Asegúrate de mover el cursor al menos 8 píxeles antes de soltar

### Problema: El estado no se actualiza

**Causa**: Error en la API `changeWorkOrderStatus`

**Solución**:

1. Verifica que el backend esté ejecutándose
2. Revisa la consola del navegador para errores
3. Verifica que el usuario tenga permisos

### Problema: Columnas no aparecen

**Causa**: Estados no están marcados como "activo"

**Solución**: En el backend, asegúrate de que los estados tengan `estado: "activo"`

### Problema: Colores no se muestran

**Causa**: Estados no tienen campo `color` definido

**Solución**: Agrega colores hexadecimales a los estados en el backend

## Mejoras Futuras

### Fase 2

1. **Filtros**: Filtrar órdenes por cliente, técnico, prioridad
2. **Búsqueda**: Buscar órdenes por número, placa, cliente
3. **Ordenamiento**: Ordenar tarjetas dentro de columnas (fecha, prioridad, costo)
4. **Vista Compacta**: Toggle para mostrar tarjetas más pequeñas
5. **Acciones Rápidas**: Botones en tarjetas para asignar técnico, cambiar prioridad

### Fase 3

1. **Notificaciones en Tiempo Real**: WebSocket para actualizaciones en vivo
2. **Historial de Cambios**: Log de movimientos entre estados
3. **Analytics**: Gráficos de tiempo promedio por estado
4. **Drag Between Technicians**: Columnas agrupadas por técnico
5. **Bulk Actions**: Seleccionar múltiples tarjetas y mover juntas

### Fase 4

1. **Swimlanes**: Filas horizontales por prioridad o técnico
2. **WIP Limits**: Límites de trabajo en progreso por columna
3. **Automated Transitions**: Cambios de estado automáticos
4. **Custom Views**: Guardar vistas personalizadas del tablero
5. **Export/Print**: Exportar vista actual a PDF

## Integración con Otros Módulos

### Work Orders

- Lectura: `getWorkOrders()` obtiene todas las órdenes
- Escritura: `changeWorkOrderStatus()` actualiza estado

### Work Order Statuses

- Lectura: `getWorkOrderStatuses()` define las columnas

### Invoices

- Futuro: Indicador en tarjeta si orden tiene factura generada

### Payments

- Futuro: Indicador en tarjeta del estado de pago

## Changelog

### v1.0.0 - Noviembre 2024

**Características Iniciales:**

- ✅ Tablero Kanban con drag & drop
- ✅ Columnas dinámicas desde backend
- ✅ Tarjetas con información resumida
- ✅ Dialog de detalles completos
- ✅ Actualización de estado via API
- ✅ Feedback visual (Toast, resaltados)
- ✅ Actualización optimista de UI
- ✅ Rollback en caso de error
- ✅ Responsive design
- ✅ Navegación por teclado
- ✅ Scroll horizontal y vertical
- ✅ Animaciones suaves
- ✅ Código de colores por prioridad
- ✅ Indicadores de días transcurridos

## Soporte

Para dudas o problemas con el tablero Kanban:

1. Revisar esta documentación
2. Consultar código en `components/workshop/kanban/`
3. Verificar configuración de estados en backend
4. Revisar logs de consola del navegador
5. Reportar issues en el repositorio del proyecto
