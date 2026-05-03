---
title: Tablas del Dominio
description: Diccionario actualizado de las tablas del esquema public con columnas, relaciones y notas operativas del modelo.
---

El esquema `public` concentra las tablas que modelan el dominio principal de ContractIA. A continuación se documenta la estructura vigente que utiliza el backend del sistema, con sus relaciones y notas operativas más relevantes.

## Resumen del Esquema `public`

| Tabla | Proposito | Clave principal |
|-------|-----------|-----------------|
| `organizations` | Organizacion o tenant del sistema | `id` |
| `users` | Usuario funcional asociado a una organizacion | `id` |
| `documents` | Cabecera documental y referencia al archivo | `id` |
| `services` | Catálogo de servicios por organización | `id` |
| `documents_services` | Detalle económico y temporal por documento/servicio | `id` |
| `conversations` | Historial conversacional visible para la aplicacion | `id` |
| `document_templates` | Plantillas usadas para generacion documental | `id` |
| `template_formats` | Catálogo de formatos de plantilla | `id` |
| `document_folders` | Carpetas documentales por rol | `id` |
| `notification_rules` | Reglas de alerta por organización o contrato | `id` |
| `notification_send_logs` | Log diario de correos enviados por organizacion | `id` |

La tabla `public.empresas` ya no forma parte del modelo actual.

## `public.organizations`

Es la tabla raíz del dominio. Desde aquí se organiza el aislamiento por tenant y se relacionan los principales recursos del sistema.

**Clave primaria:** `id`

**Relaciones salientes:**

- `users.organization_id -> organizations.id`
- `documents.organization_id -> organizations.id`
- `services.organization_id -> organizations.id`
- `conversations.organization_id -> organizations.id`
- `document_templates.organization_id -> organizations.id`
- `notification_rules.organization_id -> organizations.id`
- `document_folders.organization_id -> organizations.id`
- `notification_send_logs.organization_id -> organizations.id`

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
| `jurisdiction` | `varchar` | Jurisdiccion principal |
| `city` | `varchar` | Ciudad principal |
| `autorizacion_entidad` | `text` | Entidad asociada a la autorizacion |
| `autorizacion_fecha` | `date` | Fecha de autorizacion |
| `autorizacion_emitida_por` | `text` | Emisor de la autorizacion |
| `email` | `varchar` | Correo corporativo |
| `phone` | `varchar` | Telefono corporativo |

## `public.users`

Conserva el usuario funcional del sistema. Complementa a `auth.users` con informacion propia del dominio de negocio.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`

**Relación lógica con Auth:**

- `supabase_user_id -> auth.users.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad interna del usuario |
| `organization_id` | `bigint` | Organización a la que pertenece |
| `supabase_user_id` | `uuid` | Vínculo con la identidad gestionada por Supabase Auth |
| `email` | `varchar` | Correo del usuario |
| `full_name` | `varchar` | Nombre mostrado en la aplicación |
| `avatar_url` | `text` | Referencia visual del usuario |
| `role` | `user_role` | Rol de aplicación: `WORKER`, `HR`, `MANAGER`, `ADMIN` |
| `is_active` | `boolean` | Estado logico del usuario |
| `receives_notifications` | `boolean` | Indica si el usuario recibe alertas de vencimiento |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Semántica de `user_role`

- `WORKER`: usuario de consulta general
- `HR`: usuario de recursos humanos
- `MANAGER`: usuario de gestión contractual
- `ADMIN`: usuario con control total de la organización

## `public.documents`

Guarda la cabecera del documento y la referencia al archivo asociado. El detalle económico principal se persiste por separado en `documents_services`.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`
- `folder_id -> document_folders.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del documento |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre del contrato |
| `client` | `varchar` | Contraparte o cliente asociado |
| `type` | `document_type` | Tipo documental: `COMPANY`, `LABOR` |
| `start_date` | `date` | Inicio del periodo contractual |
| `end_date` | `date` | Fin del periodo contractual |
| `form_data` | `jsonb` | Datos estructurados extraídos o capturados del contrato |
| `state` | `document_state` | Estado documental persistido |
| `file_path` | `text` | Ruta tecnica del archivo en Storage |
| `file_name` | `text` | Nombre visible del archivo |
| `folder_id` | `bigint` | Carpeta asignada al documento |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Semántica de `document_type`

- `COMPANY`: contrato corporativo, comercial o institucional
- `LABOR`: contrato laboral o asociado a gestión de personal

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

Por eso, aunque el detalle económico formal viva en `documents_services`, parte de la metadata económica puede reaparecer resumida en este JSONB.

## `public.services`

