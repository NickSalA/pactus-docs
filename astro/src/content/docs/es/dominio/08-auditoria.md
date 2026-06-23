---
title: Auditoría
description: Modelo de auditoría del sistema, acciones registradas y arquitectura de los servicios de actividad.
---

El módulo de auditoría de **Pactus** registra la actividad relevante del sistema en cuatro categorías: contratos, usuarios, plantillas y chatbot. Cada categoría tiene su propia tabla en el esquema `audit` y su propio conjunto de acciones tipadas.

## Propósito

La auditoría no es un registro de depuración ni reemplaza los logs de aplicación. Su función es proporcionar trazabilidad funcional sobre las operaciones críticas del sistema: quién hizo qué, sobre qué recurso, y cuándo.

Los registros de auditoría son consultables exclusivamente por usuarios con rol `ADMIN`.

## Acciones Auditables

Cada categoría define sus acciones como un `StrEnum` en `modules/audit/domain/value_objs.py`.

### Contratos (`AuditContractAction`)

| Acción | Disparador |
|---|---|
| `CREATED` | Creación manual de un documento |
| `GENERATED_FROM_TEMPLATE` | Generación de contrato desde plantilla |
| `IMPORTED_FROM_GOOGLE_DRIVE` | Importación exitosa desde Google Drive |
| `UPDATED` | Actualización de un documento existente |
| `DELETED` | Eliminación de un documento |

### Usuarios (`AuditUserAction`)

| Acción | Disparador |
|---|---|
| `CREATED` | Registro de un nuevo miembro en la organización |
| `UPDATED` | Cambio de rol o perfil de un miembro |
| `DELETED` | Eliminación (soft delete) de un miembro |

### Plantillas (`AuditTemplateAction`)

| Acción | Disparador |
|---|---|
| `CREATED` | Creación de una nueva plantilla |
| `UPDATED` | Modificación de una plantilla en borrador |
| `ARCHIVED` | Archivado de una plantilla |
| `DELETED` | Eliminación de una plantilla |

### Chatbot (`AuditChatbotAction`)

| Acción | Disparador |
|---|---|
| `CONVERSATION_STARTED` | Inicio de una nueva conversación |
| `MESSAGE_SENT` | Envío de un mensaje por el usuario |
| `RESPONSE_GENERATED` | Generación de respuesta por el LLM |

## Entidades

Las cuatro tablas viven en el esquema `audit` y comparten una estructura base:

| Campo común | Tipo | Descripción |
|---|---|---|
| `id` | `BIGINT` | Clave primaria |
| `organization_id` | `BIGINT` | Organización a la que pertenece el registro |
| `actor_user_id` | `BIGINT` | Usuario que realizó la acción |
| `actor_name` | `VARCHAR` | Nombre del actor al momento de la acción |
| `actor_role` | `VARCHAR` | Rol del actor al momento de la acción |
| `action` | `ENUM` | Acción realizada (específica por tabla) |
| `created_at` | `TIMESTAMPTZ` | Momento en que ocurrió la acción |

Cada tabla agrega campos específicos según el recurso auditado.

### `audit.contract_activity`

| Campo | Tipo | Referencia |
|---|---|---|
| `document_id` | `BIGINT` | `contracts.documents.id` |
| `company_contract_id` | `BIGINT` | `contracts.company_contracts.id` |
| `labor_contract_id` | `BIGINT` | `contracts.labor_contracts.id` |
| `document_name` | `VARCHAR(255)` | |
| `document_type` | `VARCHAR(50)` | COMPANY o LABOR |
| `previous_state` | `VARCHAR(50)` | Estado anterior del documento |
| `state` | `VARCHAR(50)` | Estado posterior del documento |

### `audit.user_activity`

| Campo | Tipo | Referencia |
|---|---|---|
| `target_user_id` | `BIGINT` | `identity.users.id` |
| `target_user_email` | `VARCHAR` | |
| `target_user_name` | `VARCHAR` | |
| `previous_role` | `VARCHAR` | Rol anterior del usuario objetivo |
| `role` | `VARCHAR` | Nuevo rol del usuario objetivo |

### `audit.template_activity`

| Campo | Tipo | Referencia |
|---|---|---|
| `template_id` | `BIGINT` | `templates.document_templates.id` |
| `template_format_id` | `BIGINT` | `templates.template_formats.id` |
| `template_name` | `VARCHAR(255)` | |
| `document_type` | `VARCHAR(50)` | |
| `previous_state` | `VARCHAR(50)` | |
| `state` | `VARCHAR(50)` | |

