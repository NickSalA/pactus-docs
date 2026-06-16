---
title: Administración
description: Panel de administración para gestión de usuarios, alertas, servicios y configuración organizacional.
---

El **Panel de Administración** es el módulo de gestión central para administradores de la organización. Permite configurar usuarios, establecer reglas de notificación, gestionar el catálogo de servicios y administrar las carpetas organizacionales.

## Estructura del Panel

El panel se organiza en las siguientes secciones principales:

| Sección | Ruta | Descripción |
|---------|------|-------------|
| **Dashboard Admin** | `/admin/dashboard` | Resumen del sistema y módulos de acceso rápido |
| **Gestión de Accesos** | `/admin/access` | Usuarios y permisos de la organización |
| **Configuración de Alertas** | `/admin/alerts` | Reglas de notificación por email |
| **Gestión Documental** | `/admin/document-management` | Plantillas y servicios |
| **Auditoría** | `/admin/audit` | Registro de eventos de usuarios y chatbot |

## Dashboard de Administración

El dashboard admin presenta un resumen del estado del sistema:

### Tarjetas de Resumen

| Métrica | Descripción |
|---------|-------------|
| **Total de Alertas** | Cantidad de reglas de notificación configuradas |
| **Carpetas** | Número de carpetas organizacionales |
| **Servicios** | Cantidad de servicios en el catálogo |
| **Plantillas** | Número de plantillas disponibles |
| **Usuarios** | Total de usuarios en la organización |

### Módulos de Acceso Rápido

| Módulo | Descripción |
|--------|-------------|
| **Gestión de Usuarios** | Ir a la sección de miembros |
| **Configuración de Alertas** | Ir a reglas de notificación |
| **Gestión Documental** | Ir a plantillas y servicios |

## Gestión de Accesos

### Tabla de Miembros

La sección de accesos muestra todos los usuarios de la organización en una tabla paginada:

| Columna | Descripción |
|---------|-------------|
| **Usuario** | Nombre, email e iniciales del avatar |
| **Rol Asignado** | ADMIN, HR, MANAGER o WORKER (mostrado como badge) |
| **Email para Alertas** | Correo alternativo para notificaciones |
| **Recibe Alertas** | Toggle switch para activar/desactivar notificaciones |
| **Estado** | Activo o inactivo |
| **Acciones** | Botones de editar rol y eliminar miembro |

### Agregar Usuario (Modal)

El administrador puede invitar nuevos usuarios mediante un modal con formulario:

| Campo | Descripción |
|-------|-------------|
| **Email** | Correo electrónico del nuevo usuario |
| **Rol** | Rol que se asignará (WORKER, HR, MANAGER, ADMIN) |

La validación del formulario usa **Zod** y **React Hook Form**. Al enviar, se hace un `POST /organizations/me/members` con `{ email, role }`.

> **Nota:** El rol `SUPERADMIN` no se gestiona desde esta tabla. Los superadministradores se autentican desde `/super-admin` con credenciales de email y contraseña, y pueden crear organizaciones completas desde esa interfaz.

### Editar Rol (Modal)

Al hacer clic en el icono de editar en la tabla, se abre un modal precargado con:

| Campo | Descripción |
|-------|-------------|
| **Email** | Correo del miembro (solo lectura) |
| **Rol** | Selector de rol (WORKER, HR, MANAGER, ADMIN) |

La actualización se realiza mediante `PATCH /user/{user_id}` con `{ role }`.

### Eliminar Miembro (Modal)

Al hacer clic en el icono de eliminar, se muestra un modal de confirmación con el nombre y email del miembro. Al confirmar, se ejecuta `DELETE /user/{user_id}` (soft delete).

### Toggle de Notificaciones

Cada fila en la tabla tiene un interruptor (toggle switch) que permite activar o desactivar las alertas por email para ese miembro. La acción se envía como `PATCH /organizations/me/members/{member_id}/notifications` con `{ receives_notifications: true/false }`.

### Estadísticas de Usuarios

| Métrica | Descripción |
|---------|-------------|
| **Usuarios Activos** | Usuarios que han iniciado sesión |
| **Total de Usuarios** | Cantidad total de usuarios registrados |

## Configuración de Alertas

El sistema permite configurar reglas de notificación para recordar eventos importantes:

### Tipos de Regla

| Tipo | Descripción |
|------|-------------|
| **General** | Aplica a todos los contratos de la organización |
| **Por Contrato** | Aplica a un contrato específico |

### Crear Regla de Alerta

| Campo | Descripción |
|-------|-------------|
| **Días de Anticipación** | Cuántos días antes del vencimiento se envía la alerta |
| **Alcance** | General o específico por contrato |
| **Frecuencia** | Periodicidad del envío (diaria, semanal, etc.) |
| **Responsable** | Usuario o rol responsable de la alerta |
| **Canales de Notificación** | Medios por los que se notifica (email, etc.) |
| **Activo** | Si la regla está habilitada o no |

### Operaciones de Alertas

| Acción | Descripción |
|--------|-------------|
| **Crear** | Nueva regla de notificación |
| **Editar** | Modificar parámetros de la regla |
| **Eliminar** | Eliminar regla individual |
| **Bulk Delete** | Eliminar múltiples reglas seleccionadas |
| **Activar/Desactivar** | Habilitar o deshabilitar sin eliminar |

### Estadísticas de Alertas

| Métrica | Descripción |
|---------|-------------|
| **Total de Reglas** | Cantidad de reglas configuradas |
| **Reglas Activas** | Reglas actualmente habilitadas |
| **Reglas por Contrato** | Reglas específicas vs generales |
| **Envío Manual** | Opción de enviar alertas inmediatamente |

