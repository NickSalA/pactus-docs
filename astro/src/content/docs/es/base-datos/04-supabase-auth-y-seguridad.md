---
title: Supabase Auth y Seguridad
description: Cómo se integra Supabase Auth con el modelo de usuarios del sistema y cuál es el estado actual de la seguridad de acceso.
---

Pactus utiliza **Supabase Auth** como capa de identidad y organiza el acceso alrededor de dos niveles:

- autenticación y sesión con Google OAuth
- control de acceso del dominio desde `public.users`, `organization_id` y la lógica del backend

## Autenticacion con Supabase Auth

La autenticación del proyecto se implementa sobre Supabase Auth con **Google** como proveedor principal. Con esta configuración, Supabase se encarga de la identidad del usuario, la sesión y el ciclo de vida del login.

El flujo implementado es el siguiente:

1. El usuario inicia sesión desde el frontend.
2. Supabase gestiona el flujo OAuth con Google.
3. La sesión autenticada queda registrada en el esquema `auth`.
4. La aplicacion vincula esa identidad con el usuario funcional del sistema.
5. El frontend reutiliza la sesion para consumir la API protegida del backend.

## Tablas Principales del Esquema `auth`

Dentro de Supabase Auth, las tablas más relevantes para esta implementación son las siguientes:

| Tabla | Funcion dentro del proyecto |
|-------|-----------------------------|
| `auth.users` | Identidad autenticada principal |
| `auth.identities` | Proveedor de acceso y metadata asociada |
| `auth.sessions` | Sesiones activas o históricas |
| `auth.refresh_tokens` | Renovación de sesión cuando el token expira |

En la configuración actual, el proveedor utilizado es `google`.

## Relación entre Identidad y Usuario de Negocio

El proyecto separa la identidad autenticada del usuario funcional de la aplicación.

| Capa | Tabla | Responsabilidad |
|------|-------|-----------------|
| Identidad | `auth.users` | Define quien inicia sesion |
| Negocio | `public.users` | Define a qué organización pertenece y qué rol tiene |

La vinculación entre ambas capas se hace mediante este campo:

```text
public.users.supabase_user_id -> auth.users.id
```

La relación es lógica y no física. La intención es mantener desacoplado el subsistema de autenticación del modelo de negocio, sin perder trazabilidad entre ambos.

## Rol de `public.users`

La tabla `public.users` complementa lo que Supabase Auth no resuelve por sí solo. En ella se conserva el contexto funcional del usuario dentro de Pactus.

Los campos más importantes para ese objetivo son:

- `organization_id`
- `role`
- `receives_notifications`
- `full_name`
- `avatar_url`
- `is_active`

Con esta separación, el sistema puede autenticar a un usuario con Supabase y, al mismo tiempo, mantener su relación con una organización, su rol y su estado dentro del producto.

## Organizacion de la Seguridad

La seguridad del proyecto se apoya en dos capas complementarias.

### 1. Capa de identidad

Supabase Auth resuelve:

- autenticación con Google
- emisión y renovación de sesión
- persistencia de identidad en `auth.*`

### 2. Capa de negocio

El acceso a los recursos de la aplicacion se organiza a partir de:

- `organization_id` para aislar la información por tenant
- `role` para distinguir permisos funcionales
- validaciones y control de acceso en backend
- generación de URLs firmadas temporales para archivos documentales

Este enfoque permite que la aplicación no dependa solo del proveedor de autenticación para decidir qué puede hacer un usuario dentro del sistema.

## Estado de la Configuración Actual

En la implementación actual:

- el esquema `auth` queda administrado por Supabase
- las tablas de negocio viven en `public`
- la vinculación entre `auth.users` y `public.users` se hace con `supabase_user_id`
- el control de permisos de negocio se resuelve en backend
- el acceso a archivos usa URLs firmadas temporales generadas por el backend

## Criterio de Diseño

La decisión de separar `auth.users` de `public.users` responde a una necesidad concreta del proyecto: mantener una autenticación moderna y delegada en Supabase, pero conservar en el dominio propio toda la información que el producto necesita para operar.

Con esa base, Pactus puede:

- autenticar usuarios con Google sin construir un sistema propio de login
- asociar cada usuario a una organización
- controlar roles de aplicación sin depender del esquema interno de Auth
- decidir si un usuario recibe alertas contractuales con `receives_notifications`
- controlar el acceso a los recursos de negocio desde el backend, usando URLs firmadas para archivos documentales
