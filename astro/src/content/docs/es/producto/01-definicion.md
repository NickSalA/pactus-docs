---
title: Definición del Producto
description: Resumen detallado de Pactus, objetivos, AQT y funcionalidades técnicas.
---

**Pactus** es una plataforma integral de gestión y análisis legal diseñada para automatizar el ciclo de vida de los contratos mediante Inteligencia Artificial avanzada. El sistema permite desde la ingesta de documentos hasta el análisis interactivo y la generación automática de contratos basados en estándares organizacionales.

## Arquitectura de Calidad Técnica (AQT)

La **Arquitectura de Calidad Técnica (AQT)** define los pilares fundamentales que garantizan la robustez y efectividad del sistema:

| Atributo | Descripción |
|----------|-------------|
| **Precisión Legal (RAG)** | Garantizar que las respuestas del agente de IA estén fundamentadas estrictamente en el contenido de los contratos cargados, evitando alucinaciones mediante técnicas de *Retrieval-Augmented Generation* |
| **Seguridad Basada en Identidad** | Integración con **Supabase Auth** y **Google OAuth** para gestión moderna y segura de identidades |
| **Aislamiento por Organización (Multi-tenancy)** | Arquitectura diseñada para separar estrictamente los datos entre diferentes empresas mediante un identificador único de organización (`organization_id`) |
| **Escalabilidad Horizontal** | Capacidad de procesar grandes volúmenes de documentos de forma asíncrona y manejar múltiples sesiones concurrentes mediante arquitectura stateless |
| **Interoperabilidad** | Diseño basado en microservicios con contratos de API claros (FastAPI/OpenAPI) para facilitar la integración con sistemas empresariales y nubes de almacenamiento |

## Stack Tecnológico

Pactus utiliza las siguientes tecnologías en sus componentes principales:

| Componente | Tecnología |
|------------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Zustand, Tailwind CSS |
| **Backend** | FastAPI (Python), Pydantic, SQLAlchemy |
| **Base de Datos** | PostgreSQL (Supabase), Qdrant Cloud (vectores) |
| **IA y Procesamiento** | Gemini, LlamaParser, LangGraph, Voyage AI Embeddings |
| **Almacenamiento** | Supabase Storage, Google Drive API |
| **Autenticación** | Supabase Auth, JWT |

## Funcionalidades Principales

Pactus se articula en torno a los siguientes módulos funcionales:

### Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel principal con métricas, documentos recientes y acciones rápidas |
| **Gestión de Contratos** | CRUD completo de contratos con estados, carpetas y importación desde Google Drive |
| **Agente IA** | Chatbot conversacional basado en LangGraph con acceso al contenido de los contratos |
| **Plantillas** | Gestión de plantillas con campos dinámicos y generación de PDF |
| **Administración** | Gestión de usuarios, alertas, servicios y carpetas organizacionales |

### Tecnologías de IA

| Componente | Función |
|------------|---------|
| **RAG Pipeline** | Recuperación de información relevante desde contratos para fundamentar las respuestas del agente |
| **Agente LangGraph** | Orquestación del flujo conversacional con herramientas de búsqueda y decisión |
| **Extracción Estructurada** | Uso de Gemini para extraer información de contratos (cliente, fechas, montos, servicios) |
| **Generación de Contratos** | Creación de borradores y documentos finales mediante IA generativa |

## Roles y Permisos

El sistema implementa un control de acceso basado en roles:

| Rol | Descripción |
|-----|-------------|
| **ADMIN** | Acceso completo a todos los módulos, gestión de usuarios y configuraciones de la organización |
| **MANAGER** | Gestión de contratos de tipo empresarial (COMPANY), acceso a carpetas designadas |
| **WORKER** | Acceso a contratos de tipo empresarial (COMPANY) y funcionalidades básicas del sistema |

Cada rol tiene carpetas asignadas y políticas de acceso específicas para garantizar el aislamiento de la información. Los contratos se filtran por tipo según el rol del usuario: ADMIN y MANAGER acceden a COMPANY, mientras que WORKER accede a COMPANY.