### Cron Job de Alertas

El sistema ejecuta un proceso automático diario que:

1. Revisa todos los contratos próximos a vencer
2. Aplica las reglas de notificación activas
3. Envía emails consolidados a los usuarios
4. Registra logs para evitar envíos duplicados

## Gestión Documental

La sección de gestión documental contiene dos tabs principales con `AdminSegmentedTabs`:

### Tab 1: Plantillas de Contratos

Incluye un `TemplatesFilterBar` con los siguientes filtros:

| Filtro | Tipo | Descripción |
|--------|------|-------------|
| **Búsqueda** | Texto | Búsqueda por nombre de plantilla |
| **Tipo de Documento** | Select | Filtro por tipo documental |
| **Formato** | Select | Filtro por formato |
| **Estado** | Select | Filtro por estado (DRAFT, PUBLISHED, ARCHIVED) |

La tabla de plantillas (`TemplatesTable`) es paginada mediante `useTablePagination`.

**Modales asociados:**

| Modal | Propósito |
|-------|-----------|
| `TemplateFormModal` | Crear nueva plantilla (con generación de borrador por IA) |
| `TemplateEditModal` | Editar plantilla existente |
| `TemplateViewModal` | Previsualizar plantilla con advertencias |

**Operaciones disponibles:**

| Operación | Descripción |
|-----------|-------------|
| **Crear** | Nueva plantilla con editor |
| **Editar** | Modificar plantilla existente |
| **Publicar** | Cambiar estado a PUBLISHED |
| **Archivar** | Cambiar estado a ARCHIVED |
| **Vista previa** | Visualizar plantilla con alertas de campos faltantes |
| **Eliminar** | Eliminar plantilla |

#### Estados de Plantilla

| Estado | Indicador Visual |
|--------|-----------------|
| **DRAFT** | Borde amarillo |
| **PUBLISHED** | Borde verde |
| **ARCHIVED** | Borde gris |

### Tab 2: Gestión de servicios

Contiene dos sub-tabs manejados por `AdminSegmentedTabs` con badges numéricos:

#### Sub-tab: Servicios

Tres tarjetas de estadísticas (`AdminStatCard`):
| Métrica | Descripción |
|---------|-------------|
| **Total** | Cantidad total de servicios |
| **Activos** | Servicios actualmente habilitados |
| **En uso** | Servicios vinculados a contratos |

Tabla de servicios paginada con columnas: Servicio, Estado, Contratos, Creado, Acciones.

**Operaciones:**
| Operación | Descripción |
|-----------|-------------|
| **Crear** | Nuevo servicio mediante `AdminServiceModal` |
| **Editar** | Modificar datos del servicio |
| **Activar/Desactivar** | Toggle sin eliminar |
| **Eliminación individual** | Solo si `documents_count === 0` |
| **Bulk Delete** | Selección múltiple con `TableBulkActionBar`, solo servicios sin contratos asociados |

**Campos del servicio:**
| Campo | Descripción |
|-------|-------------|
| **Nombre** | Nombre del servicio |
| **Descripción** | Detalle del servicio |
| **Precio** | Monto del servicio |
| **Moneda** | PEN, USD, EUR |
| **Activo** | Si está disponible para uso |

#### Sub-tab: Tipos de Documento

Grid de `DocumentTypeCard` en dos columnas (`lg:grid-cols-2`). Vista de solo lectura con información de referencia de cada tipo documental disponible.

## Auditoría

La sección de auditoría (`/admin/audit`) muestra registros de actividad del sistema organizados en 4 tabs segmentados mediante `AdminSegmentedTabs`:

| Tab | Componente | Contenido |
|-----|------------|-----------|
| **Actividad de Usuarios** | `AdminAuditUsersTable` | Eventos de inicio de sesión, cambios de rol, modificaciones de perfil |
| **Actividad de Chatbot** | `AdminAuditChatbotTable` | Historial de conversaciones del agente IA |
| **Contratos** | `AdminAuditContractsTable` | Eventos CRUD sobre contratos (creación, edición, eliminación) |
| **Plantillas** | `AdminAuditTemplatesTable` | Eventos CRUD sobre plantillas |

### Estados de la Página

| Estado | Comportamiento |
|--------|----------------|
| **Carga** | Spinner centrado con `min-h-[60vh]` |
| **Error** | Mensaje de error en rojo + botón "Reintentar" que ejecuta `page.reload()` |
| **Vacío** | Cada tabla maneja internamente su estado empty |

### Hook

`useAdminAuditPage` gestiona: `users`, `chatbot`, `contracts`, `templates` (arrays de items), `activeTab`, `loading`, `error`, `reload`.

## Notificaciones por Email

### Servicio de Gmail

El sistema utiliza **Gmail API** para el envío de notificaciones:

| Configuración | Descripción |
|---------------|-------------|
| **OAuth2** | Autenticación segura con cuenta de Gmail |
| **Token Refresh** | Renovación automática de tokens |
| **Logs de Envío** | Registro de emails enviados |

### Tipos de Notificación

| Tipo | Trigger |
|------|---------|
| **Vencimiento Próximo** | X días antes del fin del contrato |
| **Contrato Vencido** | El día del vencimiento |
| **Nueva Alerta** | Cuando se crea una nueva regla |

## Permisos del Panel de Admin

| Rol | Acceso al Panel Admin |
|-----|----------------------|
| **ADMIN** | Acceso completo a todas las secciones |
| **MANAGER** | Sin acceso |
| **WORKER** | Sin acceso |

Solo los usuarios con rol ADMIN pueden acceder al panel de administración.