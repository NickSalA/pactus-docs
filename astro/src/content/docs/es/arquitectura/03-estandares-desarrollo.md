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

### Backend: Arquitectura Hexagonal (FastAPI)

El principio fundamental es que la lógica de negocio no debe depender de ningún framework externo, base de datos o API de terceros. La comunicación entre capas se realiza mediante inyección de dependencias.

El proyecto se dividirá en tres capas principales:

* **Domain (Dominio):** Contiene las entidades puras del sistema y las interfaces (contratos). Aquí vivirán los modelos base de Pydantic y las clases de SQLModel que representan los conceptos centrales (Usuario, Contrato, Chat). No importa librerías externas.
* **Application (Aplicación):** Contiene los casos de uso y la lógica de negocio. Aquí es donde reside la orquestación del agente de LangGraph y los flujos de "Preguntar al Contrato" o "Procesar PDF".
* **Infrastructure (Infraestructura):** Es la capa más externa. Contiene los adaptadores que conectan la aplicación con el mundo real:

  * **Controladores:** Los *Routers* de FastAPI (`/api/v1/chat`).
  * **Repositorios:** La conexión real a PostgreSQL y las consultas SQLModel.
  * **Servicios Externos:** Los clientes para conectarse a LlamaParse, Voyage AI, Qdrant y la API de Gemini.

```text
/
└── src/
    ├── core/                 # Configuraciones globales y variables de entorno
    ├── shared/               # Utilidades compartidas y helpers genéricos
    └── modules/
    │   └── users/
    │       ├── domain/           # Entidades y Modelos (Pydantic / SQLModel base)
    │       │   ├── models/           
    │       │   └── interfaces/       
    │       ├── application/      # Lógica de Negocio y Casos de Uso
    │       │   ├── use_cases/        
    │       │   └── agent/        # Orquestación de LangGraph (Nodos, Grafo)
    │       ├── infrastructure/   # Adaptadores Externos
    │       │   ├── database/     # Configuración de PostgreSQL y Qdrant
    │       │   └── services/     # Clientes de IA (Gemini, LlamaParse, Voyage AI)
    │       └─── api/              # Routers de FastAPI y Dependencias
    └── main.py           # Punto de entrada de FastAPI
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

Para mantener la uniformidad en el repositorio, se utilizará **Pylint** como linter principal en el backend y se aplicarán las siguientes convenciones:

* **Idioma:** El idioma predeterminado del código fuente es el **Inglés** (variables, funciones, clases).
* **Convenciones de Nomenclatura:**
  * `PascalCase`: Obligatorio para Clases.
  * `snake_case`: Obligatorio para Variables y Funciones.
  * `UPPER_CASE`: Obligatorio para Constantes.
* **Diseño de APIs:** Se utilizará Swagger mediante archivos `.yaml` para definir los contratos de comunicación entre frontend y backend.

## Estándares de Commits y Versionado Semántico

Se adopta la convención de **Conventional Commits**, vinculada directamente a la evolución de la versión del software:

* `fix:` Aumenta la versión en `0.0.1` (Corrección de bugs).
* `feat:` Aumenta la versión en `0.1.0` (Nueva funcionalidad).
* `feat!:` Aumenta la versión a `1.0.0` (Cambio de arquitectura que rompe la compatibilidad).
* `style:` Cambios en el formato o estilo del código (no afecta la lógica).
* `docs:` Cambios en la documentación (ej. actualización del SDD).
* `refactor:` Refactorización del código (mejora interna sin agregar/quitar funcionalidad).
* `chore:` Tareas relacionadas a CI/CD, dependencias o mantenimiento.
* `test:` Alteraciones o adición de pruebas.

## Estándar de Reporte de Logs

La trazabilidad del sistema en producción es vital. Todo log emitido por el backend debe seguir estrictamente la siguiente estructura unificada:

**Formato:**
`[NIVEL] YYYY-MM-DD HH:MM:SS [ID_PETICION] [METODO /RUTA] [uid:USUARIO] -> MENSAJE [ESTADO]`

**Ejemplo de implementación:**
`[INFO] 2026-03-20 14:30:05 [req-a1b2] [POST /contratos] [uid:notario_admin] -> Nuevo contrato registrado: Compraventa Inmueble [STATUS: SUCCESS]`
