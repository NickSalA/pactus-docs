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

La sección de gestión documental contiene dos tabs:

### Tab 1: Plantillas

| Operación | Descripción |
|-----------|-------------|
| **Crear** | Nueva plantilla con wizard |
| **Editar** | Modificar plantilla existente |
| **Publicar** | Cambiar estado a PUBLISHED |
| **Archivar** | Cambiar estado a ARCHIVED |
| **Eliminar** | Eliminar plantilla |

#### Estados de Plantilla

| Estado | Indicador Visual |
|--------|-----------------|
| **DRAFT** | Borde amarillo |
| **PUBLISHED** | Borde verde |
| **ARCHIVED** | Borde gris |

### Tab 2: Gestión de Servicios

Este tab contiene dos sub-secciones:

**Catálogo de Servicios:** CRUD completo para mantener un inventario de servicios ofrecidos:

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Nombre del servicio |
| **Descripción** | Detalle del servicio |
| **Precio** | Monto del servicio |
| **Moneda** | PEN, USD, EUR |
| **Activo** | Si está disponible para uso |

| Operación | Descripción |
|-----------|-------------|
| **Crear** | Nuevo servicio en el catálogo |
| **Editar** | Modificar datos del servicio |
| **Eliminar** | Eliminar servicio |
| **Activar/Desactivar** | Habilitar/inhabilitar sin eliminar |

**Tipos de Documento:** Lista de referencia de los tipos de documento disponibles (solo lectura).

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