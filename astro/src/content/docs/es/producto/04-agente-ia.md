---
title: Agente IA
description: Chatbot conversacional basado en LangGraph para interactuar con el contenido de los contratos.
---

El **Agente IA** es el módulo de inteligencia artificial de Pactus. Permite a los usuarios realizar preguntas en lenguaje natural sobre el contenido de sus contratos y recibir respuestas fundamentadas mediante técnicas de Retrieval-Augmented Generation (RAG).

## Arquitectura del Agente

El agente está orquestado mediante **LangGraph** con tres agentes especializados:

```
START → a1_context → a2_permissions → a3_conversation → (tools loop) → n3_final_response
```

| Agente | Propósito |
|--------|-----------|
| **A1: Context** | Clasifica si el mensaje es contractual o respuesta inmediata |
| **A2: Permissions** | Valida acceso según rol y resuelve contratos por nombre |
| **A3: Conversation** | Genera respuestas usando herramientas de consulta y RAG |

LangGraph permite:

| Componente | Función |
|------------|---------|
| **Gestión de Estado** | Mantiene el contexto de la conversación |
| **Nodos de Decisión** | Determina cuándo buscar información vs responder directamente |
| **Herramientas** | Acceso a búsqueda vectorial y documentos |
| **Memoria Persistente** | Almacenamiento del historial en PostgreSQL |

## Flujo de Funcionamiento

```
Usuario → Prompt → Agente LangGraph
                      ↓
              ┌───────────────┐
              ↓               ↓
        ¿Buscar RAG?    ¿Respuesta directa?
              ↓               ↓
     Query Vectorial    Generar Respuesta
              ↓               ↓
     Contexto + Historial → Gemini → Respuesta
```

### Pasos del Flujo

1. **Recepción del Prompt**: El usuario envía una pregunta
2. **Decisión**: El agente decide si necesita buscar información
3. **Recuperación**: Búsqueda en Qdrant de chunks relevantes
4. **Generación**: Gemini genera respuesta fundamentada
5. **Streaming**: La respuesta se muestra en tiempo real

## Herramientas del Agente

| Herramienta | Descripción |
|-------------|-------------|
| **bc_tool** | Búsqueda vectorial en contratos (contenido textual, cláusulas, firmantes) |
| **company_contracts_query_tool** | Consultas estructuradas para contratos COMPANY (count, list, ranking, services_ranking, client_services_ranking) |
| **labor_contracts_query_tool** | Consultas estructuradas para contratos LABOR (count, list; NO ranking) |
| **dashboard_chart_tool** | Generación de gráficos de dashboard (top_services, top_companies, loyalty, retention, origin) |
| **party_lookup_tool** | Resolución de contratos por nombre de contraparte (solo agente A2) |

Para el detalle completo de parámetros y reglas de selección, ver [Prompts y Tools](../ia/03-prompts-tools.md).

## Control de Acceso por Rol

El agente filtra el acceso a documentos según el rol del usuario:

| Rol | Acceso a Documentos |
|-----|---------------------|
| **HR** | Solo documentos LABOR |
| **MANAGER** | Solo documentos COMPANY |
| **WORKER** | Solo documentos COMPANY |

Para más detalle, ver [Agente LangGraph](../ia/03-agente-langgraph.md) y [Prompts y Tools](../ia/03-prompts-tools.md).

## Historial de Conversaciones

| Característica | Descripción |
|----------------|-------------|
| **Persistencia** | Historial almacenado en PostgreSQL |
| **Hilos de Conversación** | Múltiples hilos por organización |
| **Carga de Conversaciones** | Recuperar conversaciones anteriores |
| **Nueva Conversación** | Iniciar hilo limpio |

## Interfaz del Chat

### Sidebar de Historial

| Elemento | Descripción |
|----------|-------------|
| **Lista de Conversaciones** | Hilos anteriores de la organización |
| **Selección** | Cargar una conversación previa |
| **Nueva Conversación** | Botón para iniciar hilo limpio |

### Área de Mensajes

| Elemento | Descripción |
|----------|-------------|
| **Mensaje del Usuario** | Preguntas y comandos |
| **Mensaje del Bot** | Respuestas con Markdown renderizado |
| **Timestamps** | Hora de cada mensaje |
| **Citations** | Referencias a los documentos fuente |

### Composer

| Característica | Descripción |
|----------------|-------------|
| **Input Multilínea** | Campo de texto expansible |
| **Envío con Enter** | Enviar con tecla Enter |
| **Nueva Línea con Shift+Enter** | Permite saltos de línea en el mensaje |
| **Estado de Carga** | Indicador mientras se genera respuesta |

## Pipeline RAG

El sistema de recuperación de información funciona de la siguiente manera:

### 1. Ingesta de Documentos

| Paso | Descripción |
|------|-------------|
| **Parsing PDF** | LlamaParse convierte PDF a Markdown |
| **Chunking** | Fragmentación semántica del texto |
| **Embedding** | Voyage AI genera vectores de los chunks |
| **Indexación** | Almacenamiento en Qdrant con metadatos |

### 2. Búsqueda Semántica

| Paso | Descripción |
|------|-------------|
| **Query Embedding** | Convertir pregunta a vector |
| **Búsqueda Top-K** | Recuperar los K chunks más similares |
| **Filtrado por Rol** | Eliminar documentos no permitidos |
| **Reranking** | Ordenar por relevancia |

### 3. Generación de Respuesta

| Paso | Descripción |
|------|-------------|
| **Prompt Assembly** | Combinar historial + contexto + pregunta |
| **LLM Call** | Envío a Gemini |
| **Streaming** | Respuesta en tiempo real |
| **Citations** | Incluir referencias a fuentes |

## Características Avanzadas

### Evitación de Alucinaciones

| Técnica | Descripción |
|---------|-------------|
| **Fundamentación RAG** | Las respuestas siempre se basan en chunks recuperados |
| **Fallback** | Si no hay contexto relevante, el agente indica que no tiene información |
| **Metadatos de Fuente** | Se indica de qué documento proviene la información |

### Streaming de Respuestas

La interfaz muestra la respuesta del agente en tiempo real conforme se genera, proporcionando una experiencia de usuario fluida e inmediata.

### memoria Conversacional

El agente mantiene contexto a través de múltiples intercambios, permitiendo:

- Referenciar información de mensajes anteriores
- Seguir hilos de conversación complejos
- Mantener coherencia en respuestas largas