### `audit.chatbot_activity`

| Campo | Tipo | Referencia |
|---|---|---|
| `conversation_id` | `BIGINT` | `chatbot.conversations.id` (opcional) |

### `audit.ai_token_usage`

Registra el consumo detallado de tokens y costos asociados a operaciones de IA, segregado por origen (`source`).

| Campo | Tipo | Referencia / Descripción |
|---|---|---|
| `organization_id` | `BIGINT` | `identity.organizations.id` |
| `actor_user_id` | `BIGINT` | `identity.users.id` |
| `source` | `VARCHAR` | Origen del consumo: CHATBOT, TEMPLATES o INTEGRATIONS |
| `input_tokens` | `INTEGER` | Tokens de entrada |
| `output_tokens` | `INTEGER` | Tokens de salida |
| `total_tokens` | `INTEGER` | Total de tokens consumidos |
| `input_cost_usd` | `NUMERIC` | Costo de entrada en USD |
| `output_cost_usd` | `NUMERIC` | Costo de salida en USD |
| `total_cost_usd` | `NUMERIC` | Costo total en USD |
| `model_used` | `VARCHAR` | Modelo utilizado (por ejemplo, `gemini-2.5-flash`) |

## Servicios de Auditoría

Cada categoría tiene su propio servicio en `modules/audit/application/services/`:

```
services/
├── contract_activity_service.py    → ContractActivityService
├── chatbot_activity_service.py     → ChatbotActivityService
├── template_activity_service.py    → TemplateActivityService
├── user_activity_service.py        → UserActivityService
└── ai_token_tracking_service.py    → AITokenTrackingService
```

Cada servicio expone dos operaciones principales (`record()` / `record_usage()` y `list_by_organization()` / `list_usage()`), además de resúmenes agregados en el caso del tracking de tokens:

- **`AITokenTrackingService`**:
  - `record_usage()` — Registra el consumo de tokens para una invocación de IA.
  - `list_usage()` — Lista el historial de consumo de tokens para una organización (con soporte para paginación y filtros).
  - `get_summary()` — Obtiene totales agregados de tokens y costos en USD.
  - `check_rate_limit()` — Valida límites de cuota diaria del usuario.


Para los servicios de actividad estándar (`ContractActivityService`, `ChatbotActivityService`, `TemplateActivityService`, `UserActivityService`), se exponen estas dos operaciones:

- **`record()`** — Crea un registro de auditoría. Recibe el actor, la acción y los datos del recurso afectado.
- **`list_by_organization()`** — Lista los registros de una organización con paginación (`limit`, `offset`).


## Integración con el Sistema

La auditoría no es un módulo aislado. Otros módulos del sistema escriben en sus tablas como parte de sus operaciones normales:

```
Módulo Origen                Acción Registrada           Tabla Destino
─────────────────────────────────────────────────────────────────────
Integraciones (Drive)        IMPORTED_FROM_GOOGLE_DRIVE  audit.contract_activity
Documentos (state change)    UPDATED / DELETED           audit.contract_activity
Plantillas (CRUD)            CREATED / UPDATED / ARCHIVED audit.template_activity
Usuarios (members CRUD)      CREATED / UPDATED / DELETED audit.user_activity
Chatbot (mensajes)           MESSAGE_SENT / RESPONSE_GENERATED audit.chatbot_activity
```

El `ContractActivityService` se inyecta como dependencia opcional en `IntegrationService`. Si está presente, cada importación desde Google Drive registra automáticamente un evento `IMPORTED_FROM_GOOGLE_DRIVE`.

## Control de Acceso

Todos los endpoints de consulta de auditoría requieren:

1. Autenticación Bearer JWT (como el resto de la API)
2. Rol `ADMIN` — validado explícitamente en cada endpoint

```python
if current_user.role != UserRole.ADMIN:
    raise ForbiddenError("Solo los administradores pueden consultar la auditoría")
```

## Esquema en Base de Datos

Todas las tablas pertenecen al esquema `audit`:

```sql
CREATE SCHEMA IF NOT EXISTS audit;
```

Las tablas se crean mediante SQLModel con los `__tablename__` y `__table_args__` definidos en cada entidad. Los ENUM se registran con nombres como `audit_contract_action`, `audit_user_action`, `audit_template_action` y `audit_chatbot_action`.
