---
title: Autenticación y Estado del Cliente
description: Sistema de autenticación con Supabase OAuth y gestión de estado global con Zustand
---

ContractIA implementa autenticación mediante **Supabase Auth** con Google OAuth como proveedor principal, y gestiona el estado global de la aplicación con **Zustand**.

## Sistema de Autenticación

### Proveedor de Autenticación

El sistema utiliza Supabase Auth con OAuth 2.0 de Google:

```typescript
// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Flujo de Autenticación

1. Usuario hace click en "Continuar con Google" en `/login`
2. Supabase inicia el flujo OAuth con Google
3. Usuario autoriza la aplicación en Google
4. Google redirige a `/auth/callback` con código de autorización
5. `exchangeCodeForSession()` intercambia código por sesión
6. Redirección dinámica según el rol del usuario con sesión activa.

### Página de Login

```typescript
// src/app/(auth)/login/page.tsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    setError(error.message);
  }
  
  onClick={() => router.push(
    authUser.role === "ADMIN" 
        ? "/admin" 
        : authUser.role === "MANAGER" 
            ? "/dashboard/manager" 
            : "/dashboard/hr"
)}
};
```

### Callback de Autenticación

```typescript
// src/app/auth/callback/page.tsx
const handleAuthCallback = async () => {
  const code = new URL(window.location.href).searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (authUser.role === "ADMIN" || authUser.role === "Administrador") {
    router.replace("/admin");
  } else if (authUser.role === "MANAGER") {
    router.replace("/dashboard/manager");
  } else {
    router.replace("/dashboard/hr");
  }
};
```

## Gestión de Estado Global

### Auth Store

Estado de autenticación gestionado con Zustand:

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Sidebar Store

Estado del sidebar (colapsado/expandido):

```typescript
// src/store/sidebarStore.ts
import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
```

### Exportación Centralizada

```typescript
// src/store/index.ts
export { useAuthStore } from './authStore';
export { useSidebarStore } from './sidebarStore';
```

## Mapeo de Usuario

Utilidades para transformar el usuario de Supabase al formato de la aplicación:

```typescript
// src/lib/authUser.ts
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AuthDisplayUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

export const mapSupabaseUserToAuthUser = (user: SupabaseUser): AuthDisplayUser => {
  const metadata = user.user_metadata || {};
  const email = user.email || "sin-email@usuario.local";
  const rawName = metadata.full_name || metadata.name || fallbackNameFromEmail(email);
  const name = toNameAndLastName(rawName);
  
return {
  id: user.id,
  name,
  email,
  role: metadata.role || "HR", // El rol ahora se extrae de la metadata
  avatarUrl: metadata.avatar_url || null,
};

export const toNameAndLastName = (rawName: string): string => {
  const normalized = rawName.trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ").filter(Boolean);
  return parts.length <= 2 ? normalized : `${parts[0]} ${parts[1]}`;
};

export const toFirstName = (fullName: string): string => {
  return fullName.trim().split(" ")[0] || "Usuario";
};
```

## Sincronización de Sesión

El Header sincroniza automáticamente el estado con Supabase:

```typescript
// src/components/layout/Header.tsx
useEffect(() => {
  const syncUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(mapSupabaseUserToAuthUser(session.user));
    }
  };

  syncUser();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUserToAuthUser(session.user));
      } else {
        logout();
      }
    }
  );

  return () => subscription.unsubscribe();
}, [setUser, logout]);
```

## Cierre de Sesión

```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error cerrando sesión:", error.message);
  }
  logout(); // Limpia el store
  router.push("/");
};
```

## Tipos TypeScript

### Tipos de Usuario

```typescript
// src/types/api.types.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'HR' | 'user';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name?: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
}
```

### Tipos de Autenticación

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
```

## Variables de Entorno

Variables necesarias para la autenticación:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | API Key pública de Supabase |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
