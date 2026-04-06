---
title: Tablas del Dominio
description: Diccionario de tablas del esquema public con claves, relaciones y campos principales del modelo.
---

El esquema `public` concentra las tablas que modelan el dominio principal de ContractIA. A continuacion se documenta el rol de cada una, sus relaciones y los campos que estructuran el comportamiento del sistema.

## Resumen del Esquema `public`

| Tabla | Proposito | Clave principal |
|-------|-----------|-----------------|
| `organizations` | Organizacion o tenant del sistema | `id` |
| `users` | Usuario funcional asociado a una organizacion | `id` |
| `documents` | Cabecera documental y referencia al archivo | `id` |
| `services` | Catalogo de servicios por organizacion | `id` |
| `documents_services` | Detalle economico y contractual por documento/servicio | `id` |
| `conversations` | Historial conversacional visible para la aplicacion | `id` |
| `document_templates` | Plantillas usadas para generacion documental | `id` |
| `notification_rules` | Reglas de alerta por organizacion o por contrato | `id` |

## `public.organizations`

Es la tabla raiz del dominio. Desde aqui se organiza el aislamiento por empresa y se relacionan los principales recursos del sistema.

**Clave primaria:** `id`

**Relaciones salientes:**

- `users.organization_id -> organizations.id`
- `documents.organization_id -> organizations.id`
- `services.organization_id -> organizations.id`
- `conversations.organization_id -> organizations.id`
- `document_templates.organization_id -> organizations.id`
- `notification_rules.organization_id -> organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la organizacion |
| `name` | `varchar` | Nombre unico de la organizacion |
| `is_active` | `boolean` | Estado logico de la organizacion |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |
| `ruc` | `varchar` | Identificador tributario |
| `address` | `text` | Direccion legal |
| `company_type` | `text` | Tipo de empresa |
| `objeto_social` | `text` | Objeto social |
| `legal_rep_name` | `varchar` | Nombre del representante legal |
| `legal_rep_dni` | `varchar` | Documento del representante legal |
| `jurisdiction` | `varchar` | Jurisdiccion de la organizacion |
| `city` | `varchar` | Ciudad principal |
| `autorizacion_entidad` | `text` | Entidad vinculada a la autorizacion |
| `autorizacion_fecha` | `date` | Fecha de autorizacion |
| `autorizacion_emitida_por` | `text` | Emisor de la autorizacion |
| `email` | `varchar` | Correo corporativo |
| `phone` | `varchar` | Telefono corporativo |

## `public.users`

Esta tabla conserva el usuario funcional del sistema. Complementa a `auth.users` con informacion propia del dominio de negocio.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`

**Relacion logica con Auth:**

- `supabase_user_id -> auth.users.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad interna del usuario |
| `organization_id` | `bigint` | Organizacion a la que pertenece |
| `supabase_user_id` | `uuid` | Vinculo con la identidad gestionada por Supabase Auth |
| `email` | `varchar` | Correo del usuario |
| `full_name` | `varchar` | Nombre mostrado en la aplicacion |
| `avatar_url` | `text` | Referencia visual del usuario |
| `role` | `user_role` | Rol de aplicacion: `WORKER`, `HR`, `MANAGER`, `ADMIN` |
| `receives_notifications` | `boolean` | Indica si el usuario recibe alertas de contratos |
| `is_active` | `boolean` | Estado logico del usuario |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Semantica de `user_role`

El enum `user_role` permite distinguir el alcance funcional esperado de cada usuario dentro de la aplicacion.

- `WORKER`: usuario de consulta general. Puede revisar informacion operativa del sistema, pero no carga contratos, no los edita y no tiene acceso a la metadata financiera.
- `HR`: usuario de recursos humanos. Puede cargar y dar seguimiento a contratos vinculados a trabajadores o personal y tiene acceso a metadata financiera de los trabajadores o personal.
- `MANAGER`: usuario de gestion contractual. Puede cargar, editar y administrar contratos, ademas de consultar metadata financiera y datos estructurados ampliados.
- `ADMIN`: usuario con control total. Puede administrar usuarios, configuraciones, facturacion, reglas operativas y supervision general de la plataforma.

### Rol de `receives_notifications`

El campo `receives_notifications` no reemplaza al rol, sino que lo complementa. Su objetivo es indicar si un usuario debe recibir alertas de vencimiento, independientemente del `user_role` que tenga asignado.

## `public.documents`

Guarda la cabecera del documento y la referencia al archivo asociado. El detalle economico no se persiste aqui, sino en `documents_services`.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del documento |
| `organization_id` | `bigint` | Organizacion propietaria |
| `name` | `varchar` | Nombre del documento |
| `client` | `varchar` | Cliente asociado |
| `type` | `document_type` | Tipo documental: `COMPANY`, `LABOR` |
| `start_date` | `date` | Inicio del periodo contractual |
| `end_date` | `date` | Fin del periodo contractual |
| `form_data` | `jsonb` | Estructura flexible con datos complementarios del documento |
| `state` | `document_state` | Estado documental: `DRAFT`, `PENDING_SIGNATURE`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `TERMINATED` |
| `file_path` | `text` | Ruta tecnica del archivo en Storage |
| `file_name` | `text` | Nombre del archivo asociado |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Semantica de `document_type`

El enum `document_type` separa la naturaleza general del contrato dentro del dominio.

- `COMPANY`: contrato corporativo, comercial o institucional.
- `LABOR`: contrato laboral o asociado a trabajadores y gestion de personal.

### Semantica de `document_state`

El enum `document_state` describe la situacion operativa del contrato dentro de su ciclo de vida.

- `DRAFT`: contrato en preparacion o pendiente de revision.
- `PENDING_SIGNATURE`: contrato ya preparado para circular, pero aun pendiente de firma.
- `ACTIVE`: contrato vigente y fuera de la ventana activa de alerta.
- `EXPIRING_SOON`: contrato vigente que ya entro en una ventana de notificacion definida por las reglas activas.
- `EXPIRED`: contrato cuya vigencia ya concluyo por fecha.
- `TERMINATED`: contrato cerrado o finalizado antes de su vencimiento natural.

### Como se organiza la informacion del documento

El modelo documental se distribuye en varias piezas:

- la cabecera principal vive en `public.documents`
- el detalle economico y de servicios vive en `public.documents_services`
- los datos variables pueden agruparse en `form_data`
- el archivo se referencia con `file_path` y `file_name`

## `public.services`

Contiene el catalogo de servicios de cada organizacion. Su objetivo es reutilizar conceptos contractuales sin repetir su definicion en cada documento.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del servicio |
| `organization_id` | `bigint` | Organizacion propietaria |
| `name` | `varchar` | Nombre del servicio |

## `public.documents_services`

Es la tabla que enlaza documentos y servicios, pero ademas conserva la informacion economica y temporal de cada linea contractual.

**Clave primaria:** `id`

**Claves foraneas:**

- `document_id -> documents.id`
- `service_id -> services.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad del registro |
| `document_id` | `bigint` | Documento asociado |
| `service_id` | `bigint` | Servicio asociado |
| `description` | `text` | Descripcion de la linea contractual |
| `value` | `float8` | Valor monetario |
| `currency` | `currency_type` | Moneda utilizada: `PEN`, `USD`, `EUR` |
| `start_date` | `date` | Inicio del periodo asociado |
| `end_date` | `date` | Fin del periodo asociado |

