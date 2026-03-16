---
title: Justificación Técnica del Stack
description: Razonamiento detrás de la elección de tecnologías y diseño arquitectónico.
---

La selección de tecnologías para **ContractIA** se basó en la necesidad de procesar documentos legales con extrema precisión, mantener un estado conversacional fluido y garantizar el despliegue escalable del sistema.

A continuación, se detalla la justificación técnica de cada componente de la infraestructura:

![Mapa de Infraestructura y Stack Tecnológico](../../../../assets/arquitectura/02-justificacion/arquitectura-stack.svg)

## Entorno Frontend (Vercel)

* **Next.js (React + TypeScript):** Se eligió como framework principal por su robustez en el renderizado y su tipado estricto con TypeScript. Al desplegarse en **Vercel**, se garantiza una entrega de contenido (CDN) ultrarrápida y una integración nativa de CI/CD, ideal para que el Notario experimente una interfaz ágil sin tiempos de carga innecesarios.
* **Tailwind CSS:** Permite construir la interfaz del chat y el visor de documentos de forma modular y rápida, manteniendo un peso ligero en el cliente.

## Entorno Backend (Railway)

* **FastAPI:** El procesamiento de PDFs y las llamadas a los modelos de IA generan bloqueos de I/O. FastAPI, al ser asíncrono (`async/await`), maneja múltiples peticiones simultáneas de forma eficiente. **Railway** se seleccionó como proveedor de nube por su facilidad para desplegar contenedores Docker y gestionar variables de entorno (Key Vault) de manera segura.
* **LangGraph:** Para orquestar al agente inteligente, LangGraph supera a las cadenas tradicionales al permitir flujos cíclicos. Esto le da al sistema la capacidad de razonar, consultar la herramienta de conocimiento varias veces si es necesario, y mantener el estado de la conversación en cada nodo.
* **SQLModel:** (Integrado en FastAPI) Unifica la validación de datos de Pydantic con los modelos de base de datos de SQLAlchemy, reduciendo drásticamente el código repetitivo al interactuar con PostgreSQL.

## Pipeline de Inteligencia Artificial

* **LlamaIndex y LlamaParse:** LlamaParse es crítico en este proyecto por su capacidad única de interpretar la estructura compleja de un contrato legal (tablas, cláusulas, firmas) y convertirlo a un Markdown limpio, algo en lo que los parsers tradicionales fallan.
* **Voyage AI (Embedding Model):** Actúa como el puente matemático indispensable del sistema. Convierte el Markdown estructurado por LlamaParse en representaciones vectoriales de alta calidad (embeddings) capturando la semántica legal antes de enviarlos a la base de datos.
* **Gemini (LLM):** Seleccionado como el motor de razonamiento del Agente Inteligente por su extensa ventana de contexto, permitiéndole analizar múltiples cláusulas recuperadas de los contratos sin perder el hilo conductor, y generando respuestas rápidas al usuario.

## Capa de Persistencia

* **PostgreSQL:** Desplegado como base de datos relacional para gestionar los usuarios, las sesiones de autenticación y los metadatos de los contratos. Es la fuente de verdad transaccional.
* **Qdrant Cloud:** Base de datos vectorial specializada. Recibe los embeddings generados por Voyage AI y permite búsquedas de similitud ultrarrápidas, filtrando por los metadatos específicos del contrato que el Notario está consultando en ese momento.
