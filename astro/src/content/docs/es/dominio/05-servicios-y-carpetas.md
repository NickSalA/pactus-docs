---
title: Servicios y Carpetas
description: Catalogo de servicios, lineas economicas de contratos y organizacion documental por carpetas.
---

Servicios y carpetas complementan a los contratos. Los servicios explican el detalle economico; las carpetas organizan contratos segun rol y visibilidad.

## Servicios

Un servicio se representa como `ServiceCatalogItem`.

| Campo | Uso |
|-------|-----|
| `id` | Identificador del servicio. |
| `name` | Nombre visible. |
| `is_active` | Permite ocultar servicios sin eliminarlos. |
| `documents_count` | Cantidad de contratos que usan el servicio. |
| `created_at` | Fecha de creacion. |
| `updated_at` | Fecha de actualizacion. |

Los servicios son catalogo. Cuando se usan en un contrato, se convierten en `service_items` con valor, moneda, descripcion y fechas propias.

## Endpoints de Servicios

| Metodo | Ruta | Uso |
|--------|------|-----|
| `GET` | `/services/` | Listar servicios activos o visibles. |
| `POST` | `/services/` | Crear servicio. |
| `PATCH` | `/services/{service_id}` | Actualizar nombre o estado. |
| `DELETE` | `/services/{service_id}` | Eliminar servicio. |

El frontend consume estos endpoints desde `src/lib/api/documents.ts`.

## Carpetas

Una carpeta se representa como `DocumentFolder`.

| Campo | Uso |
|-------|-----|
| `id` | Identificador de la carpeta. |
| `organization_id` | Organizacion propietaria. |
| `name` | Nombre visible. |
| `owner_role` | Rol propietario de la carpeta. |
| `created_by` | Usuario que creo la carpeta. |
| `created_by_name` | Nombre del creador. |
| `created_by_email` | Email del creador. |
| `documents_count` | Cantidad de contratos organizados. |

El frontend muestra carpetas administrativas como carpetas de RRHH y carpetas de gestor de contratos.

## Permisos de Carpetas

Las reglas reales vienen de `access_policy.py` y `permissions.ts`.

| Rol | Puede crear carpetas | Puede gestionar carpetas de |
|-----|----------------------|-----------------------------|
| `ADMIN` | Si | Sin restriccion explicita por rol propietario |
| `HR` | Si | `HR` |
| `MANAGER` | Si | `MANAGER` |
| `WORKER` | No | Ninguna |

Para lectura de carpetas, `WORKER` puede leer carpetas con `owner_role` `MANAGER`; `HR` lee `HR`; `MANAGER` lee `MANAGER`; `ADMIN` no tiene restriccion explicita.

## Endpoints de Carpetas

| Metodo | Ruta | Uso |
|--------|------|-----|
| `GET` | `/folders/` | Listar carpetas visibles. |
| `POST` | `/folders/` | Crear carpeta. |
| `PATCH` | `/folders/{folder_id}` | Actualizar nombre. |
| `DELETE` | `/folders/{folder_id}` | Eliminar carpeta. |
