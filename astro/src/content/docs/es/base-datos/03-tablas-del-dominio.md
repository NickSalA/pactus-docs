---
title: Tablas del Dominio
description: Diccionario actualizado de las tablas de negocio, auditoría y telemetría con columnas, relaciones y notas operativas.
---

El dominio principal de Pactus se distribuye en esquemas especializados. A continuación se documenta la estructura vigente que utiliza el backend del sistema, con sus relaciones y notas operativas más relevantes.

## Resumen de Esquemas y Tablas

| Tabla | Proposito | Clave principal |
|-------|-----------|-----------------|
| `identity.organizations` | Organizacion o tenant del sistema | `id` |
| `identity.users` | Usuario funcional asociado a una organizacion | `id` |
| `contracts.documents` | Cabecera documental y referencia al archivo | `id` |
| `catalog.services` | Catálogo de servicios por organización | `id` |
| `contracts.company_contracts` | Extension corporativa para contratos de empresa | `id` |
| `contracts.labor_contracts` | Extension laboral para contratos de trabajo | `id` |
| `contracts.company_contract_services` | Lineas de servicio para contratos corporativos | `id` |
| `chatbot.conversations` | Historial conversacional visible para la aplicacion | `id` |
| `templates.document_templates` | Plantillas usadas para generacion documental | `id` |
| `templates.template_formats` | Catálogo de formatos de plantilla | `id` |
| `contracts.document_folders` | Carpetas documentales por rol | `id` |
| `notifications.notification_rules` | Reglas de alerta por organización o contrato | `id` |
| `notifications.notification_send_logs` | Log diario de correos enviados por organizacion | `id` |
| `audit.user_activity` | Auditoría de gestión de usuarios | `id` |
| `audit.chatbot_activity` | Auditoría de uso del chatbot | `id` |
| `audit.contract_activity` | Auditoría de contratos | `id` |
| `audit.template_activity` | Auditoría de plantillas | `id` |

La tabla `public.empresas` ya no forma parte del modelo actual. El esquema `public` no contiene actualmente las tablas principales del dominio.

## Tipos Compartidos

Los enums reutilizados por las tablas de negocio viven en `app_types`:

| Enum | Valores |
|------|---------|
| `app_types.user_role` | `WORKER`, `HR`, `MANAGER`, `ADMIN`, `SUPERADMIN` |
| `app_types.document_type` | `COMPANY`, `LABOR` |
| `app_types.document_state` | `DRAFT`, `PENDING_SIGNATURE`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `TERMINATED` |
| `app_types.document_template_state` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `app_types.currency_type` | `PEN`, `USD`, `EUR` |

Los enums de auditoría viven en `audit`:

| Enum | Valores |
|------|---------|
| `audit.audit_user_action` | `CREATED`, `UPDATED`, `DELETED` |
| `audit.audit_chatbot_action` | `CONVERSATION_STARTED`, `MESSAGE_SENT`, `RESPONSE_GENERATED` |
| `audit.audit_contract_action` | `MANUAL_UPLOAD`, `GENERATED_FROM_TEMPLATE`, `IMPORTED_FROM_GOOGLE_DRIVE`, `UPDATED`, `DELETED` |
| `audit.audit_template_action` | `CREATED`, `UPDATED`, `PUBLISHED`, `ARCHIVED` |

## `identity.organizations`

Es la tabla raíz del dominio. Desde aquí se organiza el aislamiento por tenant y se relacionan los principales recursos del sistema.

**Clave primaria:** `id`

**Relaciones salientes:**

