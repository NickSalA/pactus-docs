---
title: Dashboards de Empresa
description: Dashboard ejecutivo para la gestión de contratos empresariales y análisis de clientes B2B.
---

El módulo de **Dashboards de Empresa** proporciona a los altos cargos una visión integral del estado de los contratos con empresas clientes. Este módulo permite tomar decisiones estratégicas sobre retención, proyección de ingresos y gestión de riesgos.

## Dashboards Disponibles

| Dashboard | Descripción | Stakeholder Principal |
|-----------|-------------|------------------------|
| [Ingresos Proyectados](/es/producto/dashboards-empresa/01-ingresos-proyectados) | Previsión de flujo de caja con histórico y proyecciones | CFO, Director Finance |
| [Centro de Alertas](/es/producto/dashboards-empresa/02-centro-alertas-empresas) | Sistema de semáforo para contratos críticos | Director Operations, Legal |
| [Servicios más Contratados](/es/producto/dashboards-empresa/03-servicios-contratados) | Volumen y valor por categoría de servicio | Sales, Product Manager |
| [Contratos Recientes](/es/producto/dashboards-empresa/05-contratos-recientes-b2b) | Log visual de últimas firmas de contratos | Legal, Operations |
| [Top Empresas (Volumen)](/es/producto/dashboards-empresa/06-top-empresas) | Ranking de clientes por carga operativa | Account Manager, Sales |

> **Nota**: Los dashboards de Fidelidad/Retención, Permanencia Media, Churn y Clientes en Riesgo no están implementados en el backend actual.

## Resumen de KPIs Clave

| Métrica | Descripción |
|---------|-------------|
| **Ingresos Proyectados** | Suma de `service_items.value` de contratos COMPANY activos + proyección futura (7 puntos: 4 históricos + actual + 2 futuros) |
| **Alertas Activas** | Contratos con `end_date` en ventana de 30/60 días o en vigencia prolongada (>60 días futuros) |
| **Servicios Top** | Agregación por `service_items.description` con mayor volumen y valor acumulado (Top 5) |
| **Contratos Firmados** | Conteo de contratos COMPANY con `state=ACTIVE` en últimos 30 días |
| **Top 5 Clientes** | Ranking por cantidad de contratos activos y valor total (máximo 5) |

## Uso del Módulo

Este módulo está diseñado para usuarios con rol **MANAGER** que necesitan visibilidad ejecutiva sobre la cartera de clientes empresariales. Cada dashboard incluye:

- **Ficha Técnica**: Definición de KPIs, origen de datos y lógica de cálculo
- **Guía de Funcionalidad**: Comportamiento visual e interacciones disponibles
- **Valor de Negocio**: Justificación estratégica para la toma de decisiones

## Navegación

```
Producto → Dashboards de Empresa → [Seleccionar Dashboard]
```

Los dashboards están ordenados secuencialmente para facilitar la navegación lateral en el sidebar.