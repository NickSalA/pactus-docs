---
title: Stack tecnológico y Jerarquía de páginas
description: Stack tecnológico y estructura de páginas del frontend de ContractIA
---

El frontend de ContractIA está construido con **Next.js 16** usando App Router.

## Stack Tecnológico

| Tecnología               | Propósito                             |
| ------------------------ | ------------------------------------- |
| Next.js                  | Framework principal con App Router    |
| React                    | Librería UI con hooks                 |
| TypeScript               | Tipado estático                       |
| Tailwind CSS             | Framework de utilidades CSS           |
| Zustand                  | Gestión de estado global              |
| Recharts                 | Visualización de datos y analítica    |
| Supabase                 | Cliente de autenticación OAuth        |
| Lucide React             | Iconografía                           |
| TanStack Query           | Gestión de estado de servidor y cache |
| React Hook Form          | Formularios reactivos                 |
| Zod                      | Validación de esquemas                |
| Motion                   | Animaciones declarativas              |
| Axios                    | Cliente HTTP                          |
| Class Variance Authority | Variantes de componentes estilizados  |

## Páginas de la Aplicación

### Rutas Públicas

| Ruta                | Descripción                                                  |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | Landing page con propuesta de valor, CTA para iniciar sesión |
| `/login`            | Autenticación OAuth con Google                               |
| `/super-admin`      | Portal para gestionar organizaciones                         |
| `/privacy-policy`   | Política de privacidad                                       |
| `/terms-of-service` | Términos de servicio                                         |
| `/auth/callback`    | Callback OAuth                                               |

### Rutas Protegidas

Requieren autenticación. La navegación y contenido se adapta según el rol del usuario.

**HR** (`/hr/`)

| Ruta            | Descripción                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `/hr/dashboard` | Panel con métricas tipo LABOR, documentos recientes, centro de alertas |
| `/hr/contracts` | Gestión de contratos                                                   |
| `/hr/templates` | Plantillas de contratos                                                |
| `/hr/ai-agent`  | Chat con agente IA                                                     |

**Manager** (`/manager/`)

| Ruta                 | Descripción                                           |
| -------------------- | ----------------------------------------------------- |
| `/manager/dashboard` | Panel con métricas tipo COMPANY, rankings, tendencias |
| `/manager/contracts` | Gestión de contratos                                  |
| `/manager/templates` | Plantillas de contratos                               |
| `/manager/ai-agent`  | Chat con agente IA                                    |

**Worker** (`/worker/`)

| Ruta                | Descripción                       |
| ------------------- | --------------------------------- |
| `/worker/dashboard` | Panel (comparte vista de Manager) |
| `/worker/contracts` | Gestión de contratos              |
| `/worker/ai-agent`  | Chat con agente IA                |

**Admin** (`/admin/`)

| Ruta                         | Descripción                                          |
| ---------------------------- | ---------------------------------------------------- |
| `/admin/access`              | Gestión de usuarios y roles                          |
| `/admin/alerts`              | Configuración de reglas de alertas                   |
| `/admin/document-management` | Gestión documental (plantillas, carpetas, servicios) |

## Flujo de Navegación

El usuario accede a la landing page (`/`), inicia sesión via OAuth (`/login`), y después del callback (`/auth/callback`) es redirigido según su rol a su dashboard correspondiente. La navegación entre páginas protegidas se realiza mediante el Sidebar, que muestra opciones adaptadas al nivel de acceso.
