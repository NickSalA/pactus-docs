---
title: Ranking de Retención (Trabajadores)
description: Dashboard de métricas de antigüedad y retención de trabajadores.
---

> **Estado: No implementado en backend actual**

El dashboard de **Ranking de Retención (Trabajadores)** mediría la antigüedad y permanencia de los trabajadores en la organización. Sin embargo, **actualmente no existe ningún endpoint backend** para este dashboard.

## Estado Actual

| Componente | Estado |
|------------|--------|
| Endpoint backend | ❌ No existe |
| Servicio | ❌ No existe |
| Repositorio | ❌ No existe |
| Schema | ❌ No existe |

## Funcionalidades NO Implementadas

Las siguientes métricas **no están disponibles** en el backend actual:

- Antigüedad promedio por trabajador
- Ranking por antigüedad
- Tasa de retención histórica
- Trabajadores con más de 2 años
- Riesgo de conocimiento
- Distribución por cohorts
- Timeline de retención
- Notificaciones de aniversario

## Equivalentes en el Sistema

El módulo dashboard actual solo proporciona:

- [Gasto de Planilla](/es/producto/dashboards-trabajador/01-gasto-planilla) - Análisis de gasto laboral
- [Centro de Alertas](/es/producto/dashboards-trabajador/02-centro-alertas-trabajador) - Contratos próximos a vencer
- [Contratos Recientes](/es/producto/dashboards-trabajador/03-contratos-recientes-trabajador) - Últimos contratos laborales

## Próximos Pasos

Si se desea implementar este dashboard, sería necesario desarrollar:

1. Nuevo endpoint(s) backend para calcular antigüedad
2. Lógica de detección de riesgo de conocimiento
3. Schema de respuesta para ranking de trabajadores
4. Integración con el módulo de dashboards

> **Nota**: Este documento se mantiene por posible uso futuro, pero no representa funcionalidad actualmente disponible en el sistema.