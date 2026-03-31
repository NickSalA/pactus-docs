---
title: Metodología y Estándares
description: Reglas de arquitectura, organización de código y convenciones para ContractIA
---

Para asegurar que **ContractIA** sea un proyecto escalable, mantenible y colaborativo, se establecen directrices estrictas sobre la metodología de trabajo, la organización del código y las convenciones de desarrollo.

## Metodología de Trabajo

El ciclo de vida del desarrollo se rige bajo el marco de trabajo **Scrum**, apoyado por **ClickUp** para la gestión de tickets y sprints, y sincronización de equipo mediante **Reuniones Diarias (Dailys)**.
A nivel de ingeniería, el proyecto se respalda en la redacción de este **SDD (Software Design Description)** y se promueve el uso de **TDD (Test-Driven Development)** para garantizar la fiabilidad del código.

## Arquitectura y Estructura de Directorios

El sistema se concibe como un **Monolito Modular**, enfocado en la separación estricta de funciones tanto en el servidor como en el cliente.

### Backend: Arquitectura Cebolla (Onion Architecture)

El sistema implementa una **Arquitectura Cebolla (Onion Architecture)** modularizada. El principio fundamental es la **Regla de Dependencia**, donde las capas externas pueden depender de las capas internas, pero las internas nunca conocen nada de las externas. Esto garantiza que el núcleo de negocio sea independiente de frameworks, bases de datos o servicios externos.

El proyecto se organiza en capas concéntricas que se replican dentro de cada módulo funcional:

* **Domain (Dominio):** El centro de la cebolla. Contiene las entidades puras, interfaces (contratos) y lógica de negocio central. Es código Python puro sin dependencias externas.
* **Application (Aplicación):** Envuelve al dominio y define los casos de uso. Aquí reside la orquestación (como los flujos de LangGraph) y la lógica de los servicios que coordinan el dominio.
* **Infrastructure (Infraestructura):** Implementa las interfaces definidas en el dominio. Aquí se encuentran los adaptadores reales para PostgreSQL (SQLModel), Qdrant, y clientes de servicios como Gemini o LlamaParse.
* **API / Presentation:** La capa más externa. Contiene los *routers* de FastAPI, esquemas de validación de entrada/salida y manejo de peticiones HTTP.

```text
/
├── pyproject.toml
├── src/
│   └── contractai_backend/
│       ├── core/                 # Componentes transversales del sistema
│       │   ├── domain/           # Entidades base y excepciones core
│       │   ├── application/      # Lógica transversal
│       │   └── infrastructure/   # Implementaciones base
│       ├── shared/               # Configuración global, logger y utilidades
│       └── modules/              # Módulos de negocio aislados
│           └── <modulo>/         # Ejemplo: chatbot, documents, users
│               ├── domain/       # Entidades e interfaces del módulo
│               ├── application/  # Casos de uso y servicios de aplicación
│               ├── infrastructure/# Adaptadores (DB, clientes externos)
│               └── api/          # Routers de FastAPI y Schemas
└── tests/                        # Pruebas unitarias e integración por módulo
```

### Frontend: Patrón de Separación de Lógica (Next.js)

El cliente delega la lógica de estado y peticiones de red a una capa de servicios centralizada, manteniendo a los componentes enfocados en la UI.

```text
/
src/
├── lib/
│   └── api.ts              # Cliente API centralizado
├── types/
│   └── api.types.ts        # Tipos TypeScript
└── hooks/
    ├── useAuth.ts          # Hook para autenticación
    ├── useUser.ts          # Hook para usuarios
    ├── useChat.ts          # Hook para chatbot
    ├── useConversations.ts # Hook para conversaciones
    └── useDocuments.ts     # Hook para documentos
```

## Estándares de Código (Clean Code)

Para mantener la uniformidad, el rendimiento y la reproducibilidad en el repositorio, el backend adopta las herramientas más modernas del ecosistema Python:

* **Gestión de Dependencias y Build:** Se utiliza **`uv`** (y su sistema `uv_build`) como gestor de paquetes ultrarrápido. Toda la configuración del proyecto, dependencias y scripts de ejecución vivirán centralizados en el archivo estándar `pyproject.toml`.
* **Linter y Formateador:** Se descarta Pylint en favor de **Ruff**. Al estar escrito en Rust, centraliza el análisis estático, el formateo de código y el ordenamiento de importaciones de manera casi instantánea, incluyendo las reglas estrictas de Pylint (`PL`) y manejo de errores (`E`, `F`).
* **Idioma:** El idioma predeterminado del código fuente es el **Inglés** (variables, funciones, clases).
* **Convenciones de Nomenclatura:**
  * `PascalCase`: Obligatorio para Clases.
  * `snake_case`: Obligatorio para Variables y Funciones.
  * `UPPER_CASE`: Obligatorio para Constantes.
* **Diseño de APIs:** Se utilizará Swagger mediante archivos `.yaml` para definir los contratos de comunicación entre frontend y backend.

## Estándares de Commits y Versionado Semántico

Para garantizar un historial limpio y facilitar el seguimiento de cambios, el proyecto adopta la convención de **Conventional Commits**. Esto permite estandarizar los mensajes de commit y entender rápidamente el impacto de cada cambio en el sistema.

### Reglas de Nomenclatura

**1. Prefijos Permitidos:**
Los prefijos definen la intención del cambio y ayudan a determinar la evolución de la versión del software (SemVer):

* `fix:` Corrección de errores (equivale a un parche).
* `feat:` Nueva funcionalidad (equivale a una versión minor).
* `feat!:` Cambio importante que rompe la compatibilidad (equivale a una versión major).
* `style:` Cambios en el formato o estilo del código (no afecta la lógica).
* `docs:` Cambios en la documentación.
* `refactor:` Mejora interna del código sin cambiar su comportamiento externo.
* `chore:` Tareas de mantenimiento, dependencias o herramientas de desarrollo.
* `ci:` Cambios en la configuración de integración y despliegue continuo.
* `test:` Adición o modificación de pruebas.

**2. Asunto del Commit:**
El mensaje debe seguir estas pautas:

* Usa el imperativo (*add*, *fix*, *remove*).
* Empieza con minúscula.
* No tiene punto final.

## Estándar de Reporte de Logs

La trazabilidad del sistema en producción es vital. Todo log emitido por el backend debe seguir estrictamente la siguiente estructura unificada:

**Formato:**
`[NIVEL] YYYY-MM-DD HH:MM:SS [ID_PETICION] [METODO /RUTA] [uid:USUARIO] -> MENSAJE [ESTADO]`

**Ejemplo de implementación:**
`[INFO] 2026-03-20 14:30:05 [req-a1b2] [POST /contratos] [uid:notario_admin] -> Nuevo contrato registrado: Compraventa Inmueble [STATUS: SUCCESS]`
