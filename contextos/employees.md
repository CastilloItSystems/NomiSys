# PRD — MVP Submódulo de Empleados (Nómina)

## Sistema de Nómina para Venezuela

> **Nota:** Este PRD está alineado con la arquitectura existente del proyecto NomiSys (multi-tenancy, sistema de permisos, AuditLog genérico). Empleados es un **submódulo de Nómina** (`backend/src/modules/nomina/employees/`). Todos los catálogos relacionados (departamentos, cargos, bancos) también viven bajo el módulo de nómina.

---

## Cambios respecto al PRD original

1. **Fase 0 agregada** — Catálogos base (Departamentos, Cargos, Bancos) como prerequisito
2. **Campos Venezuela** — IVSS, tipo cédula (V/E/P), RIF empleado, cargas familiares desde Fase 1
3. **Importación masiva sacada del MVP** — Queda para iteración posterior
4. **Auditoría** — Reusar sistema existente (`AuditLog` genérico), no tabla separada
5. **Alineación con arquitectura** — Multi-tenancy vía `X-Company-Id`, permisos `employees.*`, patrones de código existentes
6. **Modelo de datos refinado** — Relaciones a catálogos, enums ajustados, índices
7. **Estructura de módulo mejorada** — Cada submódulo usa: controller, service, routes, types, validation (separación de responsabilidades)
8. **Jerarquía de módulos** — Empleados, departamentos, cargos y bancos son submódulos de `nomina`

---

# 1. Resumen

## 1.1 Nombre del módulo

**Submódulo de Empleados** (dentro del módulo de Nómina)

## 1.1.1 Ubicación en el proyecto

Empleados es un submódulo del módulo principal **Nómina**. Todos los submódulos de nómina siguen la misma estructura:

```
backend/src/modules/nomina/
├── employees/
│   ├── employees.controller.ts    # Parsea req → llama service → devuelve res
│   ├── employees.routes.ts        # Rutas + middleware chain
│   ├── employees.service.ts       # Lógica de negocio + queries Prisma
│   ├── employees.types.ts         # DTOs + interfaces
│   └── employees.validation.ts    # Schemas Joi (body, query, params)
├── departments/
│   ├── departments.controller.ts
│   ├── departments.routes.ts
│   ├── departments.service.ts
│   ├── departments.types.ts
│   └── departments.validation.ts
├── positions/
│   ├── positions.controller.ts
│   ├── positions.routes.ts
│   ├── positions.service.ts
│   ├── positions.types.ts
│   └── positions.validation.ts
└── banks/
    ├── banks.controller.ts
    ├── banks.routes.ts
    ├── banks.service.ts
    ├── banks.types.ts
    └── banks.validation.ts
```

**Patrón de cada archivo:**

- **`.controller.ts`** — Solo maneja request/response. Llama al service, no tiene lógica de negocio.
- **`.service.ts`** — Toda la lógica: queries Prisma, transacciones, validaciones de negocio, auditoría. Testeable sin Express.
- **`.routes.ts`** — Define rutas REST + cadena de middlewares (authenticate, extractCompany, authorize, validate).
- **`.types.ts`** — DTOs de entrada/salida + interfaces de dominio.
- **`.validation.ts`** — Schemas Joi para body, query y params de cada endpoint.

## 1.2 Objetivo

Permitir registrar, consultar, editar y administrar la información básica y laboral de los empleados de una empresa, de forma estructurada, segura y auditable, para que luego puedan ser usados en los procesos de nómina venezolana.

## 1.3 Problema a resolver

Muchas empresas llevan la información de sus trabajadores en archivos Excel, carpetas físicas o sistemas no conectados con nómina. Esto causa:

- Duplicidad de datos
- Errores en nombres, cédulas o salarios
- Dificultad para mantener históricos
- Problemas al calcular la nómina
- Falta de trazabilidad sobre cambios laborales

## 1.4 Resultado esperado

El módulo debe permitir:

- Gestionar catálogos base (departamentos, cargos, bancos)
- Crear empleados con datos completos para nómina venezolana
- Editar su información con historial de cambios
- Consultar el expediente
- Registrar estatus laborales
- Llevar histórico de cambios clave
- Tener empleados listos para usarse en nómina

---

# 2. Objetivos del MVP

