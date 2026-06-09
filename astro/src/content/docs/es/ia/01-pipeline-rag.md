---
title: Pipeline RAG
description: Retrieval-Augmented Generation para análisis de contratos corporativos.
---

El sistema de Pactus utiliza un pipeline de Retrieval-Augmented Generation (RAG) para responder preguntas sobre contratos corporativos con evidencia textual grounding.

## Flujo del Pipeline

```
Documento PDF
     │
     ▼
┌─────────────┐
│  LlamaParse │  ─── Extracción de texto estructurado desde PDFs
└─────────────┘
     │
     ▼
┌─────────────┐
│  Chunking   │  ─── Segmentación en fragmentos semánticos
└─────────────┘
     │
     ▼
┌─────────────┐
│   Voyage AI │  ─── Generación de embeddings vectoriales
└─────────────┘
     │
     ▼
┌─────────────┐
│   Qdrant    │  ─── Indexación y almacenamiento vectorial
└─────────────┘
```

## Ingestión de Documentos

El proceso de ingestión transforma documentos PDF en chunks indexados:

1. **Lectura**: LlamaParse extrae el contenido textual del PDF, preservando estructura (headers, listas, tablas).
2. **Chunking**: El texto se segmenta en chunks de tamaño configurable con overlap entre segmentos para mantener contexto en los límites.
3. **Embedding**: Cada chunk se convierte en un vector de dimensiones fijas mediante el modelo de Voyage AI.
4. **Indexación**: Los vectores se almacenan en Qdrant junto con metadatos del documento (document_id, file_name, page_number, etc.).

## Búsqueda Semántica

Cuando el agente necesita información contractual:

1. **Query embedding**: El mensaje del usuario se convierte en vector usando el mismo modelo de Voyage AI.
2. **Top-K retrieval**: Qdrant devuelve los K chunks más similares usando búsqueda vectorial con filtrado por similitud coseno.
3. **Filtrado por rol**: Los resultados se filtran según los tipos de documento permitidos para el rol del usuario (COMPANY o LABOR).
4. **Reranking**: Opcionalmente, los resultados pueden reordenarse mediante un modelo de reranking para mejorar relevancia.

## Generación con Contexto

El agente conversacional (A3) recibe:
- Historial de mensajes de la conversación
- Contexto de permisos del usuario
- Los chunks recuperados como evidencia

El LLM genera una respuesta grounded en la evidencia recuperada, citándo las fuentes cuando corresponde.

## Prevención de Alucinación

El pipeline implementa safeguards contra respuestas inventadas:

- **Grounded responses**: El agente está instruido a responder solo con información soporteada por los chunks retrieved.
- **Fallback mechanism**: Si la búsqueda no devuelve resultados relevantes, el agente responde con un mensaje de falta de información.
- **Source metadata**: Cada chunk recuperado incluye metadatos que permiten al agente citar el documento y sección de origen.
- **Verification step**: El agente verifica que la información solicitada coincida con la evidencia recuperada antes de responder.

## Componentes

| Componente | Tecnología | Rol |
|------------|------------|-----|
| Parser | LlamaParse | Extracción de PDF a texto estructurado |
| Embeddings | Voyage AI | Conversión de texto a vectores |
| Vector store | Qdrant | Almacenamiento y búsqueda vectorial |
| LLM | Gemini | Generación de respuestas |

## Ver también

- [Base Vectorial](./02-base-vectorial.md) — Detalles de Qdrant y estrategia de embeddings
- [Agente LangGraph](./03-agente-langgraph.md) — Cómo el agente usa RAG dentro del flujo de LangGraph