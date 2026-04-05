---
title: Supabase Auth y Seguridad
description: Como se integra Supabase Auth con el modelo de usuarios del sistema y como se organiza la seguridad en la aplicacion.
---

ContractIA utiliza **Supabase Auth** como capa de identidad y organiza la seguridad alrededor de dos niveles:

- autenticacion y sesion con Google OAuth
- control de acceso sobre las tablas de negocio del sistema

## Autenticacion con Supabase Auth

La autenticacion del proyecto se implemento sobre Supabase Auth con **Google** como proveedor principal. Con esta configuracion, Supabase se encarga de la identidad del usuario, la sesion y el ciclo de vida del login.

El flujo implementado es el siguiente:

1. El usuario inicia sesion desde el frontend.
2. Supabase gestiona el flujo OAuth con Google.
3. La sesion autenticada queda registrada en el esquema `auth`.
4. La aplicacion vincula esa identidad con el usuario funcional del sistema.
5. El frontend reutiliza la sesion para consumir la API protegida del backend.

## Tablas Principales del Esquema `auth`

Dentro de Supabase Auth, las tablas mas relevantes para esta implementacion son las siguientes:

| Tabla | Funcion dentro del proyecto |
|-------|-----------------------------|
| `auth.users` | Identidad autenticada principal |
| `auth.identities` | Proveedor de acceso y metadata asociada a la identidad |
| `auth.sessions` | Sesiones activas o historicas del usuario |
| `auth.refresh_tokens` | Renovacion de la sesion cuando el token expira |

En la configuracion actual, el proveedor utilizado es `google`, en linea con el flujo de autenticacion documentado en frontend.

## Relacion entre Identidad y Usuario de Negocio

En el proyecto se separo la identidad autenticada del usuario funcional de la aplicacion.

| Capa | Tabla | Responsabilidad |
|------|-------|-----------------|
| Identidad | `auth.users` | Define quien inicia sesion |
| Negocio | `public.users` | Define a que organizacion pertenece y que rol tiene dentro del sistema |

La vinculacion entre ambas capas se hace mediante este campo:

```text
public.users.supabase_user_id -> auth.users.id
```

Esta relacion es logica y no fisica. La intencion es mantener desacoplado el subsistema de autenticacion del modelo de negocio, sin perder la trazabilidad entre ambos.

## Rol de `public.users`

La tabla `public.users` complementa lo que Supabase Auth no resuelve por si solo. En ella se conserva el contexto funcional del usuario dentro de ContractIA.

Los campos mas importantes para ese objetivo son:

- `organization_id`
- `role`
- `full_name`
- `avatar_url`
- `is_active`

Con esta separacion, el sistema puede autenticar a un usuario con Supabase y, al mismo tiempo, mantener su relacion con una organizacion, su rol y su estado dentro del producto.

## Organizacion de la Seguridad

La seguridad del proyecto se apoya en dos capas complementarias.

### 1. Capa de identidad

Supabase Auth resuelve:

- autenticacion con Google
- emision y renovacion de sesion
- persistencia de identidad en `auth.*`

### 2. Capa de negocio

El acceso a los recursos de la aplicacion se organiza a partir de:

- `organization_id` para aislar la informacion por tenant
- `role` para distinguir permisos funcionales
- validaciones y control de acceso en backend

Este enfoque permite que la aplicacion no dependa solo del proveedor de autenticacion para decidir que puede hacer un usuario dentro del sistema.

## Estado de la Configuracion Actual

En la implementacion actual:

- el esquema `auth` queda administrado por Supabase
- las tablas de negocio viven en `public`
- la vinculacion entre `auth.users` y `public.users` se hace con `supabase_user_id`
- no se definieron politicas RLS para las tablas de `public`

Esto significa que, en esta version, el aislamiento de negocio se apoya principalmente en la logica del backend y en la asociacion del usuario con su `organization_id`.

## Criterio de Diseño

La decision de separar `auth.users` de `public.users` responde a una necesidad concreta del proyecto: mantener una autenticacion moderna y delegada en Supabase, pero conservar en el dominio propio toda la informacion que el producto necesita para operar.

Con esa base, ContractIA puede:

- autenticar usuarios con Google sin construir un sistema propio de login
- asociar cada usuario a una organizacion
- controlar roles de aplicacion sin depender del esquema interno de Auth
- mantener una estructura lista para evolucionar el control de acceso en siguientes iteraciones
