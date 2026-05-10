---
title: Dashboards de Trabajador
description: Dashboard ejecutivo para la gestión de contratos laborales, gastos de planilla y retención de trabajadores.
---

El módulo de **Dashboards de Trabajador** proporciona a los altos cargos una visión integral del estado de los contratos laborales, el gasto en planilla y la retención del capital intelectual. Este módulo es fundamental para la gestión de recursos humanos y la planificación presupuestaria.

## Dashboards Disponibles

| Dashboard | Descripción | Stakeholder Principal |
|-----------|-------------|------------------------|
| [Gasto de Planilla](/es/producto/dashboards-trabajador/01-gasto-planilla) | Proyección de gasto laboral con línea de tendencia y reducción por fin de contratos | CFO, Director de RRHH |
| [Centro de Alertas (Trabajadores)](/es/producto/dashboards-trabajador/02-centro-alertas-trabajador) | Alertas de vencimiento de contratos de trabajadores a 30/60 días | Gerente de RRHH, Legal |
| [Contratos Recientes (Trabajadores)](/es/producto/dashboards-trabajador/03-contratos-recientes-trabajador) | Registro de nuevas altas por modalidad contractual | Gerente de RRHH, Operations |
| [Ranking de Retención (Trabajadores)](/es/producto/dashboards-trabajador/04-ranking-retencion-trabajador) | Métrica de antigüedad del capital intelectual | CEO, Director de RRHH |

## Resumen de KPIs Clave

| Métrica | Descripción |
|---------|-------------|
| **Gasto Mensual de Planilla** | Suma de `service_items.value` de contratos LABOR activos |
| **Proyección de Reducción** | Estimación de ahorro por contratos que finalizarán en los próximos meses |
| **Alertas de Vencimiento** | Conteo de contratos laborales con `end_date` en ventana de 30/60 días |
| **Altas Recientes** | Conteo de nuevos contratos LABOR en los últimos 30 días por modalidad |
| **Antigüedad Promedio** | Promedio de meses de permanencia de los trabajadores activos |
| **Retención Histórica** | Porcentaje de trabajadores que han renovado al menos una vez |

## Uso del Módulo

Este módulo está diseñado para usuarios con rol **ADMIN** y **HR** que necesitan visibilidad ejecutiva sobre la gestión de trabajadores. Cada dashboard incluye:

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
| **Métricas principales** | Ingresos, retención de clientes | Gasto de planilla, retención de trabajadores |
| **Stakeholder** | Comercial, Finance | RRHH, Legal |

Ambos módulos comparten la estructura y nivel de detalle, permitiendo una visión unificada de la gestión contractual de la organización.