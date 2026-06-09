---
title: Autenticación y Estado del Cliente
description: Sistema de autenticación con Supabase OAuth y gestión de estado global con Zustand
---

Pactus implementa autenticación mediante **Supabase Auth** con Google OAuth como proveedor principal, y gestiona el estado global de la aplicación con **Zustand**.

## Roles del Sistema

El sistema define cuatro roles de usuario:

| Rol | Descripción |
|-----|-------------|
| `SUPERADMIN` | Portal de aprovisionamiento de organizaciones (`/super-admin`) |
| `ADMIN` | Acceso a la consola de administración |
| `MANAGER` | Acceso al panel gerencial y métricas comerciales |
| `HR` | Acceso al panel de gestión de personal |
| `WORKER` | Acceso básico a contratos y agente IA |

## Auth Store

Estado de autenticación gestionado con Zustand. Almacena la identidad del usuario y sesion activa.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `User` | Datos del usuario autenticado |
| `accessToken` | `string` | Token de acceso OAuth |
| `isAuthenticated` | `boolean` | Indica si hay sesión activa |
| `isHydrating` | `boolean` | Indica si el store está sincronizando con Supabase |

Métodos disponibles:
- `setAccessToken(token)` — Actualiza el token de acceso
- `setHydrating(boolean)` — Controla el estado de sincronización
- `setUser(user)` — Establece los datos del usuario
- `setSession(user, token)` — Establece sesión completa
- `logout()` — Cierra la sesión y limpia el store

## Sidebar Store

Estado del sidebar colapsado/expandido, persistido en localStorage.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isCollapsed` | `boolean` | Indica si el sidebar está colapsado |

Métodos disponibles:
- `toggleSidebar()` — Alterna entre colapsado/expandido
- `setCollapsed(boolean)` — Establece el estado explicitly

## Mapeo de Usuario

Transforma el usuario de Supabase al formato requerido por la aplicación:
- Extrae `email`, `role` y `avatarUrl` del usuario de Supabase
- Asigna rol `HR` por defecto si el usuario no tiene rol asignado
- Normaliza nombres (elimina espacios dobles, formatea nombre completo)

## Sincronización de Sesión

El `SidebarFooter` sincroniza el estado de autenticación con Supabase en tiempo real:
- Verifica la sesión activa al cargar la página
- Escucha cambios en la sesión desde otras pestañas del navegador
- Detecta cierre de sesión expirado o manual y redirige a login

## Cierre de Sesión

Flujo de logout:
1. Invoca `supabase.auth.signOut()` para destruir la sesión en Supabase
2. Limpia el Auth Store (user, accessToken, isAuthenticated)
3. Redirige a `/login`

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | API Key pública de Supabase |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