1. Gestionar catálogos base (departamentos, cargos, bancos)
2. Registrar empleados de forma individual
3. Consultar listado de empleados
4. Editar datos personales y laborales
5. Cambiar estatus del empleado
6. Mantener histórico de salario y cargo
7. Validar datos obligatorios (incluyendo campos Venezuela)
8. Permitir búsqueda y filtros
9. Dejar trazabilidad de cambios vía sistema de auditoría existente (`AuditLog`)

---

# 3. Alcance del MVP

## Incluye

- CRUD de catálogos: Departamentos, Cargos, Bancos (Fase 0)
- Crear empleado (con campos Venezuela: tipo cédula V/E/P, IVSS, RIF, FAOV, INCES, cargas familiares)
- Editar empleado
- Consultar expediente
- Listado de empleados con filtros y paginación en servidor
- Cambio de estatus
- Historial básico laboral (salario, cargo, estatus)
- Datos bancarios básicos (FK a catálogo de Bancos)
- Auditoría vía `AuditLog` existente (entity: "Employee")
- Exportación de listado (funcionalidad nativa PrimeReact DataTable)
- Permisos integrados al sistema de roles existente (`employees.*`, `departments.*`, `positions.*`, `banks.*`)
- Validaciones de negocio específicas Venezuela

## No incluye en este MVP

- Importación masiva por CSV/Excel (iteración posterior)
- Gestión documental avanzada
- Firma electrónica de contrato
- Portal de autoservicio del empleado
- Gestión de vacaciones
- Beneficiarios complejos (cargas familiares detalladas)
- Evaluaciones de desempeño
- Organigrama avanzado
- Flujos de aprobación complejos
- Múltiples cuentas bancarias por empleado

---

# 4. Usuarios del módulo

## 4.1 Administrador

- Configura catálogos (departamentos, cargos, bancos)
- Gestiona usuarios y permisos
- Puede crear, editar, activar o inactivar empleados

## 4.2 RRHH

- Registra empleados
- Edita expedientes
- Consulta información laboral
- Procesa ingresos, cambios y egresos

## 4.3 Nómina

- Consulta empleados para correr pagos
- Revisa salario, estatus, fecha de ingreso y datos bancarios

## 4.4 Auditor

- Consulta expedientes e historial sin editar

---

# 5. Definición de éxito

El MVP será exitoso si permite:

- Registrar al menos el 100% de los empleados activos de una empresa
- Reducir errores de captura manual
- Tener información mínima necesaria para nómina venezolana (incluido IVSS, cédula tipada V/E/P, RIF)
- Consultar rápidamente la ficha de cualquier trabajador
- Mantener historial de cambios importantes
- Controlar acceso por permisos granulares (`employees.*`)

---

# 6. Funcionalidades del MVP

---

## 6.0 Catálogos base (Fase 0 — prerequisito)

Antes de poder crear empleados, se necesitan catálogos de referencia.

### 6.0.1 Departamentos

CRUD simple para departamentos por empresa.

- id, companyId, name, code (opcional), description (opcional), isActive
- Nombre único por empresa (`@@unique([name, companyId])`)
- No eliminar si hay empleados asociados (protección referencial)

### 6.0.2 Cargos (Posiciones)

CRUD simple para cargos/posiciones por empresa.

- id, companyId, name, code (opcional), description (opcional), level (opcional), isActive
- Nombre único por empresa (`@@unique([name, companyId])`)
- No eliminar si hay empleados asociados

### 6.0.3 Bancos (Catálogo global)

CRUD de catálogo de bancos (global, no por empresa).

- id, name, code (código SUDEBAN), isActive
- Código único
- Precargado con bancos venezolanos principales (Banesco, Mercantil, Provincial, BDV, BOD, Bicentenario, BNC, Exterior, Venezuela, Fondo Común, etc.)

### Criterios de aceptación catálogos

- CRUD completo con validaciones
- Listado con búsqueda y paginación
- No se pueden eliminar registros referenciados por empleados
- Auditoría de cambios vía AuditLog existente

---

## 6.1 Crear empleado

El sistema debe permitir registrar un empleado nuevo con información completa.

### Datos personales

- Primer nombre (obligatorio)
- Segundo nombre (opcional)
- Primer apellido (obligatorio)
- Segundo apellido (opcional)
- **Tipo de documento** (obligatorio): V (venezolano), E (extranjero), P (pasaporte)
- **Número de documento / Cédula** (obligatorio)
- Fecha de nacimiento (obligatoria)
- Sexo (obligatorio)
- Estado civil (opcional)
- Nacionalidad (opcional)
- Teléfono (obligatorio)
- Correo electrónico (opcional)
- Dirección (obligatoria)
- **Número de cargas familiares** (opcional, default 0) — afecta beneficios legales

