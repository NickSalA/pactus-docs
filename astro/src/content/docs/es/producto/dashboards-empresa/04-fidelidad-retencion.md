---
title: Fidelidad (Retención)
description: Dashboard de métricas de permanencia y retención de clientes empresariales.
---

> **Estado: No implementado en backend actual**

El dashboard de **Fidelidad (Retención)** mediría la permanencia de los clientes empresariales en el tiempo. Sin embargo, **actualmente no existe ningún endpoint backend** para este dashboard.

## Estado Actual

| Componente | Estado |
|------------|--------|
| Endpoint backend | ❌ No existe |
| Servicio | ❌ No existe |
| Repositorio | ❌ No existe |
| Schema | ❌ No existe |

## Funcionalidades NO Implementadas

Las siguientes métricas **no están disponibles** en el backend actual:

- Permanencia media por cliente
- Tasa de retención
- Distribución de cohorts
- Clientes en riesgo
- Churn rate
- Heatmap de riesgo
- Historial completo de permanencia

## Equivalentes en el Sistema

El módulo dashboard actual solo proporciona:

- [Ingresos Proyectados](/es/producto/dashboards-empresa/01-ingresos-proyectados) - Análisis de ingresos
- [Centro de Alertas](/es/producto/dashboards-empresa/02-centro-alertas-empresas) - Contratos próximos a vencer
- [Top Empresas](/es/producto/dashboards-empresa/06-top-empresas) - Ranking de empresas por volumen/valor

## Próximos Pasos

Si se desea implementar este dashboard, sería necesario desarrollar:

1. Nuevo endpoint(s) backend para calcular permanencia
2. Lógica de detección de churn
3. Schema de respuesta para cohorts
4. Integración con el módulo de dashboards

> **Nota**: Este documento se mantiene por posible uso futuro, pero no representa funcionalidad actualmente disponible en el sistema.
