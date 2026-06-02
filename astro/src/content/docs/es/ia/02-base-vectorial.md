---
title: Base Vectorial
description: Configuración de Qdrant, estrategia de embeddings y estructura de índices.
---

La base vectorial de ContractAI usa Qdrant como vector store para la búsqueda semántica de fragmentos de contratos.

## Arquitectura de Qdrant

### Colecciones

Cada organización tiene una colección de vectores indexados. Los vectores corresponden a chunks de documentos asociados a contratos de esa organización.

### Estructura de un Vector

Cada vector almacenado en Qdrant incluye:

```yaml
vector:
  dimensions: [float]  # Dependiendo del modelo de embedding (Voyage AI)
  values: [float]      # Embedding del chunk

payload:
  document_id: int           # ID del contrato padre
  file_name: string           # Nombre del archivo original
  document_type: COMPANY|LABOR # Tipo de contrato
  organization_id: int        # Organización dueña del documento
  chunk_index: int            # Posición del chunk en el documento
  page_number: int | null     # Página de origen (si aplica)
  content: string             # Texto del chunk (para debugging)
```

## Modelo de Embeddings

El sistema utiliza **Voyage AI** para generar embeddings. El modelo específico se configura en el backend mediante variables de entorno.

### Características del Embedding

- **Dimensionalidad**: Configurable según el modelo de Voyage AI seleccionado
- **Métrica de similaridad**: Coseno similarity para búsqueda de cercana semántica
- **Actualización**: Los embeddings se recalculan cuando el documento se reprocesa

## Estrategia de Chunking

### Parámetros de Chunking

| Parámetro | Descripción |
|-----------|-------------|
| `chunk_size` | Tamaño máximo de caracteres por chunk |
| `chunk_overlap` | Caracteres compartidos entre chunks consecutivos |
| `min_chunk_size` | Tamaño mínimo para crear un chunk válido |

### Criterios de Segmentación

- El chunking intenta respetar límites semánticos (párrafos, secciones)
- Cuando un párrafo excede el tamaño máximo, se fragmenta siguiendo los límites semánticos naturales
- El overlap garantiza que la información en los límites de chunks no se pierda

## Indexación y Búsqueda

### Proceso de Indexación

1. El documento se procesa y genera N chunks
2. Cada chunk se embeddea con Voyage AI
3. Los vectores se insertan en Qdrant con sus payloads
4. Qdrant actualiza el índice de la colección

### Búsqueda

```python
# Pseudocódigo del proceso de búsqueda
query_vector = embed(message)  # Voyage AI
results = qdrant.search(
    collection=organization_id,
    vector=query_vector,
    limit=top_k,
    filter={
        "must": [
            {"key": "document_type", "match": {"value": allowed_types}}
        ]
    }
)
```

### Filtrado por Rol

Los resultados de búsqueda se filtran según el rol del usuario:

| Rol | Tipos de documento permitidos |
|-----|-------------------------------|
| HR | LABOR |
| MANAGER | COMPANY |
| WORKER | COMPANY |

Esto se aplica como filtro en la query de Qdrant antes de recuperar resultados.

## Pipeline Completo de Búsqueda

```
Usuario pregunta
     │
     ▼
Embedding del query (Voyage AI)
     │
     ▼
Búsqueda en Qdrant con filtro de rol
     │
     ▼
Top-K resultados ordenados por similitud
     │
     ▼
Chunks devueltos al agente LangGraph
```

## Consideraciones de Rendimiento

- **Pool de conexiones**: Qdrant usa un pool configurable de conexiones
- **Índices**: Qdrant mantiene índices sobre los payloads para filtrado eficiente
- **Cache**: El backend puede usar cache en memoria para queries frecuentes

## Ver también

- [Pipeline RAG](./01-pipeline-rag.md) — Flujo completo de ingestión y retrieval
- [Agente LangGraph](./03-agente-langgraph.md) — Cómo la base vectorial alimenta al agente