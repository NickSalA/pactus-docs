---
title: Usuarios y Organizaciones
description: Usuario funcional, organizacion, miembros, roles y preferencias de notificacion.
---

ContractIA separa la identidad autenticada del usuario funcional. La identidad vive en Supabase Auth; el usuario de negocio vive en el backend como `User`.

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

## Roles

Los roles reales son:

| Rol       | Uso funcional                                                         |
| --------- | --------------------------------------------------------------------- |
| `ADMIN`   | Administracion amplia de la organizacion.                             |
| `HR`      | Gestion de contratos laborales y carpetas de RRHH.                    |
| `MANAGER` | Gestion de contratos empresariales y carpetas de gestion contractual. |
| `WORKER`  | Consulta de contratos empresariales, sin escritura contractual.       |

## Miembros de Organizacion

El frontend define `OrganizationMember` como alias de `User`. Los miembros se administran con:

| Metodo  | Ruta                                                  | Uso                                        |
| ------- | ----------------------------------------------------- | ------------------------------------------ |
| `GET`   | `/organizations/me/members`                           | Listar miembros de la organizacion actual. |
| `POST`  | `/organizations/me/members`                           | Agregar miembro por email y rol.           |
| `PATCH` | `/organizations/me/members/{member_id}/role`          | Actualizar rol.                            |
| `PATCH` | `/organizations/me/members/{member_id}/notifications` | Activar o desactivar alertas por usuario.  |

El cliente frontend usa estos endpoints desde `src/lib/api/organizations.ts`.

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