### Datos laborales

- Empresa (implícita por contexto `X-Company-Id`)
- Código interno del empleado (obligatorio)
- Fecha de ingreso (obligatoria)
- **Cargo** (obligatorio) — FK a catálogo de Cargos
- **Departamento** (obligatorio) — FK a catálogo de Departamentos
- Centro de costo (opcional, texto libre por ahora)
- Tipo de contrato (obligatorio): Indefinido, Determinado, Obra, Pasantía
- Tipo de jornada (obligatorio): Completa, Parcial, Mixta, Nocturna
- Salario base (obligatorio, > 0)
- Moneda (obligatoria): VES, USD
- Frecuencia de pago (obligatoria): Quincenal, Mensual, Semanal
- Estatus laboral (obligatorio): Activo (default)
- Supervisor (opcional) — FK a otro empleado

### Datos de seguridad social y fiscal (Venezuela)

- **Número IVSS** (opcional pero recomendado) — Seguro Social Obligatorio
- **RIF del empleado** (opcional) — para retenciones ISLR
- **Inscrito en FAOV** (boolean, default false)
- **Inscrito en INCES** (boolean, default false)

### Datos bancarios

- **Banco** (obligatorio) — FK a catálogo de Bancos
- Tipo de cuenta (obligatorio): Ahorro, Corriente
- Número de cuenta (obligatorio, 20 dígitos para Venezuela)

### Datos adicionales opcionales

- Lugar de nacimiento
- Observaciones
- Contacto de emergencia (nombre + teléfono)

### Reglas

- La cédula (tipo + número) debe ser única por empresa
- El código interno debe ser único por empresa
- El salario base debe ser mayor a cero
- La fecha de ingreso no puede ser futura, salvo configuración especial
- El estatus inicial es siempre "Activo" o "En proceso de ingreso"
- Número de cuenta bancaria: 20 dígitos exactos (formato Venezuela)

### Criterios de aceptación

- Si faltan campos obligatorios, el sistema debe impedir guardar
- Si la cédula (tipo + número) ya existe en esa empresa, el sistema debe mostrar error claro
- Al guardar, el empleado debe quedar visible en el listado
- El sistema debe registrar auditoría (`AuditLog` con entity: "Employee", action: "CREATE")
- Debe registrarse automáticamente el primer registro en historial salarial y en historial de cargo

---

## 6.2 Listado de empleados

El sistema debe mostrar un listado general de empleados con información resumida.

### Columnas mínimas

- Código de empleado
- Nombre completo
- Cédula (con tipo: V-12345678)
- Cargo
- Departamento
- Fecha de ingreso
- Salario actual
- Estatus
- Acciones (ver/editar)

### Filtros mínimos

- Nombre / Cédula / Código (búsqueda global)
- Departamento (dropdown)
- Cargo (dropdown)
- Estatus (dropdown)
- Fecha de ingreso (rango)

### Funciones

- Buscar (global filter del DataTable)
- Filtrar por columna
- Ordenar por columna
- Paginación (servidor)
- Exportar listado (CSV/Excel — funcionalidad nativa PrimeReact DataTable)

### Criterios de aceptación

- El listado debe cargar en menos de 3 segundos en condiciones normales
- Debe poder filtrarse por múltiples criterios simultáneamente
- Solo usuarios con permiso `employees.view` pueden ver el listado
- Solo usuarios con permiso `reports.export` pueden exportar

---

## 6.3 Ver expediente del empleado

El sistema debe permitir abrir el detalle completo del empleado.

### Secciones del expediente (tabs)

1. **Resumen** — Datos clave del empleado en vista compacta
2. **Datos personales** — Información personal completa
3. **Datos laborales** — Cargo, departamento, contrato, jornada, supervisor
4. **Seguridad social y fiscal** — IVSS, RIF, FAOV, INCES
5. **Datos bancarios** — Banco, cuenta
6. **Historial** — Cambios de salario, cargo, departamento, estatus
7. **Auditoría** — Log de todas las acciones (vía `AuditHistoryDialog` existente)

### Criterios de aceptación

- El expediente debe mostrar datos actualizados
- El historial debe mostrar cambios con fecha de vigencia, valor anterior y nuevo
- Solo usuarios con `employees.view` pueden ver el expediente
- Datos bancarios parcialmente enmascarados en vista general

---

## 6.4 Editar empleado

El sistema debe permitir modificar información del empleado.

### Campos editables

