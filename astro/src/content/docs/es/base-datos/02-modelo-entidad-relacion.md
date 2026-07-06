---
title: Modelo Entidad Relación
description: Relaciones vigentes entre las tablas de negocio, auditoría, telemetría, Auth y Storage en Supabase.
---

Este documento resume la estructura relacional actual de **Pactus** en Supabase.

## MER

![Modelo Entidad-Relacion de Pactus](../../../../assets/base-datos/02-modelo-entidad-relacion/mer-bd.png)

La imagen del MER puede actualizarse por separado. La vista textual y las relaciones listadas a continuación reflejan el esquema vigente del producto.

## Vista Conceptual de Relaciones

<div style="display: flex; justify-content: center;">
  <pre style="display: inline-block; text-align: left; white-space: pre; overflow-x: auto;"><code>                    auth.users
                          |
                          | relacion logica: identity.users.supabase_user_id
                          v
                    identity.users ----------------------+
                        |                                |
                        |                                +----> chatbot.conversations
                        |                                |             |
                        |                                |             +----> audit.chatbot_activity
                        |                                |
                        |                                +----> contracts.document_folders
                        |                                |
                        |                                +----> audit.user_activity
                        |                                +----> audit.contract_activity
                        |                                +----> audit.template_activity
                        v
                  identity.organizations
            +------------+-----------+------------+-------------+---------------+
            |            |           |            |             |               |
            v            v           v            v             v               v
  contracts.documents  catalog.services  templates.document_templates  notifications.notification_rules  notifications.notification_send_logs
            |                  ^                   ^
            |                  |                   |
            |                  |                   +---- templates.template_formats
            |                  |
            +----> contracts.company_contracts
            |              |
            |              +----> contracts.company_contract_services
            |
            +----> contracts.labor_contracts
            |
            +----> storage.objects (relacion por file_path)
            |
            +----> audit.contract_activity

  audit.* referencia identity.organizations e identity.users para preservar tenant y actor.
    </code></pre>
</div>

## Relaciones Principales

### `identity.organizations` -> tablas del dominio

`identity.organizations` es la raíz del tenant. Desde ahí se referencian:

- `identity.users`
- `contracts.documents`
- `catalog.services`
- `chatbot.conversations`
- `templates.document_templates`
- `notifications.notification_rules`
- `contracts.document_folders`
- `notifications.notification_send_logs`
- `audit.user_activity`
- `audit.chatbot_activity`
- `audit.contract_activity`
- `audit.template_activity`

### `identity.users` -> `chatbot.conversations`

Cada conversación pertenece a un usuario y a una organización. El historial visible se conserva en `chatbot.conversations.content` como `jsonb`.

### `identity.users` -> `contracts.document_folders`

Cada carpeta registra en `created_by` el usuario que la creó. Esto permite mostrar autoría y aplicar reglas de gestión por rol.

### `contracts.documents` -> `contracts.document_folders`

La relación es opcional mediante `documents.folder_id`. Un contrato puede quedar sin carpeta o asignarse a una carpeta visible para el rol propietario de esa carpeta.

### `contracts.documents` -> `contracts.company_contracts`

`contracts.company_contracts` es la tabla de extension para contratos corporativos. Almacena el RUC y el nombre del cliente asociado. La relación es uno a uno mediante `document_id`.

### `contracts.documents` -> `contracts.labor_contracts`

`contracts.labor_contracts` es la tabla de extension para contratos laborales. Almacena el nombre del trabajador, su documento, el cargo, el salario y la modalidad contractual. La relación es uno a uno mediante `document_id`.

### `contracts.company_contracts` -> `contracts.company_contract_services`

`contracts.company_contract_services` enlaza un contrato corporativo con servicios del catálogo. Además de la referencia, persiste la descripción, el valor monetario, la moneda y las fechas propias de cada línea contractual.

### `catalog.services` -> `contracts.company_contract_services`

