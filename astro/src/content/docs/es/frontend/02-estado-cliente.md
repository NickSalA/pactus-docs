---
title: Autenticación y Estado del Cliente
description: Sistema de autenticación con Supabase OAuth y gestión de estado global con Zustand
---

Pactus implementa autenticación mediante **Supabase Auth** con Google OAuth como proveedor principal, y gestiona el estado global de la aplicación con **Zustand** (stores exportados desde `src/store/index.ts`).

## Roles del Sistema

El sistema define cinco roles de usuario:

| Rol | Descripción |
|-----|-------------|
| `SUPERADMIN` | Portal de aprovisionamiento de organizaciones (`/super-admin`) |
| `ADMIN` | Acceso a la consola de administración |
| `MANAGER` | Acceso al panel gerencial y métricas comerciales |
| `HR` | Acceso al panel de gestión de personal |
| `WORKER` | Acceso básico a contratos y agente IA |

## Auth Store

Estado de autenticación gestionado con Zustand en `src/store/authStore.ts`. Almacena la identidad del usuario y sesion activa.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `AuthDisplayUser \| null` | Datos del usuario autenticado |
| `accessToken` | `string \| null` | Token de acceso OAuth |
| `isAuthenticated` | `boolean` | Indica si hay sesión activa |
| `isHydrating` | `boolean` | Indica si el store está sincronizando con Supabase |
| `subscriptionActive` | `boolean \| null` | Indica si la suscripción está activa |

Métodos disponibles:
- `setAccessToken(token)` — Actualiza el token y deriva `isAuthenticated`
- `setHydrating(boolean)` — Controla el estado de sincronización
- `setUser(user)` — Establece los datos del usuario (autenticado + suscripción)
- `setSession(user, token)` — Establece sesión completa (usuario + token + no hydrating)
- `setSubscriptionActive(boolean)` — Establece solo el estado de suscripción
- `logout()` — Cierra la sesión y resetea el store a valores iniciales

## Sidebar Store

Estado del sidebar colapsado/expandido, persistido en localStorage.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isCollapsed` | `boolean` | Indica si el sidebar está colapsado |

Métodos disponibles:
- `toggleSidebar()` — Alterna entre colapsado/expandido
- `setCollapsed(boolean)` — Establece el estado explicitamente

## ContractImport Store

Estado de importación de contratos gestionado con Zustand en `src/store/contractImportStore.ts`. Maneja el ciclo de vida de las sesiones de importación desde Google Drive.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `session` | `ContractImportSession \| null` | Sesión activa de importación |

| Acción | Descripción |
|--------|-------------|
| `startImportSession(files)` | Crea nueva sesión, marca archivos como `PENDING` |
| `attachJobToSession(sessionId, jobId)` | Asocia un job ID del backend a la sesión |
| `applyImportEvent(event)` | Procesa eventos SSE del backend y actualiza estados |
| `markImportRequestFailed(sessionId, msg)` | Marca archivos no completados como `FAILED` |
| `markImportStreamFailed(jobId, msg)` | Establece `streamError` sin cambiar estados |
| `setImportWidgetExpanded(boolean)` | Expande/colapsa widget de progreso |
| `closeImportWidget()` | Limpia la sesión |

El estado interno de `ContractImportSession` incluye: `id`, `jobId`, `backendStatus`, `status`, `files[]`, `startedAt`, `finishedAt`, `isExpanded`, `streamError`.

## Mapeo de Usuario

Transforma el usuario de Supabase al formato requerido por la aplicación:
- Extrae `email`, `role` y `avatarUrl` del usuario de Supabase
- Asigna rol `WORKER` por defecto si el usuario no tiene rol asignado
- Normaliza nombres (elimina espacios dobles, formatea nombre completo)

## Sincronización de Sesión

El provider `AuthBootstrap` (`src/components/providers/AuthBootstrap.tsx`) sincroniza el estado de autenticación con Supabase:

1. Al montarse, obtiene la sesión existente via `supabase.auth.getSession()`
2. Se suscribe a `supabase.auth.onAuthStateChange()` para cambios en tiempo real
3. `syncSession(session)` procesa la sesión:
   - Sin session → resetea estado (limpia token, logout)
   - Con sesión → asigna token al API client y resuelve el usuario mediante `resolveSessionUser(session)`
4. `resolveSessionUser()` prioriza el backend:
   - Llama a `getCurrentUser()` (API propia del backend)
   - Si funciona → mapea con `mapBackendUserToAuthUser()` (rol real desde BD)
   - Si falla → fallback a `mapSupabaseUserToAuthUser()` (rol `WORKER` por defecto)
5. Control de concurrencia mediante contador `syncRun` y flag `mounted`

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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth usado por Google Picker |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | API key publica del proyecto Google para cargar Picker |
| `NEXT_PUBLIC_GOOGLE_APP_ID` | Numero de proyecto Google usado como App ID de Picker |

El login con Google no solicita permisos de Drive. El scope `https://www.googleapis.com/auth/drive.file` se solicita solo cuando el usuario abre el flujo de importacion desde Google Picker.
