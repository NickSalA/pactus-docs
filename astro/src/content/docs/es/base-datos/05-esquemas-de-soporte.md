---
title: Esquemas de Soporte
description: Como se apoyan el chat, los archivos y la recuperacion semantica en las capas de soporte del sistema.
---

Ademas del esquema `public`, ContractIA utiliza varias capas de soporte para resolver continuidad conversacional, almacenamiento de archivos y recuperacion de contexto. Esta seccion explica como participan dentro del funcionamiento general del proyecto.

## Historial y Continuidad del Chat

El modulo conversacional se apoya en dos persistencias distintas que trabajan juntas, pero cumplen funciones diferentes.

| Capa | Donde vive | Funcion |
|------|------------|---------|
| Historial visible | `public.conversations` | Conserva el historial que la aplicacion muestra al usuario |
| Estado interno del agente | `checkpoint.*` | Conserva el contexto tecnico del flujo conversacional |

Cuando el usuario inicia una conversacion nueva, el backend crea primero una fila en `public.conversations`. A partir de ahi, `conversation.id` se reutiliza como `thread_id` para el agente. Ese mismo identificador se usa en `checkpoint` para mantener continuidad entre mensajes.

Con esta separacion:

- la interfaz trabaja con conversaciones e historial
- el agente trabaja con checkpoints y estado interno

## Esquema `checkpoint`

El esquema `checkpoint` lo utiliza LangGraph para conservar snapshots y escrituras intermedias del agente entre una invocacion y otra.

| Tabla | Proposito |
|-------|-----------|
| `checkpoint.checkpoints` | Estado principal del hilo |
| `checkpoint.checkpoint_blobs` | Datos complementarios asociados al checkpoint |
| `checkpoint.checkpoint_writes` | Escrituras parciales del flujo |
| `checkpoint.checkpoint_migrations` | Control de version del esquema de checkpoint |

La relacion operativa del proyecto se puede leer asi:

```text
public.conversations.id <-> checkpoint.checkpoints.thread_id
```

No existe una foreign key entre ambas capas, pero en la implementacion trabajan sobre el mismo identificador de hilo.

## Almacenamiento de Archivos

El archivo binario de un contrato se mantiene fuera de las tablas de negocio. La aplicacion conserva en `public.documents` la referencia al archivo y delega el almacenamiento fisico a Supabase Storage.

| Pieza | Funcion |
|-------|---------|
| `public.documents.file_name` | Nombre visible del archivo |
| `public.documents.file_path` | Ruta tecnica del archivo |
| `storage.objects` | Persistencia del binario |

Actualmente los archivos documentales se almacenan en el bucket `documents`, con una ruta organizada por documento:

```text
documents/{document_id}/{filename}
```

En la interfaz esto se refleja de forma simple:

- `file_name` se usa como nombre visible
- `file_path` queda como referencia tecnica
- la vista previa y la descarga no se hacen contra Storage de forma directa
- el backend genera una URL firmada temporal para entregar acceso seguro al archivo

De esta manera, el modelo documental queda desacoplado de la implementacion fisica del almacenamiento.

## Recuperacion Semantica en Qdrant

La recuperacion semantica del proyecto se apoya en Qdrant. Aunque no forma parte de Supabase, si cumple un papel central dentro del flujo documental y del chat.

El backend utiliza al menos dos indices:

- `contracts_index`
- `drive_contracts_index`

En esos indices se conservan embeddings y metadatos como:

- `document_id`
- `organization_id`
- nombre de archivo
- origen del documento
- informacion de pagina y fragmento

Esta capa interviene principalmente en dos escenarios:

- cuando se ingiere un documento y se indexa su contenido
- cuando el agente necesita recuperar contexto semantico durante una conversacion

## Flujos que Reutilizan Estas Capas

Las capas de soporte no funcionan de forma aislada. El sistema las reutiliza en varios flujos del producto.

### 1. Carga manual de documentos

Cuando se sube un documento desde la aplicacion, el backend coordina tres acciones principales:

1. registrar el documento en PostgreSQL
2. almacenar el archivo en Supabase Storage
3. indexar el contenido en Qdrant

Si una etapa falla, el backend intenta compensar el proceso para no dejar el documento en un estado inconsistente.

### 2. Generacion desde plantilla

Las plantillas viven en `public.document_templates`, pero el documento generado sigue el mismo pipeline documental que una carga normal. Una vez generado el PDF:

1. se crea el registro documental
2. se guarda el archivo
3. se indexa el contenido

Por eso, la relacion entre plantilla y documento es principalmente funcional dentro del flujo de generacion.

### 3. Importacion desde Google Drive

La importacion desde Drive tambien reutiliza el pipeline documental. El frontend selecciona archivos, el backend recupera su contenido y luego los procesa igual que cualquier otro documento del sistema.

### 4. Chat con continuidad de contexto

En el flujo conversacional, el sistema combina varias capas al mismo tiempo:

1. actualiza el historial visible en `public.conversations`
2. conserva el estado interno en `checkpoint`
3. consulta Qdrant cuando necesita recuperar contexto semantico
4. complementa la respuesta con consultas estructuradas sobre PostgreSQL cuando corresponde

Ese cruce entre historial, checkpoint y recuperacion semantica es lo que permite mantener continuidad entre mensajes.

## Otros Esquemas Internos de Supabase

Ademas de `public`, `auth`, `checkpoint` y `storage`, la plataforma incluye otros esquemas internos que forman parte de la infraestructura general de Supabase.

| Esquema | Rol |
|---------|-----|
| `auth` | Identidad, sesiones y proveedores OAuth |
| `realtime` | Infraestructura de suscripciones y realtime |
| `vault` | Manejo de secretos en base de datos |
| `extensions` | Extensiones de PostgreSQL habilitadas |

Estos esquemas no forman parte directa del dominio de negocio, pero si del entorno tecnico sobre el que funciona la aplicacion.
