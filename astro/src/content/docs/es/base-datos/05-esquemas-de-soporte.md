---
title: Esquemas de Soporte
description: Cómo se apoyan los datos del dominio en Supabase Storage y en los esquemas internos de la plataforma.
---

Además del esquema `public`, Pactus utiliza capas de soporte de Supabase para resolver autenticación, almacenamiento de archivos e infraestructura interna. Esta sección se limita a esas piezas de soporte directo.

## Almacenamiento de Archivos

El archivo binario de un contrato se mantiene fuera de las tablas de negocio. La aplicación conserva en `public.documents` la referencia al archivo y delega el almacenamiento físico a Supabase Storage.

| Pieza | Funcion |
|-------|---------|
| `public.documents.file_name` | Nombre visible del archivo |
| `public.documents.file_path` | Ruta tecnica del archivo |
| `storage.objects` | Persistencia del binario |

Actualmente los archivos documentales se almacenan en el bucket `documents`, con una ruta organizada por organización, tipo documental y documento:

```text
orgs/{organization_id}/{document_type}/docs/{document_id}/{safe_name}
```

En la aplicación esto se refleja así:

- `file_name` se usa como nombre visible
- `file_path` queda como referencia técnica persistida
- la descarga y vista previa no se hacen contra Storage de forma directa
- el backend genera una URL firmada temporal para entregar acceso seguro al archivo

De esta manera, el modelo documental queda desacoplado de la implementación física del almacenamiento.

## Esquema `auth`

Supabase Auth aporta una capa de soporte esencial para la base de datos del producto, aunque su detalle funcional ya se documenta en la sección de seguridad.

Las tablas más relevantes para esta arquitectura son:

- `auth.users`
- `auth.identities`
- `auth.sessions`
- `auth.refresh_tokens`

Su objetivo no es modelar el dominio del producto, sino sostener identidad, sesiones y proveedores de acceso.

## Otros Esquemas Internos de Supabase

Además de `public`, `auth` y `storage`, la plataforma incluye otros esquemas internos que forman parte del entorno técnico general.

| Esquema | Rol |
|---------|-----|
| `realtime` | Infraestructura de suscripciones y eventos realtime |
| `vault` | Manejo de secretos a nivel de base de datos |
| `extensions` | Extensiones de PostgreSQL habilitadas en el proyecto |

Estos esquemas no forman parte directa del dominio de negocio, pero sí del entorno técnico sobre el que funciona la aplicación.

## Límite de Alcance

Esta documentación de base de datos queda acotada al dominio del producto y a sus soportes directos en Supabase para no mezclar persistencia de negocio con infraestructura auxiliar.
