---
title: Usuarios y Organizaciones
description: Usuario funcional, organizacion, miembros, roles y preferencias de notificacion.
---

Pactus separa la identidad autenticada del usuario funcional. La identidad vive en Supabase Auth; el usuario de negocio vive en el backend como `User`.

## Usuario Funcional

El tipo `User` del frontend contiene:

| Campo                    | Uso                                      |
| ------------------------ | ---------------------------------------- |
| `id`                     | Identificador interno del usuario.       |
| `organization_id`        | Organizacion a la que pertenece.         |
| `supabase_user_id`       | Vinculo con Supabase Auth.               |
| `email`                  | Correo del usuario.                      |
| `full_name`              | Nombre mostrado.                         |
| `avatar_url`             | Imagen de perfil.                        |
| `role`                   | Rol funcional.                           |
| `receives_notifications` | Indica si recibe alertas de vencimiento. |
| `is_active`              | Estado del usuario.                      |

El perfil actual se obtiene con:

```http
GET /user/me
```

El frontend lo consume desde `src/lib/api/auth.ts`.

## Organizacion

La organizacion funciona como tenant. Contratos, plantillas, servicios, carpetas, conversaciones y reglas de notificacion se filtran por `organization_id` en el backend.

**Nota de implementación:** El endpoint `DELETE` no elimina físicamente la organización sino que establece `is_active=false` (soft delete). La creación de organización (`POST /organizations`) crea simultáneamente el primer usuario ADMIN local.

### Campos de Organizacion

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único |
| `name` | string | Nombre de la organización |
| `is_active` | boolean | Estado lógico (soft delete) |
| `ruc` | string | Identificador tributario (11 dígitos) |
| `address` | string | Dirección legal |
| `company_type` | string | Tipo de empresa |
| `objeto_social` | string | Objeto social |
| `legal_rep_name` | string | Nombre del representante legal |
| `legal_rep_dni` | string | DNI del representante legal (8 dígitos) |
| `jurisdiction` | string | Jurisdicción |
| `city` | string | Ciudad |
| `autorizacion_entidad` | string | Entidad de autorización |
| `autorizacion_fecha` | date | Fecha de autorización |
| `autorizacion_emitida_por` | string | Emisor de autorización |
| `email` | email | Correo corporativo |
| `phone` | string | Teléfono (9 dígitos) |

## Roles

Los roles reales son:

| Rol         | Uso funcional                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `SUPERADMIN` | Administrador global. Puede crear y eliminar organizaciones, y acceder a cualquier org.        |
| `ADMIN`     | Administración amplia de la organización.                                                       |
| `HR`        | Gestion de contratos laborales y carpetas de RRHH.                                              |
| `MANAGER`   | Gestion de contratos empresariales y carpetas de gestion contractual.                           |
| `WORKER`    | Consulta de contratos empresariales, sin escritura contractual.                                 |

## Miembros de Organizacion

El frontend define `OrganizationMember` como alias de `User`. Los miembros se administran con:

| Metodo | Ruta | Uso |
| ------ | ---- | --- |
| `GET` | `/organizations/me/members` | Listar miembros de la organizacion actual |
| `POST` | `/organizations/me/members` | Agregar miembro por email y rol |
| `PATCH` | `/organizations/me/members/{member_id}/role` | Actualizar rol de un miembro |
| `PATCH` | `/organizations/me/members/{member_id}/notifications` | Activar o desactivar alertas por usuario |

El cliente frontend usa estos endpoints desde `src/lib/api/organizations.ts`.

## Gestion de Organizaciones

Endpoints para administración directa de organizaciones:

| Metodo | Ruta | Uso | Permisos |
| ------ | ---- | --- | -------- |
| `GET` | `/organizations` | Listar organizaciones | SUPERADMIN: todas, ADMIN: solo la suya |
| `POST` | `/organizations` | Crear organización con admin inicial | SUPERADMIN |
| `GET` | `/organizations/me` | Obtener datos de la organizacion actual | ADMIN |
| `PATCH` | `/organizations/me` | Actualizar datos de la organizacion actual | ADMIN |
| `GET` | `/organizations/{organization_id}` | Obtener organización por ID | SUPERADMIN: cualquier org, ADMIN: solo la suya |
| `PATCH` | `/organizations/{organization_id}` | Actualizar organización por ID | SUPERADMIN: cualquier org, ADMIN: solo la suya |
| `DELETE` | `/organizations/{organization_id}` | Soft delete (is_active=false) | SUPERADMIN |

Los endpoints de listado soportan paginacion con `limit` y `offset`, y filtros por `is_active`, `name` y `ruc`.

## Preferencia de Notificaciones

`receives_notifications` controla si el usuario participa en alertas de vencimiento. El backend tambien exige que el usuario este activo para listar o enviar eventos de notificacion a ese usuario.

## Acceso a la Navegacion

El sidebar del frontend filtra las pestañas segun el rol del usuario:

### Menú Principal

| Pestaña    | Ruta       | ADMIN | HR  | MANAGER | WORKER |
| ---------- | ---------- | ----- | --- | ------- | ------ |
| Dashboard  | /dashboard | Si    | Si  | Si      | Si     |
| Contratos  | /contracts | Si    | Si  | Si      | Si     |
| Plantillas | /templates | Si    | Si  | Si      | No     |
| Agente IA  | /ai-agent  | Si    | Si  | Si      | Si     |

- ADMIN tiene acceso sin restriccion por tipo documental (no filtrado por COMPANY/LABOR).

### Consola de Administracion

Solo ADMIN puede acceder a las rutas `/admin/*`:

| Pestaña                  | Ruta                       |
| ------------------------ | -------------------------- |
| Dashboard                | /admin                     |
| Gestion de Accesos       | /admin/access              |
| Configuracion de Alertas | /admin/alerts              |
| Gestion Documental       | /admin/document-management |

Las funciones de permisos en el frontend (`canAccessAdminConsole`, `canAuthorTemplates`) definen estas reglas en `src/lib/permissions.ts`.
