---
title: Vision General de la Base de Datos
description: Como se organiza la persistencia de ContractIA en Supabase y que rol cumple cada esquema principal.
---

ContractIA organiza su persistencia en **Supabase** y separa la informacion en varias capas para mantener desacoplados el dominio de negocio, la autenticacion, la continuidad del agente y el almacenamiento de archivos.

## Organizacion General

La estructura principal se apoya en estos esquemas:

| Esquema | Rol dentro del proyecto | Nivel de detalle en esta documentacion |
|---------|-------------------------|----------------------------------------|
| `public` | Modelo relacional del producto | Completo |
| `auth` | Identidad, sesiones y proveedores de acceso | Funcional |
| `checkpoint` | Estado interno del agente conversacional | Resumen tecnico |
| `storage` | Objetos y metadatos de archivos | Resumen tecnico |
| `realtime`, `vault`, `extensions` | Infraestructura interna de Supabase | Referencia breve |

En esta documentacion el foco principal esta puesto en `public`, porque ahi vive el modelo que utiliza la aplicacion para organizaciones, usuarios, documentos, conversaciones y plantillas.

## Criterios del Modelo

### 1. Aislamiento por organizacion

La tabla `organizations` funciona como raiz del dominio. A partir de ella se encadenan usuarios, documentos, servicios, conversaciones y plantillas mediante `organization_id`.

### 2. Separacion entre identidad y usuario de negocio

La autenticacion se delega a Supabase Auth en `auth.users`, mientras que el contexto funcional del sistema se conserva en `public.users`.

La relacion entre ambas capas se resuelve con `public.users.supabase_user_id`, lo que permite mantener desacoplado el esquema interno de Auth del modelo de negocio de la aplicacion.

### 3. Documento, archivo y detalle economico por separado

El proyecto no concentra todo en una sola tabla:

- `public.documents` guarda la cabecera documental
- `public.documents_services` guarda el detalle economico y de servicios
- `storage` conserva el archivo binario asociado

Esta separacion hace mas claro el modelo y evita cargar la tabla principal con informacion que pertenece a otra capa.

### 4. Uso de JSON para estructuras flexibles

El proyecto utiliza `jsonb` cuando la estructura necesita mantenerse flexible o agrupar datos que no justifican una tabla adicional. Esto ocurre principalmente en:

- `public.documents.form_data`
- `public.conversations.content`
- `public.document_templates.content`
- tablas del esquema `checkpoint`

## Recorrido Principal de los Datos

El flujo general de la aplicacion se organiza asi:

1. El usuario inicia sesion con Google mediante Supabase Auth.
2. Supabase administra la identidad y la sesion en el esquema `auth`.
3. La aplicacion vincula esa identidad con `public.users` y su `organization_id`.
4. Los documentos se registran en `public.documents` y su archivo se guarda en Storage.
5. El detalle economico del documento se registra en `public.documents_services`.
6. Las conversaciones visibles para la interfaz se guardan en `public.conversations`.
7. El estado interno del agente se conserva en el esquema `checkpoint`.

## Relacion con la API

La API no siempre expone las entidades exactamente igual a como se persisten en la base de datos. En varios casos el backend agrupa, transforma o simplifica informacion antes de entregarla al frontend.

Los ajustes mas importantes son estos:

- los enums de documentos se almacenan en ingles, aunque en la API puedan presentarse en un formato mas funcional
- el detalle economico del documento no vive en `public.documents`, sino en `public.documents_services`
- parte de la informacion variable del documento puede viajar agrupada dentro de `form_data`
- la API puede presentar ciertos campos como si fueran directos del documento, aunque internamente provengan de una relacion o de una transformacion adicional

Por eso, este modulo documenta primero la estructura de persistencia y luego deja contexto suficiente para entender como esa informacion llega a la capa de aplicacion.