Contiene el catálogo de servicios de cada organización. Su objetivo es reutilizar conceptos contractuales sin repetir su definición en cada documento.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del servicio |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre del servicio |
| `is_active` | `boolean` | Permite desactivar el item del catalogo sin borrarlo |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

## `public.documents_services`

Es la tabla que enlaza documentos y servicios, pero además conserva la información económica y temporal de cada línea contractual.

**Clave primaria:** `id`

**Claves foráneas:**

- `document_id -> documents.id`
- `service_id -> services.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del registro |
| `document_id` | `bigint` | Documento asociado |
| `service_id` | `bigint` | Servicio asociado |
| `description` | `text` | Descripción de la línea contractual |
| `value` | `float8` | Valor monetario de la línea |
| `currency` | `currency_type` | Moneda utilizada: `PEN`, `USD`, `EUR` |
| `start_date` | `date` | Inicio del periodo de la línea |
| `end_date` | `date` | Fin del periodo de la línea |

El backend valida adicionalmente que:

- no se repita el mismo `service_id` dentro del mismo contrato
- todas las líneas usen la misma moneda
- las fechas de cada linea queden dentro del rango del documento padre

## `public.conversations`

Guarda el historial conversacional que la aplicación muestra al usuario y reutiliza para continuar el chat visible del producto.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`
- `user_id -> users.id`

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
    "role": "assistant",
    "content": "La clausula establece una renovacion automatica...",
    "timestamp": "2026-03-20T10:00:03Z"
  }
]
```

## `public.document_templates`

Conserva las plantillas base que el sistema utiliza para generar contratos por organización.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`
- `template_format_id -> template_formats.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la plantilla |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre de la plantilla |
| `description` | `text` | Descripción funcional |
| `content` | `jsonb` | Estructura base usada para renderizar el contrato |
| `created_at` | `timestamptz` | Fecha de creacion |
| `state` | `document_template_state` | Estado de la plantilla: `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `document_type` | `document_type` | Tipo documental al que pertenece la plantilla |
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

## `public.template_formats`

Es el catálogo de formatos disponibles para las plantillas. Permite separar el tipo documental del formato operativo concreto que usa la organización.

**Clave primaria:** `id`

**Relaciones entrantes:**

- `document_templates.template_format_id -> template_formats.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del formato |
| `document_type` | `document_type` | Tipo documental asociado |
| `format_code` | `varchar` | Codigo tecnico normalizado del formato |
| `label` | `varchar` | Nombre visible del formato |
| `default_name` | `varchar` | Nombre sugerido para la plantilla |
| `default_description` | `text` | Descripcion sugerida |
| `is_active` | `boolean` | Indica si el formato sigue disponible |

## `public.document_folders`

Representa carpetas documentales por organización y por rol propietario. Sirve para clasificar contratos sin mezclar visibilidad entre grupos funcionales.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`
- `created_by -> users.id`

**Relaciones entrantes:**

- `documents.folder_id -> document_folders.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la carpeta |
| `organization_id` | `bigint` | Organización propietaria |
| `name` | `varchar` | Nombre visible de la carpeta |
| `owner_role` | `user_role` | Rol dueño de la carpeta |
| `created_by` | `bigint` | Usuario que creó la carpeta |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Restricción relevante de `owner_role`

La base de datos restringe `owner_role` a los valores `HR` y `MANAGER`. El backend usa ese dato para controlar visibilidad y administración de carpetas.

## `public.notification_rules`

Define las ventanas de alerta de vencimiento para una organización o para un contrato puntual.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`
- `document_id -> documents.id` (opcional)

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

Además, la función `public.sync_document_states` usa la ventana activa más amplia para decidir cuándo un contrato pasa a `EXPIRING_SOON`.

## `public.notification_send_logs`

Registra el resultado diario del envío consolidado de correos por organización. Su objetivo es evitar duplicados cuando corre el proceso programado de alertas.

**Clave primaria:** `id`

**Claves foráneas:**

- `organization_id -> organizations.id`

**Restricción relevante:**

- unicidad por `organization_id` + `sent_date`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `integer` | Identidad del log |
| `organization_id` | `integer` | Organización a la que pertenece el envío |
| `sent_date` | `date` | Fecha del lote diario |
| `emails_sent` | `integer` | Cantidad de correos enviados en esa corrida |
| `created_at` | `timestamptz` | Fecha de registro |

## Función SQL asociada al dominio

Aunque no es una tabla, hay una función de negocio relevante para entender el esquema:

| Funcion | Rol |
|---------|-----|
| `public.sync_document_states(p_organization_id bigint default null)` | Recalcula `documents.state` a partir de fechas y reglas activas |

Esta función forma parte del comportamiento persistente del sistema porque escribe estados sobre `public.documents`.