- Teléfono, correo, dirección
- Cargo, departamento, centro de costo
- Tipo de contrato, tipo de jornada
- Salario, moneda
- Frecuencia de pago
- Datos bancarios (banco, tipo cuenta, número cuenta)
- Datos IVSS, RIF, FAOV, INCES
- Supervisor
- Cargas familiares
- Observaciones

### Reglas

- Cambios de **salario** deben guardar histórico (`EmployeeSalaryHistory`)
- Cambios de **cargo/departamento** deben guardar histórico (`EmployeeJobInfo` — cerrar registro actual y crear nuevo)
- Cambios de **estatus** se manejan por funcionalidad separada (6.5)
- La cédula solo puede editarse con permiso especial `employees.approve`
- El código interno NO es editable una vez creado

### Criterios de aceptación

- Toda edición registra auditoría (`AuditLog` con entity: "Employee", changes: {before, after})
- Si cambia salario, se crea registro en historial salarial con fecha de vigencia
- Si cambia cargo/departamento, se cierra registro actual en `EmployeeJobInfo` y se crea nuevo
- Si el empleado está inactivo/egresado, ciertas ediciones pueden restringirse
- Requiere permiso `employees.update`

---

## 6.5 Cambio de estatus del empleado

El sistema debe permitir manejar estatus laborales.

### Estatus

- **Activo** — Empleado operativo, disponible para nómina
- **Inactivo** — Temporalmente fuera (permiso no remunerado, etc.)
- **Suspendido** — Suspensión disciplinaria o administrativa
- **Egresado** — Relación laboral terminada
- **En proceso de ingreso** — Aún no ha comenzado (fecha futura)

### Funciones

- Cambiar estatus manualmente
- Registrar motivo del cambio (obligatorio para Inactivo, Suspendido, Egresado)
- Registrar fecha efectiva
- Si egresa: registrar fecha de egreso y motivo (Renuncia, Despido, Mutuo acuerdo, Jubilación)

### Reglas

- Un empleado egresado no debe salir por defecto en procesos futuros de nómina
- El cambio a Inactivo/Suspendido/Egresado requiere comentario obligatorio
- Se guarda en `EmployeeStatusHistory`

### Criterios de aceptación

- El sistema debe guardar histórico de todos los cambios de estatus
- Debe mostrarse estatus actual en el listado y expediente
- Requiere permiso `employees.update`

---

## 6.6 Historial laboral básico

El sistema debe mantener histórico de:

- Salario (con fecha de vigencia, moneda)
- Cargo + Departamento (con fecha efectiva)
- Estatus (con fecha, motivo, comentarios)
- Fecha de ingreso original
- Reingreso si aplica

### Criterios de aceptación

- Cada registro debe tener fecha de vigencia y quién lo creó
- Se distingue claramente el valor actual vs. valores previos
- Vista de historial accesible desde el expediente del empleado

---

## 6.7 Auditoría

El sistema reutiliza el modelo `AuditLog` existente para registrar:

- Creación de empleado
- Edición de datos
- Cambio de salario
- Cambio de cargo
- Cambio de estatus
- Cambios en catálogos (departamentos, cargos, bancos)

### Implementación

Usa el servicio `audit.service.ts` existente con:

- `entity`: "Employee" | "Department" | "Position" | "Bank"
- `entityId`: ID del registro afectado
- `action`: "CREATE" | "UPDATE" | "DELETE"
- `changes`: `{ before: {...}, after: {...} }`
- `userId`, `metadata` (ip, userAgent)

### Criterios de aceptación

- Cada log debe incluir usuario, fecha, hora, acción y detalle
- Los registros de auditoría no deben ser editables
- Visualización vía componente `AuditHistoryDialog` existente

---

# 7. Requerimientos funcionales detallados

---

## RF-01 CRUD de catálogos

El sistema debe permitir crear, listar, editar y desactivar departamentos, cargos y bancos.

## RF-02 Crear empleado

El sistema debe permitir crear un empleado manualmente desde un formulario con datos Venezuela.

## RF-03 Validar unicidad

El sistema debe validar unicidad de cédula (tipo + número) y código interno por empresa.

## RF-04 Consultar listado

El sistema debe mostrar listado de empleados con búsqueda, filtros y paginación en servidor.

## RF-05 Ver expediente

El sistema debe mostrar expediente completo del empleado con tabs.

## RF-06 Editar empleado

El sistema debe permitir edición controlada de datos del empleado.

## RF-07 Histórico de salario

