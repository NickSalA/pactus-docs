---
title: CI/CD y Despliegue en Vercel
description: Estrategia de integración continua con GitHub Actions y configuración de despliegue en Vercel
---

Este documento describe la estrategia de **Integración Continua y Despliegue Continuo (CI/CD)** para el frontend de ContractIA, incluyendo la configuración de GitHub Actions, Vercel y las variables de entorno.

## Variables de Entorno

### Variables Públicas (NEXT_PUBLIC_)

Variables accesibles tanto en el servidor como en el cliente:

| Variable | Descripción | Valor Local |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend API | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | API Key pública de Supabase | `eyJhbGc...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | (Google Cloud) |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | API Key de Google | (opcional) |
| `NEXT_PUBLIC_GOOGLE_APP_ID` | App ID de Google | (opcional) |

### Archivo .env.local

Configuración para desarrollo local:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# Google OAuth (configurar en Supabase Dashboard)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXT_PUBLIC_GOOGLE_APP_ID=
```

### Variables por Entorno

| Entorno | NEXT_PUBLIC_API_URL | Descripción |
|---------|---------------------|-------------|
| Development | `http://localhost:8000` | Desarrollo local |
| Preview | `https://api-preview.contractia.railway.app` | Ramas feature/fix |
| Production | `https://api.contractia.railway.app` | Rama main |

## Scripts de Desarrollo

### package.json

```json
{
  "name": "contractia-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `next dev` | Servidor de desarrollo con hot reload |
| `build` | `next build` | Compilación optimizada para producción |
| `start` | `next start` | Servidor de producción |
| `lint` | `eslint` | Análisis estático de código |
| `type-check` | `tsc --noEmit` | Verificación de tipos TypeScript |
| `test` | `vitest run` | Ejecutar tests unitarios |

## Pipeline de GitHub Actions

### Pasos del Pipeline CI

| Orden | Paso | Comando | Descripción |
|-------|------|---------|-------------|
| 1 | Lint | `npm run lint` | Verificar reglas de ESLint |
| 2 | Type Check | `npm run type-check` | Verificar tipos TypeScript |
| 3 | Tests | `npm run test` | Ejecutar tests unitarios |
| 4 | Build | `npm run build` | Compilar para producción |

### Archivo de Workflow

Ubicación: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  ci:
    name: Lint, Type Check, Test & Build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test
        continue-on-error: true

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_KEY }}
```

## Despliegue en Vercel

### Configuración Inicial (Una sola vez)

1. Crear cuenta en Vercel y vincular con GitHub
2. Importar el repositorio ContractIA-frontend
3. Configurar el Framework Preset como "Next.js"
4. Agregar todas las variables de entorno requeridas
5. Ejecutar el primer despliegue y verificar

### Flujo de Trabajo

1. Desarrollador crea rama `feature/*` o `fix/*` desde `develop`
2. Push a GitHub genera automáticamente un **Preview Deployment**
3. Vercel proporciona URL única para pruebas del equipo
4. Tras aprobación, se hace merge a `develop` y luego a `main`
5. Push a `main` dispara **Production Deployment** automático

### Archivo vercel.json

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Configuración por Entorno en Vercel

En el dashboard de Vercel (Settings → Environment Variables):

| Entorno | Descripción |
|---------|-------------|
| **Production** | Variables para rama `main` |
| **Preview** | Variables para ramas de desarrollo |
| **Development** | Variables para desarrollo local (`vercel env pull`) |

## Estándares de Commits

### Convención de Conventional Commits

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feat:` | Nueva funcionalidad | `feat: agregar formulario de contratos` |
| `fix:` | Corrección de bugs | `fix: resolver error de timeout en chat` |
| `style:` | Cambios de formato | `style: aplicar formato consistente` |
| `docs:` | Documentación | `docs: actualizar README` |
| `refactor:` | Refactorización | `refactor: extraer lógica a hook` |
| `chore:` | Mantenimiento/CI-CD | `chore: actualizar dependencias` |
| `test:` | Tests | `test: agregar tests para api.ts` |

### Reglas del Mensaje

- Usar el imperativo (*add*, *fix*, *remove*)
- Empezar con minúscula
- No usar punto final

## Estándares de Código

### Convenciones de Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `Sidebar.tsx`, `AddContractForm.tsx` |
| Funciones/Variables | camelCase | `handleSubmit`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL`, `TIMEOUTS` |
| Archivos de página | page.tsx | `src/app/dashboard/page.tsx` |
| Tipos/Interfaces | PascalCase | `User`, `Document`, `ChatRequest` |

### Estructura de Componentes

```typescript
"use client"; // Si es Client Component

// 1. Imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 3.1 Hooks
  const router = useRouter();
  const [data, setData] = useState(null);

  // 3.2 Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 3.3 Handlers
  const handleClick = () => {
    // Logic
  };

  // 3.4 Render
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

## Instalación y Ejecución

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/contractia-frontend.git
cd contractia-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
```

## Dependencias del Proyecto

### Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 16.1.6 | Framework principal |
| react | 19.2.3 | Librería UI |
| react-dom | 19.2.3 | Renderizado DOM |
| @supabase/supabase-js | 2.100.0 | Autenticación OAuth |
| zustand | 5.0.12 | Gestión de estado |
| lucide-react | 0.577.0 | Iconos |

### Desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| typescript | 5.x | Tipado estático |
| tailwindcss | 4.x | Estilos CSS |
| eslint | 9.x | Linting |
| eslint-config-next | 16.1.6 | Reglas ESLint para Next.js |
| @types/react | 19.x | Tipos para React |
| @types/node | 20.x | Tipos para Node.js |
