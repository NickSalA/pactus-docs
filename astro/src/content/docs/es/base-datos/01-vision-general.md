---
title: Visión General de la Base de Datos
description: Cómo se organiza la persistencia relacional, auditoría, telemetría y soporte documental de Pactus en Supabase.
---

Esta documentación describe la **base de datos vigente del producto en Supabase**. El foco está puesto en el modelo persistente que utiliza la aplicación y en los soportes directos necesarios para operar el dominio documental.

## Organizacion General

La persistencia del sistema ya no concentra el dominio en `public`. El modelo vigente usa esquemas especializados:

| Capa | Dónde vive | Rol dentro del proyecto | Nivel de detalle en esta documentación |
|------|------------|-------------------------|----------------------------------------|
| Identidad funcional | `identity` | Organizaciones y usuarios de negocio | Completo |
| Contratos | `contracts` | Documentos, carpetas y extensiones contractuales | Completo |
| Catálogo | `catalog` | Servicios reutilizables por organización | Completo |
| Plantillas | `templates` | Plantillas y formatos documentales | Completo |
| Notificaciones | `notifications` | Reglas, alertas y logs de envío | Completo |
| Chatbot | `chatbot` | Conversaciones visibles del producto | Completo |
| Auditoría | `audit` | Actividad auditada de usuarios, chatbot, contratos, plantillas y telemetría de tokens | Completo |
| Tipos compartidos | `app_types` | Enums reutilizados por varias tablas | Funcional |
| Identidad Supabase | `auth` | Login, sesiones y proveedor OAuth | Funcional |
| Archivos | `storage` | Persistencia fisica de documentos | Funcional |
| Infraestructura | `checkpoint`, `realtime`, `vault`, `extensions` | Soporte interno o tecnico | Breve |

## Tablas del Dominio

Las tablas relacionales actualmente relevantes para el producto son las siguientes:

| Tabla | Rol principal |
|-------|---------------|
| `identity.organizations` | Raíz del tenant y datos corporativos |
| `identity.users` | Usuario funcional vinculado a Auth |
| `contracts.documents` | Cabecera documental y referencia al archivo |
| `catalog.services` | Catálogo de servicios por organización |
| `contracts.company_contracts` | Extension corporativa para contratos de empresa |
| `contracts.labor_contracts` | Extension laboral para contratos de trabajo |
| `contracts.company_contract_services` | Lineas de servicio por contrato corporativo |
| `chatbot.conversations` | Historial visible del chat del producto |
| `templates.document_templates` | Plantillas por organizacion |
| `templates.template_formats` | Catálogo de formatos de plantilla |
| `contracts.document_folders` | Carpetas documentales por rol |
| `notifications.notification_rules` | Reglas de alerta por organización o contrato |
| `notifications.notification_send_logs` | Registro diario de correos enviados |
| `audit.user_activity` | Eventos auditados de gestión de usuarios |
| `audit.chatbot_activity` | Eventos auditados de uso del chatbot |
| `audit.contract_activity` | Eventos auditados de contratos |
| `audit.template_activity` | Eventos auditados de plantillas |

La tabla legacy `public.empresas` ya no forma parte del modelo vigente. El esquema `public` no contiene actualmente las tablas de negocio principales.

> Las tablas `checkpoint_*` son internas del motor de workflows y no forman parte del dominio documental.

## Criterios del Modelo

### 1. Aislamiento por organización

`identity.organizations` funciona como raíz del dominio. Desde ahí se encadenan usuarios, documentos, servicios, conversaciones, carpetas, plantillas, reglas, logs y actividad auditada mediante `organization_id`.

### 2. Separación entre identidad y usuario de negocio

La autenticación se delega a Supabase Auth en `auth.users`, mientras que el contexto funcional del sistema se conserva en `identity.users`.

La vinculación entre ambas capas se hace con `identity.users.supabase_user_id`, lo que permite desacoplar la identidad administrada por Supabase del modelo de negocio propio.

### 3. Modelo documental descompuesto

El sistema no concentra toda la información contractual en una sola tabla:

- `contracts.documents` guarda la cabecera del contrato, el origen técnico y la referencia al archivo
- `contracts.company_contracts` guarda la extensión corporativa (RUC, cliente)
- `contracts.labor_contracts` guarda la extensión laboral (trabajador, salario, posición)
- `contracts.company_contract_services` guarda el detalle económico por línea de servicio
- `catalog.services` define el catálogo reutilizable
- `contracts.document_folders` clasifica documentos por rol
- `storage` conserva el archivo binario asociado

