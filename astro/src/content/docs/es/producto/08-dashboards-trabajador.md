---
title: Dashboards de Trabajador
description: Dashboard ejecutivo para la gestión de contratos laborales y gastos de planilla.
---

El módulo de **Dashboards de Trabajador** proporciona a los altos cargos una visión integral del estado de los contratos laborales y el gasto en planilla. Este módulo es fundamental para la gestión de recursos humanos y la planificación presupuestaria.

## Dashboards Disponibles

| Dashboard | Descripción | Stakeholder Principal |
|-----------|-------------|------------------------|
| [Gasto de Planilla](/es/producto/dashboards-trabajador/01-gasto-planilla) | Proyección de gasto laboral con línea de tendencia | CFO, Director de RRHH |
| [Centro de Alertas (Trabajadores)](/es/producto/dashboards-trabajador/02-centro-alertas-trabajador) | Alertas de vencimiento de contratos de trabajadores a 30/60 días y vigencia prolongada | Gerente de RRHH, Legal |
| [Contratos Recientes (Trabajadores)](/es/producto/dashboards-trabajador/03-contratos-recientes-trabajador) | Lista de últimos contratos laborales actualizados | Gerente de RRHH, Operations |
| [Retención de Talento](/es/producto/dashboards-trabajador/04-ranking-retencion-trabajador) | Análisis de retención, antigüedad y renovación laboral | Director de RRHH |
| [Origen de Contratos](/es/producto/dashboards-trabajador/05-origen-contratos) | Procedencia y métodos de creación de contratos | Operations, RRHH |


## Resumen de KPIs Clave

| Métrica | Descripción |
|---------|-------------|
| **Gasto Mensual de Planilla** | Suma de `service_items.value` de contratos LABOR activos (7 puntos: 4 históricos + actual + 2 futuros) |
| **Alertas de Vencimiento** | Contratos laborales con `end_date` en ventana de 30/60 días o en vigencia prolongada (>60 días futuros) - 3 categorías |
| **Contratos Laborales Recientes Actualizados** | Lista de los últimos 4 contratos LABOR actualizados (ordenados por updated_at) |

## Uso del Módulo

Este módulo está diseñado para usuarios con rol **HR** que necesitan visibilidad ejecutiva sobre la gestión de trabajadores. Cada dashboard incluye:

- **Ficha Técnica**: Definición de KPIs, origen de datos y lógica de cálculo
- **Guía de Funcionalidad**: Comportamiento visual e interacciones disponibles
- **Valor de Negocio**: Justificación estratégica para la toma de decisiones

## Navegación

```
Producto → Dashboards de Trabajador → [Seleccionar Dashboard]
```

Los dashboards están ordenados secuencialmente para facilitar la navegación lateral en el sidebar.

## Diferenciación con Módulo de Empresa

Mientras que el **módulo de Empresa** se enfoca en la gestión de clientes empresariales, este módulo se centra en la gestión del **capital humano**:

| Aspecto | Dashboards de Empresa | Dashboards de Trabajador |
|---------|---------------------|--------------------------|
| **Tipo de contrato** | COMPANY (empresarial) | LABOR (laboral) |
| **Entidad** | Clientes empresas | Trabajadores |
| **Métricas principales** | Ingresos por contratos | Gasto de planilla |
| **Stakeholder** | Comercial, Finance | RRHH, Legal |

Ambos módulos comparten la estructura y nivel de detalle, permitiendo una visión unificada de la gestión contractual de la organización.
