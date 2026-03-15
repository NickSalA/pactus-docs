---
title: Vision Global
description: Vista general de la arquitectura de ContractIA y flujo principal de procesamiento.
---

## Flujo End-to-End

```mermaid
graph TD
    User((Usuario/Notario)) -- Carga Contrato --> FE[Frontend: Next.js]
    FE -- Request --> BE[Backend: FastAPI]
    BE -- 1. Extrae Texto --> LP[LlamaParse]
    LP -- Markdown --> BE
    BE -- 2. Embeddings --> VDB[(Qdrant: Vector DB)]
    BE -- 3. Orquestación --> LG[LangGraph: Agente IA]
    LG -- Query Contexto --> VDB
    LG -- Genera Análisis --> LLM[Gemini / Llama 3]
    LLM -- Respuesta --> LG
    LG -- JSON --> BE
    BE -- Resultado --> FE
```

## Resumen

El frontend carga el contrato y consume el backend para iniciar el pipeline. El backend orquesta parseo, embeddings y consulta contextual sobre Qdrant. LangGraph coordina la llamada al LLM y devuelve una respuesta estructurada en JSON para que el frontend la presente.
