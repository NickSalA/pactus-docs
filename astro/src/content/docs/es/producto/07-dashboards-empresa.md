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
| [Fidelidad (Retención)](/es/producto/dashboards-empresa/04-fidelidad-retencion) | Métrica de permanencia de empresas clientes | Customer Success, CEO |
| [Contratos Recientes](/es/producto/dashboards-empresa/05-contratos-recientes-b2b) | Log visual de últimas firmas de contratos | Legal, Operations |
| [Top Empresas (Volumen)](/es/producto/dashboards-empresa/06-top-empresas) | Ranking de clientes por carga operativa | Account Manager, Sales |

## Resumen de KPIs Clave

| Métrica | Descripción |
|---------|-------------|
| **Ingresos Proyectados** | Suma de `service_items.value` de contratos COMPANY activos + proyección futura |
| **Alertas Activas** | Conteo de contratos con `end_date` en ventana de 30/60 días o `state=EXPIRING` |
| **Servicios Top** | Agregación por `service_items.description` con mayor volumen y valor acumulado |
| **Permanencia Media** | Promedio de meses entre `start_date` y fecha actual por cliente |
| **Contratos Firmados** | Conteo de contratos COMPANY con `state=ACTIVE` en últimos 30 días |
| **Top 10 Clientes** | Ranking por cantidad de contratos activos y valor total |

## Uso del Módulo

Este módulo está diseñado para usuarios con rol **ADMIN** y **MANAGER** que necesitan visibilidad ejecutiva sobre la cartera de clientes empresariales. Cada dashboard incluye:

- **Ficha Técnica**: Definición de KPIs, origen de datos y lógica de cálculo
- **Guía de Funcionalidad**: Comportamiento visual e interacciones disponibles
- **Valor de Negocio**: Justificación estratégica para la toma de decisiones

## Navegación

```
Producto → Dashboards de Empresa → [Seleccionar Dashboard]
```

Los dashboards están ordenados secuencialmente para facilitar la navegación lateral en el sidebar.