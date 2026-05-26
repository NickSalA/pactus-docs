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

**Archivo de configuración secreta local:**
Para que el sistema funcione en la computadora de un desarrollador, este necesita crear un archivo especial (invisible) que contenga las "llaves maestras" de la plataforma. Este archivo incluye las direcciones exactas para conectarse al servidor local de datos, las credenciales de seguridad únicas del proyecto en Supabase, y los permisos de Google necesarios para que el botón de "Iniciar sesión con Google" funcione correctamente durante las pruebas. 

### Variables por Entorno

| Entorno | NEXT_PUBLIC_API_URL | Descripción |
|---------|---------------------|-------------|
| Development | `http://localhost:8000` | Desarrollo local |
| Preview | `https://api-preview.contractia.railway.app` | Ramas feature/fix |
| Production | `https://api.contractia.railway.app` | Rama main |

## Scripts de Desarrollo

### package.json

**El menú de comandos del proyecto:**
Este archivo es como la "caja de herramientas" principal. Define cómo se llama nuestra aplicación (`contractia-frontend`) y contiene accesos directos (scripts) para que los desarrolladores no tengan que memorizar instrucciones largas. Incluye comandos para encender el servidor de prueba, para empaquetar la aplicación cuando está lista, para revisar que el código esté limpio y sin errores ortográficos, y para correr simulacros automáticos que prueban que todo funcione.

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

**El Robot de Inspección de Código:**
Este archivo contiene las instrucciones para un robot automático (GitHub Actions). Cada vez que un programador intenta enviar código nuevo a la plataforma principal, el robot se despierta y hace lo siguiente paso a paso:
1. Crea un entorno de computadora virtual (usando Ubuntu).
2. Descarga todo el código propuesto.
3. Le pasa un corrector ortográfico y de estilo (Linter) para asegurar que se sigan las reglas de la empresa.
4. Verifica que no haya cruce de información incorrecta (Type check).
5. Ejecuta los exámenes automáticos para asegurar que no se haya roto nada (Tests).
6. Finalmente, intenta armar la aplicación por completo (Build). Si el robot no puede armarla, bloquea la subida del código para proteger la plataforma en vivo.

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

**Reglas de alojamiento del servidor:**
Este archivo le dice a Vercel (nuestro proveedor de alojamiento en la nube) exactamente cómo debe tratar nuestra página. Le indica qué comando usar para construirla, define que el centro de datos principal debe estar en la región `iad1` (Este de Estados Unidos, para mejor latencia) y le pone una regla estricta a la memoria caché: le prohíbe explícitamente guardar copias antiguas de los datos de la API, asegurando que cuando el usuario entra, siempre vea su información en tiempo real.

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
| Componentes | PascalCase | `Sidebar.tsx`, `DashboardAreaChart.tsx` |
| Funciones/Variables | camelCase | `handleSubmit`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL`, `TIMEOUTS` |
| Archivos de página | page.tsx | `src/app/(main)/dashboard/manager/page.tsx` |
| Tipos/Interfaces | PascalCase | `User`, `AreaChartResponse`, `Template` |

### Estructura de Componentes

**El molde universal para crear pantallas:**
Para mantener el orden, cada pieza visual (como un botón o una tabla) debe construirse siguiendo una receta estricta de 4 pasos:
1. **Importaciones:** Se piden prestadas las herramientas externas que se van a usar.
2. **Definiciones:** Se declara qué información necesita esta pieza para funcionar (por ejemplo, "necesito que me des un título").
3. **Lógica e Inteligencia:** Se configuran las memorias temporales, los efectos automáticos y qué pasa cuando el usuario hace clic.
4. **Dibujo (Renderizado):** Finalmente, se entrega el resultado visual final que el usuario verá en su pantalla.

## Instalación y Ejecución

**Guía de arranque para nuevos programadores:**
El proceso manual para que un desarrollador nuevo instale la plataforma en su computadora consta de cuatro pasos básicos:
1. Descargar (clonar) todo el código desde el repositorio oficial a su computadora.
2. Instalar automáticamente todas las herramientas y bibliotecas de terceros que el proyecto necesita para existir.
3. Crear y rellenar su archivo de seguridad local (`.env.local`) con las contraseñas secretas proporcionadas por el líder técnico.
4. Encender el motor de desarrollo, lo cual levantará una versión privada de la plataforma que podrá ver abriendo su navegador de internet.

## Dependencias del Proyecto

### Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 16.1.6 | Framework principal |
| react | 19.2.3 | Librería UI |
| react-dom | 19.2.3 | Renderizado DOM |
| @supabase/supabase-js | 2.100.0 | Autenticación OAuth |
| zustand | 5.0.12 | Gestión de estado |
| recharts | 3.8.1 | Visualización de datos y analítica |
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