- `identity.users.organization_id -> identity.organizations.id`
- `contracts.documents.organization_id -> identity.organizations.id`
- `catalog.services.organization_id -> identity.organizations.id`
- `chatbot.conversations.organization_id -> identity.organizations.id`
- `templates.document_templates.organization_id -> identity.organizations.id`
- `notifications.notification_rules.organization_id -> identity.organizations.id`
- `contracts.document_folders.organization_id -> identity.organizations.id`
- `notifications.notification_send_logs.organization_id -> identity.organizations.id`
- `audit.*.organization_id -> identity.organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la organizacion |
| `name` | `varchar` | Nombre unico de la organizacion |
| `is_active` | `boolean` | Estado logico de la organizacion |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |
| `ruc` | `varchar` | Identificador tributario |
| `address` | `text` | Direccion legal |
| `company_type` | `text` | Tipo o descripcion societaria |
| `objeto_social` | `text` | Objeto social de la organizacion |
| `legal_rep_name` | `varchar` | Nombre del representante legal |
| `legal_rep_dni` | `varchar` | Documento del representante legal |
| `jurisdiction` | `varchar` | Jurisdiccion principal; por defecto `Lima` |
| `city` | `varchar` | Ciudad principal; por defecto `Lima` |
| `autorizacion_entidad` | `text` | Entidad asociada a la autorizacion |
| `autorizacion_fecha` | `date` | Fecha de autorizacion |
| `autorizacion_emitida_por` | `text` | Emisor de la autorizacion |
| `email` | `varchar` | Correo corporativo |
| `phone` | `varchar` | Telefono corporativo |

## `identity.users`

Conserva el usuario funcional del sistema. Complementa a `auth.users` con informacion propia del dominio de negocio.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`

**Relación lógica con Auth:**

- `supabase_user_id -> auth.users.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad interna del usuario |
| `organization_id` | `bigint` | Organización a la que pertenece |
| `supabase_user_id` | `uuid` | Vínculo lógico con la identidad gestionada por Supabase Auth |
| `email` | `varchar` | Correo único del usuario |
| `full_name` | `varchar` | Nombre mostrado en la aplicación |
| `avatar_url` | `text` | Referencia visual del usuario |
| `role` | `app_types.user_role` | Rol de aplicación |
| `is_active` | `boolean` | Estado logico del usuario |
| `receives_notifications` | `boolean` | Indica si el usuario recibe alertas de vencimiento |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Semántica de `user_role`

- `WORKER`: usuario de consulta general
- `HR`: usuario de recursos humanos
- `MANAGER`: usuario de gestión contractual
- `ADMIN`: usuario con control total de la organización
- `SUPERADMIN`: superadministrador con acceso global a todas las organizaciones

## `contracts.documents`

Guarda la cabecera del documento y la referencia al archivo asociado. Los contratos corporativos guardan su extension en `contracts.company_contracts` y los laborales en `contracts.labor_contracts`.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `folder_id -> contracts.document_folders.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del documento |
| `organization_id` | `bigint` | Organización propietaria |
| `type` | `text` | Tipo técnico u origen del documento, por ejemplo `google_drive`, `management` o `fixed_term` |
| `start_date` | `date` | Inicio del periodo contractual |
| `end_date` | `date` | Fin del periodo contractual |
| `form_data` | `jsonb` | Datos estructurados extraídos o capturados del contrato |
| `state` | `app_types.document_state` | Estado documental persistido |
| `file_path` | `text` | Ruta tecnica del archivo en Storage |
| `file_name` | `text` | Nombre visible del archivo |
| `folder_id` | `bigint` | Carpeta asignada al documento |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Tipo funcional de contrato

El tipo funcional `COMPANY` o `LABOR` no se guarda en `contracts.documents.type`. Se expresa mediante las extensiones uno a uno:

- si existe `contracts.company_contracts.document_id`, el documento es corporativo
- si existe `contracts.labor_contracts.document_id`, el documento es laboral

La API puede exponer ese concepto como `contract_type`, pero la columna `type` conserva el origen o formato técnico.

### Semántica de `document_state`

- `DRAFT`: contrato en preparación
- `PENDING_SIGNATURE`: contrato pendiente de firma
- `ACTIVE`: contrato vigente fuera de ventana de alerta
- `EXPIRING_SOON`: contrato vigente dentro de una ventana activa de alerta
- `EXPIRED`: contrato cuya vigencia ya concluyo
- `TERMINATED`: contrato cerrado antes de su vencimiento natural

### Rol de `form_data`

`form_data` cumple dos objetivos simultáneos:

- guardar campos variables del contrato que no justifican una tabla propia
- conservar claves resumidas que el backend usa para filtros y rankings, como `value` y `currency`

## `catalog.services`