Un servicio del catálogo puede aparecer en muchas líneas contractuales. La relación física es `contracts.company_contract_services.service_id -> catalog.services.id`.

### `templates.template_formats` -> `templates.document_templates`

Una plantilla puede apuntar opcionalmente a un formato mediante `template_format_id`. Este catálogo separa el tipo documental (`document_type`) del formato funcional concreto (`format_code`).

### `notifications.notification_rules` -> `contracts.documents`

`notifications.notification_rules.document_id` es opcional:

- si tiene valor, la regla aplica a un contrato específico
- si es `null`, funciona como regla por defecto de la organización

### `notifications.notification_send_logs` -> `identity.organizations`

Esta tabla registra cuántos correos consolidados se enviaron por organización en una fecha dada. Su objetivo es evitar reenvíos duplicados del cron diario.

### `auth.users` -> `identity.users`

La relación entre autenticación y dominio es lógica, no física:

- `auth.users.id` representa la identidad administrada por Supabase
- `identity.users.supabase_user_id` representa el perfil funcional dentro del producto

### `contracts.documents` -> `storage.objects`

No hay foreign key física entre negocio y Storage. La aplicación enlaza ambas capas usando:

- `contracts.documents.file_path`
- `contracts.documents.file_name`
- bucket `documents`

### `notifications.notification_rules` + `contracts.documents` -> `contracts.sync_document_states()`

La función `contracts.sync_document_states` recalcula el estado persistido de los contratos tomando en cuenta:

- `contracts.documents.end_date`
- el estado actual del documento
- las reglas activas por contrato
- las reglas activas por organización

Es una pieza importante del modelo porque convierte reglas y fechas en un estado persistido de negocio.

## Relaciones de Auditoría

El esquema `audit` registra trazabilidad de acciones relevantes sin mezclar eventos con las tablas transaccionales.

### `audit.user_activity`

Registra acciones sobre usuarios. Sus relaciones son:

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `target_user_id -> identity.users.id`

Permite identificar quién ejecutó la acción, sobre qué usuario se aplicó y dentro de qué organización ocurrió.

### `audit.chatbot_activity`

Registra eventos de uso del chatbot. Sus relaciones son:

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `conversation_id -> chatbot.conversations.id`

Además conserva tokens, costos y modelo usado cuando el evento corresponde a generación de respuesta.

### `audit.contract_activity`

Registra acciones sobre contratos. Sus relaciones son:

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `document_id -> contracts.documents.id`
- `company_contract_id -> contracts.company_contracts.id`
- `labor_contract_id -> contracts.labor_contracts.id`

Permite reconstruir eventos como creación, generación desde plantilla, importación desde Google Drive, actualización y eliminación.

### `audit.template_activity`

Registra acciones sobre plantillas. Sus relaciones son:

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `template_id -> templates.document_templates.id`
- `template_format_id -> templates.template_formats.id`

Permite auditar creación, edición, publicación y archivado de plantillas.

## Lectura Correcta del Modelo

Para interpretar bien la base de datos conviene separar estos niveles:

| Nivel | Dónde vive | Qué resuelve |
|------|------------|--------------|
| Identidad Supabase | `auth.*` | Login, sesiones y proveedor OAuth |
| Identidad funcional | `identity.*` | Organizaciones y usuarios de negocio |
| Dominio contractual | `contracts.*`, `catalog.*`, `templates.*`, `notifications.*`, `chatbot.*` | Contratos, servicios, plantillas, alertas y conversaciones |
| Auditoría | `audit.*` | Trazabilidad de acciones del sistema |
| Telemetría | `telemetry.*` | Medición de tokens y costos del chatbot |
| Archivos | `storage.*` | Binarios documentales y metadatos de objetos |

Esta documentación mantiene el MER enfocado en el dominio transaccional del producto y en sus relaciones directas con Auth, Storage, auditoría y telemetría.
