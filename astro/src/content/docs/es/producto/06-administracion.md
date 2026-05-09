---
title: Administración
description: Panel de administración para gestión de usuarios, alertas, servicios y configuración organizacional.
---

El **Panel de Administración** es el módulo de gestión central para administradores de la organización. Permite configurar usuarios, establecer reglas de notificación, gestionar el catálogo de servicios y administrar las carpetas organizacionales.

## Estructura del Panel

El panel se organiza en las siguientes secciones principales:

| Sección | Ruta | Descripción |
|---------|------|-------------|
| **Dashboard Admin** | `/admin` | Resumen del sistema y módulos de acceso rápido |
| **Gestión de Accesos** | `/admin/access` | Usuarios y permisos de la organización |
| **Configuración de Alertas** | `/admin/alerts` | Reglas de notificación por email |
| **Gestión Documental** | `/admin/document-management` | Plantillas, carpetas y servicios |

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
| **Gestión Documental** | Ir a plantillas, carpetas y servicios |

## Gestión de Accesos

### Tabla de Miembros

La sección de accesos muestra todos los usuarios de la organización:

| Columna | Descripción |
|---------|-------------|
| **Usuario** | Nombre y email |
| **Rol** | ADMIN, MANAGER o WORKER |
| **Estado** | Activo o inactivo |
| **Notificaciones** | Preferencia de alertas email |

### Agregar Usuario

El administrador puede invitar nuevos usuarios:

| Campo | Descripción |
|-------|-------------|
| **Email** | Correo electrónico del nuevo usuario |
| **Rol** | Rol que se asignará (ADMIN, MANAGER, WORKER) |
| **Nombre** | Nombre completo del usuario |

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

La sección de gestión documental contiene tres tabs:

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

### Tab 2: Gestor de Carpetas

| Operación | Descripción |
|-----------|-------------|
| **Crear Carpeta** | Nueva carpeta organizacional |
| **Renombrar** | Cambiar nombre de carpeta |
| **Eliminar** | Eliminar carpeta vacía |

Las carpetas corresponden a los roles y se crean automáticamente según la estructura organizacional.

### Tab 3: Gestión de Servicios

El catálogo de servicios permite mantener un inventario de servicios ofrecidos:

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