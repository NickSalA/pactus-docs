---
title: Definición del Producto y Alcance
description: Resumen detallado de ContractIA, objetivos, AQT y funcionalidades técnicas.
---

**ContractIA** es una plataforma integral de gestión y análisis legal diseñada para automatizar el ciclo de vida de los contratos mediante Inteligencia Artificial avanzada. El sistema permite desde la ingesta de documentos hasta el análisis interactivo y la generación automática de contratos basados en estándares organizacionales.

## Arquitectura de Calidad Técnica (AQT)

La **Arquitectura de Calidad Técnica (AQT)** define los pilares fundamentales que garantizan la robustez y efectividad del sistema. Estos atributos de calidad guían cada decisión técnica en el desarrollo de ContractIA:

1. **Precisión Legal (RAG):** Garantizar que las respuestas del agente de IA estén fundamentadas estrictamente en el contenido de los contratos cargados, evitando alucinaciones mediante técnicas de *Retrieval-Augmented Generation*.
2. **Seguridad Basada en Identidad:** Integración con **Supabase Auth** y **Google OAuth** para una gestión de identidades moderna y segura, delegando la autenticación compleja a proveedores especializados.
3. **Aislamiento por Organización (Multi-tenancy):** Arquitectura diseñada para separar estrictamente los datos entre diferentes empresas o departamentos mediante un identificador único de organización (`organization_id`).
4. **Escalabilidad Horizontal:** Capacidad de procesar grandes volúmenes de documentos de forma asíncrona y manejar múltiples sesiones conversacionales concurrentes mediante una arquitectura stateless.
5. **Interoperabilidad:** Diseño basado en microservicios con contratos de API claros (FastAPI/OpenAPI) para facilitar la integración con otros sistemas empresariales y nubes de almacenamiento.

## Funcionalidades y Features Detalladas

ContractIA se articula en torno a los siguientes módulos funcionales, soportados por una infraestructura backend especializada:

### 1. Agente IA y Flujo Conversacional

Un asistente virtual avanzado orquestado con **LangGraph** que permite una interacción profunda con los documentos:

* **Memoria de Conversación Persistente:** Gestión de hilos de chat almacenados en PostgreSQL, permitiendo retomar consultas previas dentro del contexto de la organización.
* **Razonamiento Inteligente:** Capacidad de decidir cuándo buscar información en los contratos (RAG) para responder preguntas legales específicas.
* **Streaming de Respuestas:** Visualización en tiempo real de la generación de texto para una experiencia de usuario fluida.

### 2. Gestión Documental e Ingesta Inteligente

Módulo centralizado para la administración del conocimiento legal:

* **Parsing de Alta Fidelidad:** Conversión de PDFs complejos (con tablas y jerarquías) a Markdown estructurado mediante **LlamaParse**.
* **Indexación Vectorial:** Fragmentación semántica y almacenamiento de vectores en **Qdrant Cloud** para búsquedas semánticas.
* **Propiedad Organizacional:** Cada documento pertenece a una organización, garantizando que el conocimiento legal no se cruce entre distintos clientes.

### 3. Integración con Nube (Google Drive)

Capacidad de importar documentos directamente desde el almacenamiento en la nube:

* **Conectividad con Google Drive:** Integración nativa para listar, seleccionar e importar contratos directamente desde carpetas de Drive.
* **Sincronización de Archivos:** Flujo de importación que descarga y procesa automáticamente los documentos seleccionados para integrarlos al pipeline de IA.
* **OAuth2 Cloud Integration:** Gestión segura de tokens de acceso para la lectura de documentos en la nube.

### 4. Generación Automática de Contratos

Módulo especializado en la creación de nuevos documentos legales basados en el conocimiento de la organización:

* **Motor de Generación:** Creación de contratos en formato PDF a partir de plantillas predefinidas y datos dinámicos.
* **Relleno Inteligente de Datos:** Integración automática de datos de la organización y formularios de usuario para personalizar cada contrato.
* **Consistencia Legal:** Uso de plantillas aprobadas por la organización para garantizar que todos los contratos generados cumplan con los estándares internos.

### 5. Estructura de Organizaciones y Usuarios

Gestión de acceso basada en la pertenencia a una entidad corporativa:

* **Multi-tenancy Nativo:** El sistema está diseñado para que todos los recursos (documentos, chats, plantillas) estén aislados por organización.
* **Auth via Supabase/Google:** Los usuarios acceden mediante Google Auth a través de Supabase, simplificando el flujo de entrada y mejorando la seguridad.
* **Perfil de Usuario (`/user/me`):** Identificación automática de la organización del usuario al momento de la conexión para cargar su entorno específico.
