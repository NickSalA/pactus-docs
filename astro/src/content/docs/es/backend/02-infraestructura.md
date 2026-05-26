---
title: Infraestructura del Backend
description: Cómo se compone la aplicación FastAPI de Pactus y qué dependencias operativas necesita para funcionar.
---

El backend de **Pactus** está construido sobre **FastAPI** y organizado por módulos de negocio. La aplicación no es un archivo monolítico que concentra toda la lógica, sino una composición de routers, servicios, repositorios y dependencias compartidas.

## Punto de Entrada de la Aplicación

La inicialización principal vive en estos archivos:

- `Pactus-Backend/src/pactus_backend/main.py`
- `Pactus-Backend/src/pactus_backend/factory.py`

`main.py` se limita a preparar logging, construir la app y ejecutar Uvicorn. La verdadera composición de la API ocurre en `factory.py`.

## Cómo se Construye la App FastAPI

La función `create()` de `factory.py` monta la aplicación FastAPI y registra los routers de cada módulo:

- documentos
- catálogo de servicios
- carpetas
- usuarios
- chatbot
- conversaciones
- integraciones
- organizaciones
- notificaciones
- plantillas

La app también registra:

- `ProxyHeadersMiddleware`
- `CORSMiddleware`
- `LoguruMiddleware`
- handlers centralizados de excepciones

## Ciclo de Vida del Backend

El backend usa un `lifespan` asíncrono para preparar dependencias que deben existir desde el arranque.

En startup se ejecutan tres tareas principales:

1. `configure_embedding()` para preparar la capa de embeddings.
2. `build_http_client()` para disponer de un cliente HTTP reutilizable.
3. `init_checkpointer()` para inicializar el pool de persistencia del agente.

En shutdown se liberan los recursos abiertos:

- cierre del cliente HTTP compartido
- cierre del pool de persistencia

## Dependencias Operativas del Sistema

La aplicación no depende solo de PostgreSQL. Su operación real necesita varias piezas externas y de infraestructura:

| Componente | Rol dentro del backend |
|------------|------------------------|
| PostgreSQL | Persistencia relacional del dominio |
| Supabase Storage | Almacenamiento de archivos documentales |
| Supabase Auth | Validación de identidad y sesión |
| Qdrant | Recuperación semántica e indexación vectorial |
| Gemini | Generación y apoyo a flujos de IA |
| Azure OpenAI / OpenAI | Modelos auxiliares y embeddings |
| LlamaParse | Extracción estructurada de documentos |
| Gmail | Envío de alertas por correo |
| Azure Key Vault | Gestión de secretos |

## Configuración Centralizada

La clase `Settings` en `shared/config.py` concentra la configuración técnica del backend. Desde ahí se resuelven, entre otros, estos grupos de parámetros:

- base de datos
- Supabase
- Google OAuth
- Qdrant
- Gemini y OpenAI
- almacenamiento
- cron
- límites de archivos

Esta centralización simplifica la operación porque evita distribuir la configuración en varios puntos del código.

## Rutas y Prefijos Reales

Aunque `Settings` define `GLOBAL_PREFIX`, la aplicación actual no lo aplica al registrar routers. Por eso, las rutas reales se montan directamente en raíz:

- `/documents`
- `/services`
- `/folders`
- `/chatbot`
- `/conversations`
- `/integrations`
- `/organizations`
- `/notifications`
- `/templates`
- `/user`

Este detalle es importante porque afecta tanto a OpenAPI como a cualquier consumidor externo de la API.

## Arquitectura Modular

Cada módulo del backend sigue, de forma general, esta separación:

- `api`: routers, dependencias HTTP y schemas
- `application`: servicios y contratos de repositorio
- `domain`: entidades, reglas y value objects
- `infrastructure`: persistencia e integraciones técnicas

Esta estructura mantiene separada la lógica de negocio de la tecnología usada para persistir o exponer datos.

## Implicancia Documental

Cuando se documenta la infraestructura del backend en este proyecto, no basta con nombrar FastAPI. También hace falta reflejar:

- cómo se compone la aplicación por módulos
- qué dependencias externas participan en tiempo de ejecución
- qué recursos se inicializan en startup
- qué piezas no están aún reflejadas correctamente en OpenAPI o en la documentación narrativa

Esa visión es la que permite que la documentación sea útil para desarrollo, despliegue y mantenimiento.