Esta tabla permite representar contratos con una o varias lineas de servicio sin duplicar la cabecera documental.

## `public.conversations`

Guarda el historial conversacional que la aplicacion muestra al usuario y reutiliza para continuar el chat.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`
- `user_id -> users.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la conversacion |
| `organization_id` | `bigint` | Organizacion propietaria |
| `user_id` | `bigint` | Usuario asociado al hilo |
| `title` | `varchar` | Titulo mostrado en la interfaz |
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

Conserva las plantillas base que el sistema utiliza para generar contratos por organizacion.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la plantilla |
| `organization_id` | `bigint` | Organizacion propietaria |
| `name` | `varchar` | Nombre de la plantilla |
| `description` | `text` | Descripcion funcional |
| `content` | `jsonb` | Estructura base para renderizar el contrato |
| `state` | `document_template_state` | Estado de la plantilla: `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `created_at` | `timestamptz` | Fecha de creacion |

## `public.notification_rules`

Define las ventanas de alerta de vencimiento para una organizacion o para un contrato puntual.

**Clave primaria:** `id`

**Claves foraneas:**

- `organization_id -> organizations.id`
- `document_id -> documents.id` (opcional)
- `created_by -> users.id` (opcional)

| Columna | Tipo | Detalle |
|---------|------|---------|
| `id` | `bigint` | Identidad de la regla |
| `organization_id` | `bigint` | Organizacion propietaria |
| `document_id` | `bigint` | Contrato especifico al que aplica la regla; si es `null`, aplica como regla por defecto de la organizacion |
| `days_before_due` | `integer` | Numero de dias previos al vencimiento que disparan la alerta |
| `is_active` | `boolean` | Permite activar o desactivar la regla sin eliminarla |
| `created_by` | `bigint` | Usuario que registro la regla |
| `created_at` | `timestamptz` | Fecha de creacion |
| `updated_at` | `timestamptz` | Fecha de actualizacion |

### Resolucion de reglas de alerta

La aplicacion resuelve las alertas con este orden:

- si un contrato tiene reglas activas propias, se usan esas
- si no tiene, hereda las reglas activas de la organizacion
- si no existe configuracion, el backend usa un fallback temporal compatible con la version actual

### Estructura utilizada en `content`

```json
{
  "body_md": "# Contrato\n\nEntre las partes...",
  "fields": [],
  "version": 1
}
```

<!--
## Desalineaciones Actuales con la API Documentada

La documentacion OpenAPI y el modelo fisico actual no estan completamente alineados. Estas son las diferencias que conviene tener presentes:

| Tema | API documentada | Base real en Supabase |
|------|------------------|-----------------------|
| Tipo de documento | `Empresa`, `Trabajador` | `COMPANY`, `LABOR` |
| Estado de documento | `Borrador`, `Pendiente de firma`, `Activo`, `Por vencer`, `Expirado`, `Terminado` | `DRAFT`, `PENDING_SIGNATURE`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `TERMINATED` |
| Valor y moneda | En `DocumentResponse` | En `documents_services` y/o `form_data` |
| Licencias | Campo expuesto por la API | No existe como columna en `public` |
| Mensajes de conversacion | `sender` y `message` | `role`, `content`, `timestamp` |

Esta diferencia no invalida la API, pero si obliga a entender que el backend esta transformando el modelo antes de exponerlo al frontend.
-->
