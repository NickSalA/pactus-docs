---
title: Base Vectorial
description: Configuración y uso de Qdrant como base vectorial en ContractIA.
---

ContractIA usa **Qdrant** como base de datos vectorial para el retrieval semántico del chatbot. Los vectores almacenan fragmentos de contratos indexados, permitiendo consultas por similitud de significado.

## Configuración

Qdrant se configura vía variables de entorno en `shared/config.py`:

| Variable | Descripción |
|----------|-------------|
| `QDRANT_URL` | URL del cluster Qdrant |
| `QDRANT_API_KEY` | Clave de autenticación |
| `INDEX_NAME` | Collection para contratos (`contracts_index`) |
| `DRIVE_INDEX_NAME` | Collection para Drive (`drive_contracts_index`) |

## Colecciones

### contracts_index

Almacena fragmentos de contratos documentales subidos directamente al sistema.

**Esquema del payload**:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `filename` | string | Nombre del archivo original |
| `document_id` | integer | ID del documento en la base de datos |
| `organization_id` | integer | ID de la organización propietaria |
| `source_provider` | string | `"contractai"` o `"google_drive"` |
| `source_file_id` | string | Identificador en el sistema de origen |

**Índice vectorial**:
- Dimensión: 1536
- Métrica de distancia: COSINE
- Motor: Qdrant HNSW

### drive_contracts_index

Colección separada para contratos importados desde Google Drive. Mismo esquema de payload pero con `source_provider = "google_drive"`.

## Flujo de Indexación

```
PDF → LlamaParse (markdown)
    → SentenceWindowNodeParser (window=3)
    → MetadataEnricher (org_id, source)
    → Qdrant.add_vectors()
```

Antes de re-indexar, se eliminan los vectores existentes del documento para evitar duplicados.

## Retrieval

El repositorio vectorial del chatbot (`qdrant_repo.py`) ejecuta:

1. **Búsqueda por similitud** en ambas colecciones (`INDEX_NAME`, `DRIVE_INDEX_NAME`)
2. **Filtrado por organización** — todo retrieval está aislado por `organization_id`
3. **Filtrado opcional por documento** — cuando se especifican `document_ids`
4. **Post-procesamiento** con `MetadataReplacementPostProcessor` — inyecta metadatos del documento en el texto recuperado
5. **Ordenamiento por score** de relevancia

**Formato de salida**:
```
[Fuente: contrato_ejemplo.pdf | Documento: 42]
Primer párrafo del contenido extraído del contrato...
```

## Adaptador LangGraph

El chatbot usa `LangGraphLLMAdapter` (`adapter.py`) que envuelve el `CompiledStateGraph` de LangGraph para integrarse con FastAPI. Este adaptador:

- Maneja la invocación del grafo con el estado inicial
- Injecta el `user_context` en cada llamada
- Gestiona la serialización de mensajes

## Detección de Estado Documental

El `contracts_query_tool` reconoce estos estados en español e inglés:

| Estado | Palabras clave |
|--------|---------------|
| `PENDING_SIGNATURE` | "pendiente de firma", "por firmar", "pending signature" |
| `EXPIRING_SOON` | "por vencer", "expira(n) pronto", "expiring soon" |
| `EXPIRED` | "vencido", "expirado", "expired" |
| `TERMINATED` | "terminado", "resuelto", "terminated" |
| `DRAFT` | "borrador", "draft" |
| `ACTIVE` | "active", "vigente" |

## Notas de Implementación

- El modelo de embedding actual es `text-embedding-3-small` de OpenAI
- Existe migración planeada hacia Voyage AI (comentado en código como `voyage-3` cuando esté disponible públicamente)
- Qdrant se usa tanto para retrieval de contratos como para búsqueda en archivos de Google Drive
- El checkpointer de PostgreSQL permite que cada conversación tenga historial independiente