Contiene el catálogo de servicios de cada organización. Su objetivo es reutilizar conceptos contractuales sin repetir su definición en cada documento.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`

**Relaciones entrantes:**

- `contracts.company_contract_services.service_id -> catalog.services.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del servicio |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre del servicio |
| `is_active` | `boolean` | Permite desactivar el item del catalogo sin borrarlo |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

## `contracts.company_contracts`

Extension para contratos corporativos. Almacena el RUC y el nombre del cliente asociado al contrato.

**Clave primaria:** `id`

**Claves foráneas:**

- `document_id -> contracts.documents.id` (único)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del registro |
| `document_id` | `bigint` | Documento corporativo asociado |
| `ruc` | `varchar` | Identificador tributario del cliente |
| `client` | `varchar` | Nombre o razon social del cliente |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

## `contracts.labor_contracts`

Extension para contratos laborales. Almacena los datos del trabajador y las condiciones salariales.

**Clave primaria:** `id`

**Claves foráneas:**

- `document_id -> contracts.documents.id` (único)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del registro |
| `document_id` | `bigint` | Documento laboral asociado |
| `worker_name` | `varchar` | Nombre completo del trabajador |
| `worker_document_number` | `varchar` | Numero de documento de identidad |
| `position` | `varchar` | Cargo o puesto |
| `salary_value` | `float8` | Monto del salario |
| `salary_currency` | `app_types.currency_type` | Moneda: `PEN`, `USD`, `EUR` |
| `salary_periodicity` | `varchar` | Periodicidad del pago |
| `contract_modality` | `varchar` | Modalidad del contrato |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

## `contracts.company_contract_services`

Lineas de servicio para contratos corporativos. Enlaza un contrato de empresa con servicios del catálogo y persiste la información económica de cada línea.

**Clave primaria:** `id`

**Claves foráneas:**

- `company_contract_id -> contracts.company_contracts.id`
- `service_id -> catalog.services.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del registro |
| `company_contract_id` | `bigint` | Contrato corporativo asociado |
| `service_id` | `bigint` | Servicio del catálogo |
| `description` | `text` | Descripcion de la línea contractual |
| `value` | `float8` | Valor monetario de la línea |
| `currency` | `app_types.currency_type` | Moneda utilizada: `PEN`, `USD`, `EUR` |
| `start_date` | `date` | Inicio del periodo de la línea |
| `end_date` | `date` | Fin del periodo de la línea |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Restricciones relevantes

- `value` >= 0
- `end_date` >= `start_date`
- Unicidad por `company_contract_id` + `service_id`

## `chatbot.conversations`

Guarda el historial conversacional que la aplicación muestra al usuario y reutiliza para continuar el chat visible del producto.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `user_id -> identity.users.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la conversacion |
| `organization_id` | `bigint` | Organizacion propietaria |
| `user_id` | `bigint` | Usuario asociado al hilo |
| `title` | `varchar` | Título mostrado en la interfaz |
| `content` | `jsonb` | Historial de mensajes del hilo |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Estructura utilizada en `content`

```json
[
  {
    "role": "user",
    "content": "Resume las clausulas de renovacion",
    "timestamp": "2026-03-20T10:00:00Z"
  },
  {
    "role": "bot",
    "content": "La clausula establece una renovacion automatica...",
    "timestamp": "2026-03-20T10:00:03Z"
  }
]
```

## `templates.document_templates`

Conserva las plantillas base que el sistema utiliza para generar contratos por organización.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `template_format_id -> templates.template_formats.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la plantilla |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre de la plantilla |
| `description` | `text` | Descripción funcional |
| `content` | `jsonb` | Estructura base usada para renderizar el contrato |
| `created_at` | `timestamptz` | Fecha de creacion |
| `state` | `app_types.document_template_state` | Estado de la plantilla: `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `document_type` | `app_types.document_type` | Tipo documental al que pertenece la plantilla |
| `template_format_id` | `integer` | Formato funcional asociado |

### Estructura utilizada en `content`

```json
{
  "body_md": "# Contrato\n\nEntre las partes...",
  "fields": [],
  "operational_fields": [],
  "version": "1.0",
  "contract_date_mapping": {
    "start_date_field": "fecha_inicio",
    "end_date_field": "fecha_fin"
  }
}
```