El sistema debe mantener histórico de cambios salariales con fecha de vigencia.

## RF-08 Histórico de cargo

El sistema debe mantener histórico de cambios de cargo/departamento.

## RF-09 Cambio de estatus

El sistema debe permitir activar, inactivar, suspender o egresar empleados.

## RF-10 Exportación

El sistema debe exportar listado filtrado de empleados (nativo PrimeReact DataTable).

## RF-11 Auditoría

El sistema debe registrar todas las acciones vía `AuditLog` existente.

## RF-12 Control de acceso

El sistema debe controlar acceso por permisos granulares (`employees.*`, `departments.*`, `positions.*`, `banks.*`).

---

# 8. Reglas de negocio

1. Todo empleado pertenece a una empresa (multitenancy vía `companyId`)
2. Todo empleado tiene código interno único por empresa
3. La cédula (tipo + número) no se repite dentro de la misma empresa
4. Todo empleado tiene fecha de ingreso y salario base vigente
5. Un empleado egresado no está disponible para nómina por defecto
6. Todo cambio de salario se registra con fecha de vigencia
7. Todo cambio de cargo/departamento se registra como nuevo período en `EmployeeJobInfo`
8. No se eliminan empleados físicamente — solo cambio de estatus (soft delete conceptual)
9. Datos bancarios: cuenta de 20 dígitos exactos (estándar Venezuela)
10. El expediente es auditable vía `AuditLog` genérico existente
11. Campos obligatorios vs opcionales claramente diferenciados en UI
12. Los catálogos referenciados (departamento, cargo, banco) no se pueden eliminar si tienen empleados asociados

---

# 9. Requerimientos no funcionales

## 9.1 Seguridad

- Acceso controlado por permisos `employees.*`, `departments.*`, `positions.*`, `banks.*`
- Datos bancarios parcialmente enmascarados en vistas de listado
- Auditoría inmutable vía `AuditLog`
- Multi-tenancy: datos aislados por empresa (`X-Company-Id`)

## 9.2 Rendimiento

- Listado de empleados: menos de 3 segundos
- Apertura de expediente: menos de 2 segundos
- Paginación en servidor para listados grandes

## 9.3 Usabilidad

- Formulario dividido por secciones (steps o tabs)
- Validaciones en línea (Zod en frontend, Joi en backend)
- Mensajes de error en español
- Botones claros de guardar, cancelar, editar

## 9.4 Escalabilidad

- Soporte para miles de empleados
- Multi-empresa nativo (filtrado por `companyId`)

## 9.5 Auditoría

- Historial inalterable
- Trazabilidad por usuario

---

# 10. Flujos principales

## 10.1 Crear empleado

1. Usuario accede a `/empresa/nomina/empleados`
2. Clic en "Nuevo empleado"
3. Completa formulario por secciones: Personal → Laboral → Seguridad Social → Bancario → Adicional
4. Guarda
5. Backend valida (Joi), crea Employee + primer registro en `SalaryHistory` y `JobInfo`
6. Se registra `AuditLog` (entity: "Employee", action: "CREATE")
7. Empleado aparece en el listado

## 10.2 Editar salario

1. Usuario abre expediente del empleado
2. Clic en "Editar"
3. Cambia salario e indica fecha de vigencia
4. Guarda
5. Backend: cierra registro salarial actual (`endDate`), crea nuevo con `isCurrent=true`
6. `AuditLog` registra el cambio con before/after

## 10.3 Egresar empleado

1. Usuario abre expediente
2. Cambia estatus a "Egresado"
3. Indica fecha, motivo y comentario
4. Guarda
5. Backend: actualiza estatus, crea `EmployeeStatusHistory`, actualiza `terminationDate`
6. `AuditLog` registra el cambio

---

# 11. Historias de usuario

### HU-01 Gestionar catálogos

**Como** administrador  
**Quiero** crear departamentos, cargos y bancos  
**Para** tener los catálogos listos antes de registrar empleados

### HU-02 Crear empleado

**Como** usuario de RRHH  
**Quiero** registrar un empleado con datos completos  
**Para** que forme parte del sistema y pueda usarse en nómina

### HU-03 Validar datos

**Como** usuario de RRHH  
**Quiero** que el sistema valide cédula (V/E/P), código y datos obligatorios  
**Para** evitar errores de captura

### HU-04 Consultar empleados

**Como** usuario de nómina  
**Quiero** ver el listado de empleados  
**Para** identificar quiénes están activos y listos para pago

