---
title: Jerarquía de Vistas y Componentes
description: Estructura de páginas, layouts y componentes reutilizables del frontend de ContractIA
---

El frontend de ContractIA está construido con **Next.js 16** usando App Router, lo que permite una organización clara de las vistas mediante **Route Groups** y layouts anidados.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.6 | Framework principal con App Router |
| React | 19.2.3 | Librería UI con hooks |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Framework de utilidades CSS |
| Zustand | 5.0.12 | Gestión de estado global |
| Supabase | 2.100.0 | Autenticación OAuth |
| Lucide React | 0.577.0 | Iconografía |

## Estructura de Carpetas

```text
src/
├── app/
│   ├── layout.tsx              # Layout raíz de la aplicación
│   ├── page.tsx                # Landing page (/)
│   ├── globals.css             # Estilos globales
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # Página de login (/login)
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx        # Callback OAuth (/auth/callback)
│   │
│   └── (main)/
│       ├── layout.tsx          # Layout con Sidebar + Header
│       ├── dashboard/
│       │   └── page.tsx        # Dashboard principal (/dashboard)
│       ├── contracts/
│       │   ├── page.tsx        # Gestión de contratos (/contracts)
│       │   └── AddContractForm.tsx
│       ├── ai-agent/
│       │   └── page.tsx        # Chat con IA (/ai-agent)
│       └── profile/
│           └── page.tsx        # Perfil de usuario (/profile)
│
├── components/
│   ├── home/
│   │   ├── Navbar.tsx          # Navbar de landing
│   │   └── HeroSection.tsx     # Hero de landing
│   └── layout/
│       ├── Sidebar.tsx         # Barra lateral de navegación
│       └── Header.tsx          # Header con usuario y notificaciones
│
├── lib/
│   ├── api.ts                  # Cliente API centralizado
│   ├── supabaseClient.ts       # Configuración de Supabase
│   └── authUser.ts             # Utilidades de usuario
│
├── store/
│   ├── index.ts                # Exports de stores
│   ├── authStore.ts            # Estado de autenticación
│   └── sidebarStore.ts         # Estado del sidebar
│
├── types/
│   └── api.types.ts            # Tipos TypeScript para API
│
└── public/
    ├── logo-contractAI-azul.png
    └── imagen-ContractAI-laptop.png
```

## Route Groups

Next.js App Router permite agrupar rutas sin afectar la URL usando paréntesis:

| Route Group | Descripción | Rutas |
|-------------|-------------|-------|
| `(auth)` | Páginas de autenticación sin layout principal | `/login` |
| `(main)` | Páginas protegidas con Sidebar y Header | `/dashboard`, `/contracts`, `/ai-agent`, `/profile` |
| `auth/callback` | Manejo de callback OAuth | `/auth/callback` |

## Páginas de la Aplicación

### Landing Page (`/`)

Página pública de presentación del sistema:
- Navbar con logo y nombre de la aplicación
- Hero section con propuesta de valor
- Imagen ilustrativa del producto
- Call-to-action para iniciar sesión

### Login (`/login`)

Página de autenticación con diseño moderno:
- Logo y branding de ContractIA
- Botón de autenticación con Google OAuth
- Estado de carga durante autenticación
- Manejo de errores con mensajes informativos
- Si ya está autenticado, muestra opción para ir al dashboard

### Dashboard (`/dashboard`)

Panel principal con métricas y resumen de actividad:

| Componente | Descripción |
|------------|-------------|
| Saludo personalizado | Mensaje de bienvenida con nombre del usuario |
| Tarjetas de métricas | Total contratos, Por vencer, Expirados con variación mensual |
| Tabla de documentos recientes | Últimos documentos con estado y fecha |
| Acciones rápidas | Botones para crear contrato y consultar agente IA |
| Paginación | Navegación entre páginas de documentos |

### Contratos (`/contracts`)

Gestión completa del ciclo de vida de contratos:
- Tabla con todos los contratos del sistema
- Filtrado por estado: Todos, Activo, Por vencer, Expirado
- Búsqueda por nombre, cliente o ID
- Acciones: Ver documento PDF, Editar, Eliminar
- Formulario modal para crear nuevos contratos
- Formulario modal para editar contratos existentes
- Modal de confirmación para eliminar
- Paginación configurable (items por página)

#### Estados de Contratos

| Estado | Color | Descripción |
|--------|-------|-------------|
| `ACTIVO` | Verde (emerald) | Contrato vigente sin fecha próxima de vencimiento |
| `POR_VENCER` | Amarillo (amber) | Contrato con fecha de vencimiento próxima |
| `EXPIRADO` | Rojo (red) | Contrato con fecha de vencimiento pasada |

### Agente IA (`/ai-agent`)

Interfaz de chat para interactuar con el chatbot:
- Área de chat con burbujas de mensaje (usuario/bot)
- Input de texto con soporte para Enter y Shift+Enter
- Historial de conversaciones en sidebar colapsable
- Opción para iniciar nueva conversación
- Carga de conversaciones previas desde el backend
- Indicador de carga mientras el bot procesa
- Manejo de errores con mensajes informativos

## Componentes de Layout

### Sidebar (`components/layout/Sidebar.tsx`)

Barra lateral de navegación colapsable:

```typescript
const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contratos", href: "/contracts", icon: FileText },
  { name: "Agente IA", href: "/ai-agent", icon: Bot },
];
```

Características:
- Logo con toggle para colapsar/expandir
- Indicador visual de ruta activa
- Gradiente de fondo azul
- Tooltips en modo colapsado
- Estado persistido con Zustand

### Header (`components/layout/Header.tsx`)

Header superior con información del usuario:
- Icono de notificaciones con indicador de alertas
- Avatar con iniciales del usuario
- Menú desplegable con opciones:
  - Ver perfil
  - Cerrar sesión
- Sincronización automática con Supabase Auth

### Layout Principal (`app/(main)/layout.tsx`)

```typescript
export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Flujo de Navegación

1. Usuario accede a la landing page (`/`)
2. Click en "Iniciar sesión" redirige a `/login`
3. Login con Google OAuth via Supabase
4. Callback en `/auth/callback` procesa la sesión
5. Redirección automática a `/dashboard`
6. Navegación interna mediante Sidebar