`operational_fields` y `contract_date_mapping` son relevantes porque el backend los valida y los usa en flujos de generación documental.

## `templates.template_formats`

Es el catálogo de formatos disponibles para las plantillas. Permite separar el tipo documental del formato operativo concreto que usa la organización.

**Clave primaria:** `id`

**Relaciones entrantes:**

- `templates.document_templates.template_format_id -> templates.template_formats.id`
- `audit.template_activity.template_format_id -> templates.template_formats.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del formato |
| `document_type` | `app_types.document_type` | Tipo documental asociado |
| `format_code` | `varchar` | Codigo tecnico normalizado del formato |
| `label` | `varchar` | Nombre visible del formato |
| `default_name` | `varchar` | Nombre sugerido para la plantilla |
| `default_description` | `text` | Descripcion sugerida |
| `is_active` | `boolean` | Indica si el formato sigue disponible |

## `contracts.document_folders`

Representa carpetas documentales por organización y por rol propietario. Sirve para clasificar contratos sin mezclar visibilidad entre grupos funcionales.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `created_by -> identity.users.id`

**Relaciones entrantes:**

- `contracts.documents.folder_id -> contracts.document_folders.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la carpeta |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre visible de la carpeta |
| `owner_role` | `app_types.user_role` | Rol dueño de la carpeta |
| `created_by` | `bigint` | Usuario que creó la carpeta |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Restricción relevante de `owner_role`

La base de datos restringe `owner_role` a los valores `HR` y `MANAGER`. El backend usa ese dato para controlar visibilidad y administración de carpetas.

## `notifications.notification_rules`

Define las ventanas de alerta de vencimiento para una organización o para un contrato puntual.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `document_id -> contracts.documents.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la regla |
| `organization_id` | `bigint` | Organización propietaria |
| `document_id` | `bigint` | Contrato específico al que aplica la regla; si es `null`, la regla es organizacional |
| `days_before_due` | `integer` | Número de días previos al vencimiento que disparan la alerta |
| `is_active` | `boolean` | Permite activar o desactivar la regla sin eliminarla |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Resolución de reglas de alerta

El backend resuelve las alertas con este orden:

1. reglas activas propias del contrato
2. reglas activas por defecto de la organización
3. fallback operativo si no existe configuración

Además, la función `contracts.sync_document_states` usa la ventana activa más amplia para decidir cuándo un contrato pasa a `EXPIRING_SOON`.

### Restricciones relevantes

- `days_before_due` > 0
- Unicidad por `organization_id` + `sent_date` en logs de envío

## `notifications.notification_send_logs`

Registra el resultado diario del envío consolidado de correos por organización. Su objetivo es evitar duplicados cuando corre el proceso programado de alertas.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`

**Restricción relevante:**

- unicidad por `organization_id` + `sent_date`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `integer` | Identidad del log |
| `organization_id` | `integer` | Organización a la que pertenece el envío |
| `sent_date` | `date` | Fecha del lote diario |
| `emails_sent` | `integer` | Cantidad de correos enviados en esa corrida |
| `created_at` | `timestamptz` | Fecha de registro |

## `audit.user_activity`

Registra acciones auditadas de gestión de usuarios dentro de una organización.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `target_user_id -> identity.users.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del evento |
| `organization_id` | `bigint` | Organización donde ocurrió el evento |
| `actor_user_id` | `bigint` | Usuario que ejecutó la acción |
| `actor_name` | `varchar` | Nombre del actor al momento del evento |
| `actor_role` | `varchar` | Rol del actor al momento del evento |
| `action` | `audit.audit_user_action` | Acción auditada |
| `target_user_id` | `bigint` | Usuario afectado |
| `target_user_email` | `varchar` | Email del usuario afectado |
| `target_user_name` | `varchar` | Nombre del usuario afectado |
| `previous_role` | `varchar` | Rol previo cuando aplica |
| `role` | `varchar` | Rol resultante cuando aplica |
| `created_at` | `timestamptz` | Fecha del evento |

## `audit.chatbot_activity`

Registra eventos auditados de uso del chatbot y conserva métricas operativas cuando aplica.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `conversation_id -> chatbot.conversations.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del evento |
| `organization_id` | `bigint` | Organización donde ocurrió el evento |
| `actor_user_id` | `bigint` | Usuario que interactuó con el chatbot |
| `actor_name` | `varchar` | Nombre del actor al momento del evento |
| `actor_role` | `varchar` | Rol del actor al momento del evento |
| `action` | `audit.audit_chatbot_action` | Acción auditada |
| `conversation_id` | `bigint` | Conversación relacionada |
| `input_tokens` | `integer` | Tokens de entrada |
| `output_tokens` | `integer` | Tokens de salida |
| `total_tokens` | `integer` | Total de tokens |
| `input_cost_usd` | `numeric` | Costo de entrada en USD |
| `output_cost_usd` | `numeric` | Costo de salida en USD |
| `total_cost_usd` | `numeric` | Costo total en USD |
| `model_used` | `varchar` | Modelo utilizado |
| `created_at` | `timestamptz` | Fecha del evento |

