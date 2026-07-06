---
title: Prompts y Tools
description: Herramientas disponibles para el agente conversacional y reglas de selección.
---

El agente A3 (conversation agent) tiene acceso a cinco herramientas que le permiten consultar contratos, buscar en la base de conocimientos y generar visualizaciones.

## Herramientas del Agente

### bc_tool — Búsqueda Vectorial

**Propósito**: Buscar información textual dentro de contratos usando similarity search.

**Cuándo usarla**:
- Consultas sobre contenido de cláusulas, obligaciones, penalidades
- Búsqueda de firmantes, representantes, poderes
- Consulta de anexos, SLAs, términos contractuales
- Cuando el usuario pide "explícame el contrato X" o "qué dice sobre..."

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `query` | string | Consulta textual |
| `limit` | int | Número de fragmentos a recuperar (default 5) |
| `document_ids` | list[int] | Filtrar a documentos específicos |

**Retorno**: Fragmentos de texto relevantes con información de origen.

---

### party_lookup_tool — Resolución de Contraparte

**Propósito**: Encontrar contratos asociados a una persona o empresa específica.

**Cuándo usarla**: Cuando el usuario pregunta por "contrato con [nombre]" y el tipo de documento no es explícito. Solo disponible para el agente A2 (permissions), no para A3.

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `party_name` | string | Nombre de la persona o empresa |
| `limit` | int | Límite de resultados (default 5) |
| `state` | DocumentState | Filtrar por estado (default: ACTIVE) |

**Retorno**: Lista de contratos candidatos con document_id, nombre, client y document_type.

---

### company_contracts_query_tool — Consultas COMPANY

**Propósito**: Consulta estructurada de contratos corporativos (B2B).

**Cuándo usarla**:
- Preguntas sobre clientes, empresas, RUCs
- Rankings de clientes por cantidad de contratos
- Servicios contratados por empresa
- Valores y montos de contratos comerciales

**Operaciones**:
| Operación | Descripción |
|----------|-------------|
| `count` | Contar contratos que cumplen filtros |
| `list` | Listar contratos con ordenamiento y filtros |
| `ranking` | Ranking de clientes por cantidad de contratos |
| `services_ranking` | Ranking de servicios por monto total contratado |
| `client_services_ranking` | Ranking de clientes por cantidad de servicios |

**Filtros disponibles**: client, ruc, contract_name, service_name, service_id, min_value, max_value, currency, state, period_start, period_end, date_mode, currently_active, sort_by, sort_direction, limit.

**Nota**: `operation=ranking` SÍ está disponible para COMPANY.

---

### labor_contracts_query_tool — Consultas LABOR

**Propósito**: Consulta estructurada de contratos laborales.

**Cuándo usarla**:
- Preguntas sobre trabajadores, empleados
- Salarios, posiciones, modalidades contractuales
- Historial laboral

**Operaciones**:
| Operación | Descripción |
|----------|-------------|
| `count` | Contar contratos que cumplen filtros |
| `list` | Listar contratos con ordenamiento y filtros |

**Filtros disponibles**: worker_name, worker_document_number, position, contract_name, contract_modality, salary_periodicity, min_value, max_value, currency, state, period_start, period_end, date_mode, currently_active, sort_by, sort_direction, limit.

**Nota**: `operation=ranking` NO está disponible para LABOR (un trabajador no puede tener múltiples contratos activos).

---

### dashboard_chart_tool — Gráficos de Dashboard

**Propósito**: Generar visualizaciones de analytics para el usuario.

**Cuándo usarla**:
- El usuario pide ver gráficos, charts, dashboards
- Solicitudes de rankings visuales (top 5, top 10)
- Estadísticas generales, tendencias

**Operaciones disponibles por rol**:

| Rol | Operaciones disponibles |
|-----|------------------------|
| COMPANY (MANAGER, WORKER) | `top_services`, `top_companies`, `loyalty` |
| LABOR (HR) | `retention`, `origin` |

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `operation` | string | Una de: top_services, top_companies, loyalty, retention, origin |
| `currency` | string | 'PEN' o 'USD' (solo para top_services, top_companies) |
| `limit` | int | Límite de resultados 1-20 (default 5, solo top_services/top_companies) |

**Retorno**: JSON con `type`, `layout`, `title`, `config` y `data` listo para renderizar con recharts.

---

## Reglas de Selección de Herramienta

El agente A3 sigue estas reglas para elegir la herramienta correcta:

### Consultas de contenido textual (bc_tool)
- Si el usuario pide explicar un contrato específico → bc_tool
- Si busca firmantes, representantes, apoderados → bc_tool
- Si consulta cláusulas, obligaciones, penalidades → bc_tool
- Para búsquedas de personas dentro del texto → bc_tool

### Consultas estructuradas (company/labor query tools)
- Si pregunta por CLIENTES, empresas, RUCS → company_contracts_query_tool
- Si pregunta por TRABAJADORES, salarios, posiciones → labor_contracts_query_tool
- Para conteos o listas sin dato textual → tool de consulta correspondiente
- Para rankings de clientes → company_contracts_query_tool con operation='ranking'
- Para rankings de trabajadores → Clarificar que no está disponible para LABOR

### Gráficos (dashboard_chart_tool)
- Si pide ver "gráfico", "chart", "dashboard", "top 5", "top 10" → dashboard_chart_tool
- Si pide tendencias, estadísticas generales → dashboard_chart_tool

### Prioridades
1. bc_tool para contenido textual específico
2. company/labor_contracts_query_tool para datos estructurados
3. dashboard_chart_tool para visualizaciones solicitadas explícitamente

## Loop de Herramientas

Cuando el agente decide usar una herramienta:

1. A3 genera una respuesta con `tool_calls`
2. El ToolNode ejecuta todas las herramientas llamadas
3. Los resultados (ToolMessage) se agregan al historial
4. A3 recibe el historial actualizado y puede llamar más herramientas o generar respuesta final

Este loop continúa hasta que A3 genere una respuesta sin `tool_calls`, pasando a `n3_final_response`.

## Extracción de Chart

Cuando `dashboard_chart_tool` es llamada exitosamente, su resultado se extrae del historial de mensajes y se incluye en el campo `chart` del `ChatResponse` enviado al frontend.

El frontend renderiza el chart usando la biblioteca recharts con:
- `BarChart` para tipo 'bar'
- `LineChart` para tipo 'line'
- `PieChart` para tipo 'pie'

## Ver también

- [Agente LangGraph](./03-agente-langgraph.md) — Arquitectura completa del grafo
- [Pipeline RAG](./01-pipeline-rag.md) — Cómo bc_tool realiza búsquedas vectoriales