---
title: Top Empresas (Volumen)
description: Ranking de clientes empresariales por carga operativa, cantidad de contratos y valor total.
---

El dashboard de **Top Empresas (Volumen)** presenta un ranking de los clientes empresariales más importantes según su carga operativa, permitiendo a los altos cargos identificar y gestionar las cuentas de mayor relevancia.

## Resumen Ejecutivo

Este dashboard ranking clasifica a los clientes de tipo `COMPANY` según múltiples métricas de volumen: cantidad de contratos activos, valor total de facturación, y carga operativa. Es esencial para la gestión de cuentas clave y la asignación de recursos.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Ranking por Volumen** | Posición del cliente según cantidad de contratos activos | RANK() ORDER BY COUNT(contracts) DESC |
| **Cantidad de Contratos** | Número de contratos activos por cliente | COUNT(Document) WHERE state=ACTIVE GROUP BY client |
| **Valor Total** | Suma de valores de todos los contratos del cliente | SUM(service_items.value) GROUP BY client |
| **Carga Operativa** | Métrica compuesta: contratos + servicios + valor | Ponderación: 40% contratos, 30% servicios, 30% valor |
| **Promedio por Contrato** | Valor medio por contrato del cliente | SUM(valor) / COUNT(contratos) |
| **Servicios Activos** | Cantidad de servicios diferentes contratados | COUNT(DISTINCT service_id) GROUP BY client |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state, folder_id |
| `ServiceItem` | service_id, value, description, currency |
| `Organization` | org_id para contexto |

### Cálculo de Carga Operativa

La métrica de carga operativa combina múltiples factores en un índice compuesto:

| Factor | Peso | Descripción |
|--------|------|-------------|
| **Cantidad de Contratos** | 40% | Número de contratos activos |
| **Cantidad de Servicios** | 30% | Diversidad de servicios contratados |
| **Valor Total** | 30% | Facturación total |

**Fórmula**:
```
Carga Operativa = (Norm(contratos) × 0.4) + (Norm(servicios) × 0.3) + (Norm(valor) × 0.3)
```
donde `Norm(x) = (x - min) / (max - min)` para normalización 0-1.

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Diario a las 6:00 AM |
| **Período de Análisis** | Contratos con state=ACTIVE a la fecha |
| **Top N** | Visualización de top 20 con opción de ver más |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Tabla de Ranking** | Lista ordenada con posición, cliente, contratos, servicios, valor |
| **Barras Horizontales** | Representación visual de la magnitud relativa |
| **Indicador de Posición** | 1°, 2°, 3° con badge distintivo para top 3 |
| **Sparklines** | Mini gráfica de tendencia de los últimos 6 meses |
| **Badge de Riesgo** | Indicador si el cliente tiene contratos próximos a vencer |

### Visualización del Ranking

```
#  Empresa           Contratos  Servicios   Valor Total    Tendencia
──────────────────────────────────────────────────────────────────────
1  ██████████ TechCorp       12          5    S/ 450,000     ↗ +15%
2  █████████  InnovaLabs       8          4    S/ 320,000     ↘ -5%
3  ████████   GlobalTech       10          3    S/ 280,000     ↗ +8%
4  ███████    StartUpXYZ        6          2    S/ 180,000     →  0%
5  ██████     DataMaster        5          3    S/ 150,000     ↗ +20%
...
```

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Click en cliente** | Muestra dashboard detallado del cliente |
| **Hover sobre fila** | Muestra tooltip con métricas adicionales |
| **Ordenar por columna** | Click en header para reordenar por cualquier métrica |
| **Filtro de ranking** | Ver top 5, 10, 20 o todos |
| **Buscar cliente** | Filtrar por nombre de empresa |
| **Exportar** | Descargar ranking como CSV |

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Comparar clientes** | Seleccionar hasta 3 clientes para comparar lado a lado |
| **Ver detalle del cliente** | Dashboard individual con todos sus contratos |
| **Alertas de riesgo** | Badge rojo si tiene contratos próximos a vencer |
| **Ver tendencias** | Evolución del ranking en los últimos 6 meses |

### Casos de Uso

1. **Gestión de cuentas clave**: El Account Manager prioriza su tiempo en los top 10.
2. **Asignación de recursos**: Más recursos para clientes de mayor carga operativa.
3. **Revisión de riesgos**: Identificar clientes importantes con alertas de vencimiento.
4. **Planificación de ingresos**: Proyección de ingresos basada en top clientes.
5. **Reporte a dirección**: Presentación del "who's who" de la cartera de clientes.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CEO** | Identificar los clientes más importantes del negocio |
| **Director Comercial** | Gestión de cuentas clave y asignación de recursos |
| **Gerente de Operaciones** | Distribución de carga operativa entre equipos |
| **CFO** | Concentración de ingresos en pocos clientes (riesgo) |

### Decisiones Asociadas

- Asignación de Account Managers a cuentas clave
- Decisiones de inversión en servicio al cliente
- Identificación de riesgo por concentración
- Desarrollo de programas de fidelización para top clientes
- Negociación de renovación de contratos de alto valor

### Impacto Estratégico

El ranking de clientes proporciona **claridad sobre la composición de la cartera**:

| Métrica | Utilidad |
|---------|----------|
| **Top 10 representa** | Typically 60-80% del valor total de la cartera |
| **Diversidad de servicios** | Clientes con más servicios tienen menor probabilidad de churn |
| **Concentración** | Alerts si un solo cliente representa >30% de ingresos |

Este dashboard permite:

- **Priorizar esfuerzos** donde generan mayor impacto
- **Identificar riesgo** de concentración excesiva
- **Medir salud** de las relaciones con clientes clave
- **Planificar recursos** de manera informada
- **Tomar decisiones** basadas en datos de carga operativa

La tendencia (sparklines) es particularmente valiosa para identificar clientes en crecimiento o declive.