### HU-05 Ver expediente

**Como** usuario autorizado  
**Quiero** ver el expediente completo del empleado  
**Para** revisar su información personal, laboral y fiscal

### HU-06 Editar empleado

**Como** usuario de RRHH  
**Quiero** actualizar salario, cargo o datos personales  
**Para** mantener el expediente al día

### HU-07 Cambiar estatus

**Como** usuario de RRHH  
**Quiero** cambiar el estatus del empleado  
**Para** reflejar ingresos, suspensiones o egresos

### HU-08 Auditar cambios

**Como** auditor  
**Quiero** revisar quién cambió datos del empleado  
**Para** asegurar trazabilidad

### HU-09 Datos Venezuela

**Como** usuario de RRHH  
**Quiero** registrar datos IVSS, RIF, FAOV e INCES del empleado  
**Para** cumplir con obligaciones legales venezolanas

---

# 12. Pantallas del MVP

## Pantalla 1: Catálogos (Departamentos / Cargos / Bancos)

Tres páginas separadas bajo `/empresa/nomina/`:

- `/empresa/nomina/departamentos`
- `/empresa/nomina/cargos`
- `/empresa/nomina/bancos`

Cada una con DataTable + Dialog CRUD (patrón similar a `EmpresasList`)

## Pantalla 2: Listado de empleados

Ruta: `/empresa/nomina/empleados`

Componentes:

- Buscador (global filter)
- Filtros por columna (dropdowns para departamento, cargo, estatus)
- DataTable con paginación en servidor
- Botón "Nuevo empleado"
- Botón "Exportar"
- Menú contextual por fila: Ver, Editar, Cambiar estatus, Ver auditoría

## Pantalla 3: Crear/Editar empleado

Ruta: `/empresa/nomina/empleados/nuevo` y `/empresa/nomina/empleados/[id]/editar`

Formulario por secciones (stepper o tabs):

- Datos personales
- Datos laborales
- Seguridad social y fiscal
- Datos bancarios
- Datos adicionales

## Pantalla 4: Expediente del empleado

Ruta: `/empresa/nomina/empleados/[id]`

Tabs:

- Resumen
- Datos personales
- Datos laborales
- Seguridad social y fiscal
- Datos bancarios
- Historial (timeline de salario, cargo, estatus)
- Auditoría (vía `AuditHistoryDialog` existente)

---

# 13. Modelo de datos

## Enums nuevos (Prisma)

```
enum DocumentType { V, E, P }
enum EmployeeStatus { ACTIVE, INACTIVE, SUSPENDED, TERMINATED, ONBOARDING }
enum ContractType { INDEFINITE, FIXED_TERM, PROJECT, INTERNSHIP }
enum WorkShift { FULL_TIME, PART_TIME, MIXED, NIGHT }
enum PayFrequency { WEEKLY, BIWEEKLY, MONTHLY }
enum Currency { VES, USD }
enum AccountType { SAVINGS, CHECKING }
enum TerminationReason { RESIGNATION, DISMISSAL, MUTUAL_AGREEMENT, RETIREMENT }
```

## Tabla: departments

- id (cuid)
- companyId (FK → Empresa)
- name (String)
- code (String, opcional)
- description (String, opcional)
- isActive (Boolean, default true)
- createdAt, updatedAt
- `@@unique([name, companyId])`
- `@@map("departments")`

## Tabla: positions

- id (cuid)
- companyId (FK → Empresa)
- name (String)
- code (String, opcional)
- description (String, opcional)
- level (Int, opcional)
- isActive (Boolean, default true)
- createdAt, updatedAt
- `@@unique([name, companyId])`
- `@@map("positions")`

## Tabla: banks

- id (cuid)
- name (String)
- code (String, código SUDEBAN)
- isActive (Boolean, default true)
- createdAt, updatedAt
- `@@unique([code])`
- `@@map("banks")`

## Tabla: employees