Esta separación evita duplicidad y facilita que el backend combine cabecera, líneas de servicio, extensión contractual y archivo según el caso de uso.

### 4. Plantillas con formato explícito

Las plantillas viven en `templates.document_templates` y se apoyan en `templates.template_formats`, que define formatos reutilizables por `document_type` y código técnico.

Esto permite que una organización tenga varias plantillas del mismo tipo documental sin perder el contexto del formato esperado.

### 5. Auditoría unificada con telemetría embebida

La actividad auditada no se mezcla con las tablas transaccionales. El esquema `audit` registra eventos relevantes para trazabilidad:

- `audit.user_activity` para altas, cambios y bajas de usuarios
- `audit.chatbot_activity` para conversaciones, mensajes, respuestas generadas y telemetría de tokens y costos
- `audit.contract_activity` para creación, actualización, importación y eliminación de contratos
- `audit.template_activity` para creación, edición, publicación y archivado de plantillas

La medición detallada de tokens, costos y modelo usado vive directamente en `audit.chatbot_activity`. Esto permite consultar uso y costos sin acoplar la conversación visible al detalle operativo de consumo, manteniendo toda la telemetría dentro del esquema de auditoría.

### 6. Uso selectivo de JSONB

El proyecto usa `jsonb` cuando necesita conservar estructuras flexibles sin multiplicar tablas auxiliares. Los tres puntos más importantes son:

- `contracts.documents.form_data`
- `chatbot.conversations.content`
- `templates.document_templates.content`

En particular, `documents.form_data` no solo guarda campos variables del contrato. El backend también reutiliza claves como `value` y `currency` para filtros, rankings y consultas agregadas.

## Recorrido Principal de los Datos

El flujo relacional principal de la aplicación puede leerse así:

1. El usuario inicia sesión con Google mediante Supabase Auth.
2. Supabase gestiona identidad y sesión en `auth`.
3. La aplicación vincula esa identidad con `identity.users` y su `organization_id`.
4. Las carpetas y el catálogo de servicios se resuelven dentro de la organización actual.
5. Los contratos se registran en `contracts.documents`. Los contratos corporativos tienen extension en `contracts.company_contracts` y lineas de servicio en `contracts.company_contract_services`. Los contratos laborales tienen extension en `contracts.labor_contracts`.
6. El archivo del contrato se guarda en Supabase Storage y queda referenciado desde `file_path` y `file_name`.
7. Las plantillas viven en `templates.document_templates` y se relacionan opcionalmente con `templates.template_formats`.
8. Las reglas de alerta viven en `notifications.notification_rules` y el historial de envíos en `notifications.notification_send_logs`.
9. La función `contracts.sync_document_states` recalcula estados documentales a partir de fechas y reglas activas.
10. Las acciones relevantes y la telemetría de tokens quedan registradas en `audit.*`.

## Relación con la API y el Backend

La API no expone siempre las tablas exactamente como se persisten. En varios casos, el backend agrupa, valida o transforma información antes de entregarla al frontend.

Los ajustes más importantes son estos:

- los enums compartidos viven en `app_types`: `COMPANY`, `LABOR`, `DRAFT`, `ACTIVE`, `PEN`, `USD`, etc.
- `contracts.documents.type` guarda un tipo técnico u origen, como `google_drive`, `management` o `fixed_term`
- el tipo funcional `COMPANY` o `LABOR` se resuelve por las extensiones contractuales y por campos API como `contract_type`
- el detalle económico de contratos corporativos vive en `contracts.company_contract_services`, no en `contracts.documents`
- los contratos laborales guardan su información salarial en `contracts.labor_contracts`
- el backend también conserva información resumida dentro de `contracts.documents.form_data` para ciertas consultas
- `templates.document_templates.content` guarda una estructura rica de plantilla, incluyendo `fields`, `operational_fields` y, cuando aplica, `contract_date_mapping`
- el archivo del contrato no se entrega de forma directa desde Storage; el backend genera URLs firmadas temporales
- `audit.*` soporta trazabilidad, métricas y reportes, pero no reemplaza las tablas transaccionales

## Alcance de Esta Documentación

Este módulo documenta la base de datos del producto y su soporte directo en Supabase, manteniendo el foco en el dominio transaccional, auditoría, telemetría y las capas necesarias para autenticación y almacenamiento documental.
