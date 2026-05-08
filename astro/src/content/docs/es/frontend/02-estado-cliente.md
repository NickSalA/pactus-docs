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
6. Redirección a `/dashboard` con sesión activa

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

  if (session) {
    router.replace("/dashboard");
  } else {
    router.replace("/login");
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
    role: "Notario",
    avatarUrl: metadata.avatar_url || null,
  };
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
export type UserRole = 'admin' | 'user';

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

## Tipos de Contratos y Filtros

### Tipos de Filtro

```typescript
export type SortOrder = "newest" | "oldest";

export type DateRange = {
  end: string | null;
  start: string | null;
};

export type DocumentFilterValue = "all" | "active" | "expiring" | "expired";
```

### Tipos de Selección

```typescript
export interface SelectionState {
  selectedIds: number[];
  isAllSelected: boolean;
}
```

### Document

```typescript
export interface Document {
  id: number;
  organization_id: number;
  name: string;
  client: string;
  type: DocumentType;
  start_date: string;
  end_date: string;
  state: DocumentState | null;
  form_data: Record<string, unknown>;
  file_path: string | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
}
```

### Estados de Documento

```typescript
export enum DocumentState {
  ACTIVE = "ACTIVE",
  EXPIRING = "EXPIRING",
  EXPIRED = "EXPIRED",
}

export enum DocumentType {
  SERVICES = "SERVICIOS",
  COMPANY = "COMPANY",
  LICENSE = "LICENSE",
}
```

## Hooks de Contratos

### useContractsFilters

El hook `useContractsFilters` gestiona todos los filtros de la página de contratos:

```typescript
// src/features/contracts/hooks/use-contracts-filters.ts
import { useState, useMemo, useCallback } from "react";

export function useContractsFilters(activeContracts: Document[]) {
  const [filter, setFilter] = useState<DocumentFilterValue>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [dateRange, setDateRange] = useState<DateRange>({ end: null, start: null });

  const filteredContracts = useMemo(() => {
    let result = filterContracts(activeContracts, filter, search);
    // Aplicar filtros adicionales...
    return result;
  }, [activeContracts, filter, search, sortOrder, dateRange]);

  return {
    filter,
    search,
    currentPage,
    itemsPerPage,
    sortOrder,
    dateRange,
    filteredContracts,
    totalPages,
    paginatedContracts,
    changeFilter,
    changeSearch,
    changePage,
    changeItemsPerPage,
    changeSortOrder,
    changeDateRange,
  };
}
```

### useContractsPage

El hook `useContractsPage` gestiona el estado completo de la página:

```typescript
// src/features/contracts/hooks/use-contracts-page.ts
export function useContractsPage(contracts: Document[]) {
  const filters = useContractsFilters(contracts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Recargar contratos...
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ...filters,
    isLoading,
    error,
    refresh,
  };
}
```

## Variables de Entorno

Variables necesarias para la autenticación:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | API Key pública de Supabase |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