- id (cuid)
- companyId (FK → Empresa)
- employeeCode (String)
- firstName (String)
- middleName (String, opcional)
- lastName (String)
- secondLastName (String, opcional)
- documentType (enum DocumentType)
- documentNumber (String)
- birthDate (DateTime)
- gender (String)
- maritalStatus (String, opcional)
- nationality (String, opcional)
- phone (String)
- email (String, opcional)
- address (String)
- birthPlace (String, opcional)
- dependents (Int, default 0) — cargas familiares
- ivssNumber (String, opcional) — Seguro Social
- rifNumber (String, opcional) — RIF empleado
- isFaovEnrolled (Boolean, default false)
- isIncesEnrolled (Boolean, default false)
- status (enum EmployeeStatus, default ACTIVE)
- hireDate (DateTime)
- terminationDate (DateTime, opcional)
- terminationReason (enum TerminationReason, opcional)
- emergencyContactName (String, opcional)
- emergencyContactPhone (String, opcional)
- observations (String, opcional)
- createdAt, updatedAt
- createdBy (FK → User)
- updatedBy (FK → User)
- `@@unique([companyId, employeeCode])`
- `@@unique([companyId, documentType, documentNumber])`
- `@@index([companyId, status])`
- `@@map("employees")`

## Tabla: employee_job_info (historial de cargo/departamento)

- id (cuid)
- employeeId (FK → Employee)
- positionId (FK → Position)
- departmentId (FK → Department)
- costCenter (String, opcional)
- contractType (enum ContractType)
- workShift (enum WorkShift)
- payFrequency (enum PayFrequency)
- supervisorId (FK → Employee, opcional)
- effectiveDate (DateTime)
- endDate (DateTime, opcional)
- isCurrent (Boolean, default true)
- createdBy (FK → User)
- createdAt (DateTime)
- `@@index([employeeId, isCurrent])`
- `@@map("employee_job_info")`

## Tabla: employee_salary_history

- id (cuid)
- employeeId (FK → Employee)
- salaryAmount (Decimal)
- currency (enum Currency)
- effectiveDate (DateTime)
- endDate (DateTime, opcional)
- isCurrent (Boolean, default true)
- createdBy (FK → User)
- createdAt (DateTime)
- `@@index([employeeId, isCurrent])`
- `@@map("employee_salary_history")`

## Tabla: employee_bank_accounts

- id (cuid)
- employeeId (FK → Employee)
- bankId (FK → Bank)
- accountType (enum AccountType)
- accountNumber (String, 20 chars)
- isPrimary (Boolean, default true)
- createdAt, updatedAt
- `@@map("employee_bank_accounts")`

## Tabla: employee_status_history

- id (cuid)
- employeeId (FK → Employee)
- status (enum EmployeeStatus)
- effectiveDate (DateTime)
- reason (String, opcional)
- comments (String, opcional)
- createdBy (FK → User)
- createdAt (DateTime)
- `@@map("employee_status_history")`

## Auditoría

Reutiliza `AuditLog` existente con:

- entity: "Employee" | "Department" | "Position" | "Bank"
- entityId: ID del registro afectado
- action: "CREATE" | "UPDATE" | "DELETE"
- changes: `{ before: {...}, after: {...} }`
- userId, metadata (ip, userAgent)

---

# 14. Permisos nuevos

### Backend (`backend/src/shared/constants/permissions.ts`)

```
EMPLOYEES_VIEW: "employees.view"
EMPLOYEES_CREATE: "employees.create"
EMPLOYEES_UPDATE: "employees.update"
EMPLOYEES_DELETE: "employees.delete"
EMPLOYEES_APPROVE: "employees.approve"

DEPARTMENTS_VIEW: "departments.view"
DEPARTMENTS_CREATE: "departments.create"
DEPARTMENTS_UPDATE: "departments.update"
DEPARTMENTS_DELETE: "departments.delete"

POSITIONS_VIEW: "positions.view"
POSITIONS_CREATE: "positions.create"
POSITIONS_UPDATE: "positions.update"
POSITIONS_DELETE: "positions.delete"

BANKS_VIEW: "banks.view"
BANKS_CREATE: "banks.create"
BANKS_UPDATE: "banks.update"
BANKS_DELETE: "banks.delete"
```

### Frontend (`frontend/lib/permissions.ts`)

Agregar a `PERMISSION_GROUPS`:

```
{ prefix: "employees", label: "Empleados", icon: "pi pi-id-card" }
{ prefix: "departments", label: "Departamentos", icon: "pi pi-sitemap" }
{ prefix: "positions", label: "Cargos", icon: "pi pi-briefcase" }
{ prefix: "banks", label: "Bancos", icon: "pi pi-building" }
```

### Seed

Actualizar `permissions.seed.ts` para incluir todos los permisos nuevos.

---

# 15. Validaciones del formulario

## Personales

- Nombre: requerido, min 2 chars
- Apellido: requerido, min 2 chars
- Tipo documento: requerido (V/E/P)
- Número documento: requerido, numérico, 6-10 dígitos
- Fecha nacimiento: requerida, empleado debe ser ≥ 14 años (edad mínima legal Venezuela)
- Teléfono: requerido, formato Venezuela (+58 o 04XX)
- Dirección: requerida