### Restricciones relevantes

- Los contadores de tokens deben ser no negativos cuando tienen valor.
- Los costos deben ser no negativos cuando tienen valor.

### Telemetría de tokens

`audit.chatbot_activity` también cumple la función de telemetría del chatbot. Las columnas `input_tokens`, `output_tokens`, `total_tokens`, `input_cost_usd`, `output_cost_usd`, `total_cost_usd` y `model_used` permiten analizar consumo y costos por evento sin alterar el historial visible de `chatbot.conversations`.

## `audit.contract_activity`

Registra eventos auditados sobre contratos y sus extensiones.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `document_id -> contracts.documents.id` (opcional)
- `company_contract_id -> contracts.company_contracts.id` (opcional)
- `labor_contract_id -> contracts.labor_contracts.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del evento |
| `organization_id` | `bigint` | Organización donde ocurrió el evento |
| `actor_user_id` | `bigint` | Usuario que ejecutó la acción |
| `actor_name` | `varchar` | Nombre del actor al momento del evento |
| `actor_role` | `varchar` | Rol del actor al momento del evento |
| `action` | `audit.audit_contract_action` | Acción auditada |
| `document_id` | `bigint` | Documento relacionado |
| `company_contract_id` | `bigint` | Extension corporativa relacionada |
| `labor_contract_id` | `bigint` | Extension laboral relacionada |
| `document_name` | `text` | Nombre del documento al momento del evento |
| `document_type` | `varchar` | Tipo funcional o técnico capturado para auditoría |
| `previous_state` | `varchar` | Estado previo cuando aplica |
| `state` | `varchar` | Estado resultante cuando aplica |
| `created_at` | `timestamptz` | Fecha del evento |

## `audit.template_activity`

Registra eventos auditados sobre plantillas y formatos.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> identity.organizations.id`
- `actor_user_id -> identity.users.id`
- `template_id -> templates.document_templates.id` (opcional)
- `template_format_id -> templates.template_formats.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del evento |
| `organization_id` | `bigint` | Organización donde ocurrió el evento |
| `actor_user_id` | `bigint` | Usuario que ejecutó la acción |
| `actor_name` | `varchar` | Nombre del actor al momento del evento |
| `actor_role` | `varchar` | Rol del actor al momento del evento |
| `action` | `audit.audit_template_action` | Acción auditada |
| `template_id` | `bigint` | Plantilla relacionada |
| `template_format_id` | `bigint` | Formato relacionado |
| `template_name` | `varchar` | Nombre de la plantilla al momento del evento |
| `document_type` | `varchar` | Tipo documental capturado para auditoría |
| `previous_state` | `varchar` | Estado previo cuando aplica |
| `state` | `varchar` | Estado resultante cuando aplica |
| `created_at` | `timestamptz` | Fecha del evento |

## Función SQL asociada al dominio

Aunque no es una tabla, hay una función de negocio relevante para entender el esquema:

| Funcion | Rol |
|---------|-----|
| `contracts.sync_document_states(p_organization_id bigint default null)` | Recalcula `contracts.documents.state` a partir de fechas y reglas activas |

Esta función forma parte del comportamiento persistente del sistema porque escribe estados sobre `contracts.documents`.
