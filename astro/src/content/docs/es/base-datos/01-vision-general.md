---
title: Visión General de la Base de Datos
description: Cómo se organiza la persistencia relacional y el soporte documental de Pactus en Supabase.
---

Esta documentación describe la **base de datos vigente del producto en Supabase**. El foco está puesto en el modelo persistente que utiliza la aplicación y en los soportes directos de Supabase necesarios para operar el dominio documental.

## Organizacion General

La persistencia del sistema se organiza en las siguientes capas:

| Capa | Dónde vive | Rol dentro del proyecto | Nivel de detalle en esta documentación |
|------|------------|-------------------------|----------------------------------------|
| Dominio | `public` | Modelo relacional principal del producto | Completo |
| Identidad | `auth` | Login, sesiones y proveedor OAuth | Funcional |
| Archivos | `storage` | Persistencia fisica de documentos | Funcional |
| Infraestructura | `realtime`, `vault`, `extensions` | Soporte interno de Supabase | Breve |

El foco principal está en `public`, porque ahí viven las entidades que el backend usa de forma directa: organizaciones, usuarios, documentos, catálogo de servicios, conversaciones, carpetas, plantillas y reglas de notificación.

## Tablas del Dominio

Las tablas relacionales actualmente relevantes para el producto son las siguientes:

| Tabla | Rol principal |
|-------|---------------|
| `organizations` | Raíz del tenant y datos corporativos |
| `users` | Usuario funcional vinculado a Auth |
| `documents` | Cabecera documental y referencia al archivo |
| `services` | Catálogo de servicios por organización |
| `company_contracts` | Extension corporativa para contratos de empresa |
| `labor_contracts` | Extension laboral para contratos de trabajo |
| `company_contract_services` | Lineas de servicio por contrato corporativo |
| `conversations` | Historial visible del chat del producto |
| `document_templates` | Plantillas por organizacion |
| `template_formats` | Catálogo de formatos de plantilla |
| `document_folders` | Carpetas documentales por rol |
| `notification_rules` | Reglas de alerta por organización o contrato |
| `notification_send_logs` | Registro diario de correos enviados |

La tabla legacy `public.empresas` ya no forma parte del modelo vigente.

> Las tablas `checkpoint_*` (checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes) son internas del motor de workflows y no forman parte del dominio documental.

## Criterios del Modelo

### 1. Aislamiento por organización

`public.organizations` funciona como raíz del dominio. Desde ahí se encadenan usuarios, documentos, servicios, conversaciones, carpetas, plantillas y reglas mediante `organization_id`.

### 2. Separación entre identidad y usuario de negocio

La autenticación se delega a Supabase Auth en `auth.users`, mientras que el contexto funcional del sistema se conserva en `public.users`.

La vinculación entre ambas capas se hace con `public.users.supabase_user_id`, lo que permite desacoplar la identidad administrada por Supabase del modelo de negocio propio.

### 3. Modelo documental descompuesto

El sistema no concentra toda la información contractual en una sola tabla:

- `public.documents` guarda la cabecera del contrato
- `public.company_contracts` guarda la extensión corporativa (RUC, cliente)
- `public.labor_contracts` guarda la extensión laboral (trabajador, salario, posición)
- `public.company_contract_services` guarda el detalle económico por línea de servicio (solo para contratos corporativos)
- `public.services` define el catálogo reutilizable
- `public.document_folders` clasifica documentos por rol
- `storage` conserva el archivo binario asociado

Esta separación evita duplicidad y facilita que el backend combine cabecera, líneas de servicio y archivo según el caso de uso.

### 4. Plantillas con formato explícito

Las plantillas no solo se almacenan por organización. También se apoyan en `public.template_formats`, que define formatos reutilizables por `document_type` y código técnico.

Esto permite que una organización tenga varias plantillas del mismo tipo documental sin perder el contexto del formato esperado.

### 5. Uso selectivo de JSONB

El proyecto usa `jsonb` cuando necesita conservar estructuras flexibles sin multiplicar tablas auxiliares. Los tres puntos más importantes son:

- `public.documents.form_data`
- `public.conversations.content`
- `public.document_templates.content`

En particular, `documents.form_data` no solo guarda campos variables del contrato. El backend también reutiliza claves como `value` y `currency` para filtros, rankings y consultas agregadas.

## Recorrido Principal de los Datos

El flujo relacional principal de la aplicación puede leerse así:

1. El usuario inicia sesión con Google mediante Supabase Auth.
2. Supabase gestiona identidad y sesión en `auth`.
3. La aplicación vincula esa identidad con `public.users` y su `organization_id`.
4. Las carpetas y el catálogo de servicios se resuelven dentro de la organización actual.
5. Los contratos se registran en `public.documents`. Los contratos corporativos tienen extension en `public.company_contracts` y lineas de servicio en `public.company_contract_services`. Los contratos laborales tienen extension en `public.labor_contracts`.
6. El archivo del contrato se guarda en Supabase Storage y queda referenciado desde `file_path` y `file_name`.
7. Las plantillas viven en `public.document_templates` y se relacionan opcionalmente con `public.template_formats`.
8. Las reglas de alerta viven en `public.notification_rules` y el historial de envíos en `public.notification_send_logs`.
9. La función `public.sync_document_states` recalcula estados documentales a partir de fechas y reglas activas.

## Relación con la API y el Backend

La API no expone siempre las tablas exactamente como se persisten. En varios casos, el backend agrupa, valida o transforma información antes de entregarla al frontend.

Los ajustes más importantes son estos:

- los enums documentales se almacenan en inglés: `COMPANY`, `LABOR`, `DRAFT`, `ACTIVE`, etc.
- el detalle económico de contratos corporativos vive en `company_contract_services`, no en `documents`
- los contratos laborales guardan su información salarial en `labor_contracts`
- el backend también conserva información resumida dentro de `documents.form_data` para ciertas consultas
- `document_templates.content` guarda una estructura rica de plantilla, incluyendo `fields`, `operational_fields` y, cuando aplica, `contract_date_mapping`
- el archivo del contrato no se entrega de forma directa desde Storage; el backend genera URLs firmadas temporales

## Alcance de Esta Documentación

Este módulo documenta la base de datos del producto y su soporte directo en Supabase, manteniendo el foco en el dominio transaccional y en las capas necesarias para autenticación y almacenamiento documental.