## Laborales

- Código empleado: requerido, alfanumérico
- Fecha ingreso: requerida, no futura por defecto
- Cargo: requerido (FK a catálogo)
- Departamento: requerido (FK a catálogo)
- Salario: requerido, > 0, Decimal
- Moneda: requerida (VES/USD)
- Frecuencia de pago: requerida
- Tipo contrato: requerido
- Tipo jornada: requerido

## Seguridad social

- IVSS: opcional, formato numérico
- RIF: opcional, formato J/V/E/G-XXXXXXXX-X

## Bancarios

- Banco: requerido (FK a catálogo)
- Tipo cuenta: requerido
- Número cuenta: requerido, exactamente 20 dígitos

---

# 16. Criterios de salida del MVP

Este MVP se considera listo si:

- Existen catálogos funcionales de departamentos, cargos y bancos
- Se pueden registrar empleados con datos completos (incluyendo campos Venezuela)
- Se pueden consultar en listado con filtros y paginación
- Se puede abrir expediente con todas las secciones
- Se pueden editar datos con historial automático de salario y cargo
- Se puede cambiar estatus con motivo y fecha efectiva
- Se guarda histórico de salario, cargo y estatus
- Existe auditoría vía `AuditLog` existente
- Los empleados quedan listos para ser usados en el módulo de nómina
- El acceso está controlado por permisos granulares

# 17. Fases de desarrollo

## Fase 0 — Catálogos base

**Objetivo:** Tener los catálogos necesarios antes de crear empleados.

1. Modelos Prisma: `Department`, `Position`, `Bank` + enums nuevos
2. Migration
3. Seed de bancos venezolanos
4. Backend: CRUD departamentos (`nomina/departments/` — controller, service, routes, types, validation)
5. Backend: CRUD cargos (`nomina/positions/` — misma estructura)
6. Backend: CRUD bancos (`nomina/banks/` — misma estructura)
7. Frontend: Páginas de catálogos (3 páginas con DataTable + Dialog)
8. Permisos: `departments.*`, `positions.*`, `banks.*`
9. Menú: Agregar items al `AppMenuEmpresa`

**Verificación:** Poder crear, listar, editar y desactivar departamentos, cargos y bancos.

## Fase 1 — CRUD de empleados

**Objetivo:** Poder crear, listar, ver y editar empleados.  
_Depende de: Fase 0_

1. Modelos Prisma: `Employee`, `EmployeeJobInfo`, `EmployeeSalaryHistory`, `EmployeeBankAccount`
2. Migration
3. Backend: CRUD empleados (`nomina/employees/` — controller, service, routes, types, validation)
   - `POST /nomina/employees` (crear + primer job info + primer salary + bank account)
   - `GET /nomina/employees` (listado paginado con filtros)
   - `GET /nomina/employees/:id` (expediente completo con includes)
   - `PUT /nomina/employees/:id` (editar con historial automático)
4. Frontend: Listado de empleados (DataTable + filtros)
5. Frontend: Formulario crear/editar (por secciones)
6. Frontend: Expediente (vista con tabs)
7. Permisos: `employees.*`
8. Auditoría: `AuditLog` en cada operación

**Verificación:** Poder crear un empleado completo, verlo en listado, abrir expediente, editar datos.

## Fase 2 — Estatus e historial

**Objetivo:** Gestión completa de estatus y vista de historial.  
_Depende de: Fase 1_

1. Modelo Prisma: `EmployeeStatusHistory`
2. Backend: Endpoint de cambio de estatus (`POST /nomina/employees/:id/status`)
3. Backend: Endpoint de historial (`GET /nomina/employees/:id/history`)
4. Frontend: Dialog/formulario de cambio de estatus
5. Frontend: Tab de historial en expediente (timeline view)
6. Frontend: Exportación de listado (nativo DataTable)

**Verificación:** Poder cambiar estatus con motivo, ver historial completo de cambios de salario/cargo/estatus.

---

# 18. Próximas iteraciones (fuera del MVP)

1. Importación masiva por CSV/Excel
2. Gestión de múltiples cuentas bancarias
3. Contactos de emergencia como entidad separada
4. Cargas familiares detalladas (datos de cada dependiente)
5. Documentos adjuntos (contratos, cartas, etc.)
6. Reingresos complejos
7. Reportes de empleados
