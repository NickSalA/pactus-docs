---
title: Modelo Entidad Relacion
description: Relaciones reales entre las tablas de negocio en Supabase y su enlace con Auth, Storage y Checkpoints.
---

Este documento resume la estructura relacional real de **ContractIA** en Supabase e incluye el **MER** actual del proyecto.

## MER

![Modelo Entidad-Relacion de ContractIA](../../../../assets/base-datos/02-modelo-entidad-relacion/mer-bd.png)

## Vista Conceptual de Relaciones

<div style="display: flex; justify-content: center;">
  <pre style="display: inline-block; text-align: left; white-space: pre; overflow-x: auto;"><code>                    ┌────────────────────┐
                    │    auth.users      │
                    └─────────┬──────────┘
                              │
                              │ (relación lógica: supabase_user_id)
                              ▼
                    ┌────────────────────┐
                    │    public.users    │
                    └─────────┬──────────┘
                              │
                              │ N:1
                              ▼
                    ┌──────────────────────┐
                    │ public.organizations │
                    └─────────┬────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │ 1:N                 │ 1:N                 │ 1:N
        ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────────────┐
│ public.documents│   │ public.services │   │ public.document_templates│
└────────┬────────┘   └────────┬────────┘   └──────────────────────────┘
         │                     │
         │ 1:N                 │ N:1
         ▼                     ▼
   ┌────────────────────────────────────┐
   │     public.documents_services      │
   │    (tabla intermedia enriquecida)  │
   └────────────────────────────────────┘
   </code></pre>
</div>

## Relaciones Principales

### `organizations` -> `users`

Una organizacion puede tener varios usuarios de negocio. Cada fila de `public.users` pertenece a una sola organizacion mediante `organization_id`.

### `organizations` -> `documents`

Cada documento pertenece a una organizacion. Esto asegura que el conocimiento legal, los contratos y su metadata queden aislados por tenant.

### `organizations` -> `services`

Los servicios catalogados por la empresa tambien se separan por organizacion, lo que permite reutilizarlos en contratos y plantillas economicas internas.

### `documents` -> `documents_services`

La tabla `documents_services` actua como tabla intermedia enriquecida. No solo vincula un documento con un servicio, sino que tambien guarda atributos propios de esa asociacion:

- `description`
- `value`
- `currency`
- `start_date`
- `end_date`

### `services` -> `documents_services`

Un servicio puede aparecer en varios documentos. Esto permite que un mismo servicio corporativo se use en distintos contratos sin duplicar su definicion base.

### `users` -> `conversations`

Cada conversacion pertenece a un usuario de negocio y a una organizacion. El historial visible para la aplicacion se guarda directamente en `public.conversations.content` como `jsonb`.

### `conversations` -> `checkpoint.*`

El esquema `checkpoint` guarda el estado tecnico del agente. No hay foreign key fisica hacia `public.conversations`, pero el `thread_id` observado en checkpoints coincide con el `id` de las conversaciones del sistema.

### `auth.users` -> `public.users`

Esta relacion es logica, no fisica:

- `auth.users.id` representa la identidad autenticada en Supabase.
- `public.users.supabase_user_id` representa la vinculacion de esa identidad con el perfil de negocio del sistema.

### `documents` -> `storage.objects`

Tampoco hay una foreign key fisica entre negocio y storage. La aplicacion enlaza ambas capas usando:

- `public.documents.file_path`
- `public.documents.file_name`
- bucket `documents`

## Lectura Correcta del Modelo

Para entender bien la base de datos conviene separar tres niveles:

| Nivel | Donde vive | Que resuelve |
|------|------------|--------------|
| Identidad | `auth.*` | Login, proveedor Google, sesiones y tokens |
| Negocio | `public.*` | Organizaciones, usuarios, documentos, conversaciones y plantillas |
| Soporte tecnico | `checkpoint.*`, `storage.*` | Estado del agente y archivos fisicos |

Ese desacoplamiento hace que el modelo sea mas mantenible: la autenticacion no contamina las tablas de negocio y el almacenamiento de archivos no obliga a duplicar binarios en tablas relacionales.
