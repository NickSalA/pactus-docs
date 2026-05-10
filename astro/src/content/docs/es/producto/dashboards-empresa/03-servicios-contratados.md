---
title: Servicios más Contratados
description: Gráfico de barras que muestra el volumen y valor de servicios empresarial por categoría (Cloud, Ciberseguridad, etc.).
---

El dashboard de **Servicios más Contratados** proporciona una visión analítica de la demanda de servicios por parte de los clientes empresariales, permitiendo identificar oportunidades de crecimiento y optimización de la cartera de servicios.

## Resumen Ejecutivo

Este dashboard presenta los servicios más contratados por las empresas clientes, discriminando entre volumen (cantidad de contratos que incluyen el servicio) y valor económico (facturación total). Permite a los altos cargos tomar decisiones sobre estrategia de servicios, precios y enfocamiento comercial.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Volumen por Servicio** | Cantidad de contratos que incluyen cada servicio | COUNT(Document) JOIN ServiceItem WHERE service_id = X |
| **Valor por Servicio** | Facturación total del servicio en el período | SUM(service_items.value) GROUP BY service_id |
| **Valor Promedio por Contrato** | Valor medio facturado por contrato que incluye el servicio | SUM(valor) / COUNT(contratos) |
| **Tendencia** | Variación en contratación del servicio vs. período anterior | (Volumen período actual / Volumen período anterior) - 1 |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, type (COMPANY), state |
| `ServiceItem` | service_id, description, value, currency, start_date, end_date |
| **Tabla de Servicios** | Catálogo de servicios disponibles (Cloud, Ciberseguridad, etc.) |

### Categorías de Servicios

Basado en el dominio del sistema, los servicios típicos incluyen:

| Categoría | Ejemplos de Servicios |
|-----------|----------------------|
| **Cloud** | Hosting, servidores, almacenamiento, SaaS |
| **Ciberseguridad** | Auditoría, pentesting, gestión de incidentes |
| **Desarrollo** | Desarrollo web, móvil, software a medida |
| **Consultoría** | Asesoría legal, estrategia, procesos |
| **Infraestructura** | Redes, cableado, equipamiento |

### Lógica de Agrupación

- Los servicios se agrupan por `service_id` o por categoría si el sistema tiene categorización
- El gráfico muestra las 10 categorías/ servicios más contratados por volumen
- Las barras muestran volumen (eje Y izquierdo) y valor (eje Y derecho) de forma agrupada

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Diario a medianoche |
| **Período de Análisis** | Últimos 12 meses móviles |
| **Latencia de Datos** | Hasta 24 horas para datos de facturación |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Gráfico de Barras Horizontales** | Dos barras por categoría: volumen (azul) y valor (naranja) |
| **Eje Y Izquierdo** | Cantidad de contratos (volumen) |
| **Eje Y Derecho** | Valor en soles (facturación) |
| **Eje X** | Categorías de servicios |
| **Leyenda** | Identifica volumen vs. valor |
| **Orden Predeterminado** | Por volumen decreciente |

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Hover sobre barra** | Muestra tooltip con volumen, valor y tendencia |
| **Click en barra** | Filtra lista de contratos que incluyen ese servicio |
| **Cambiar período** | Selector de rango de fechas (trimestre, año, custom) |
| **Ordenar por valor** | Reordenar gráfico por facturación en lugar de volumen |
| **Ver detalle** | Click en servicio → tabla de contratos asociados |

### Gráfico Detallado

```
Cloud              ████████████████████
Ciberseguridad     ████████████████
Desarrollo         █████████████
Consultoría        ███████████
Infraestructura    █████████
                   └────────────────┴────
                   Miles S/.
```

### Casos de Uso

1. **Análisis de port folio**: Identificar qué servicios generan más ingresos para priorizarlos.
2. **Detección de oportunidades**: Servicios con alto volumen pero bajo valor pueden indicar oportunidad de upselling.
3. **Planificación de capacidad**: Servicios en crecimiento requieren más recursos.
4. **Reporte a dirección**: Presentar qué servicios son los pilares del negocio.
5. **Decisión de precios**: Analizar si los precios están alineados con el valor percibido.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Director comercial** | Identificar servicios estrella y de crecimiento |
| **Product Manager** | Decisiones sobre desarrollo de nuevos servicios |
| **CFO** | Distribución de ingresos por línea de servicio |
| **Gerente de Operaciones** | Planificación de recursos por servicio |

### Decisiones Asociadas

- Desarrollo de nuevos servicios basedo en demanda
- Ajuste de precios por servicio
- Asignación de presupuesto de marketing por servicio
- Contratación de personal especializado por servicio
- Descontinuación de servicios de bajo rendimiento

### Impacto Estratégico

Este dashboard proporciona **visibilidad sobre la composición de ingresos** por línea de servicio:

- **Identificación de servicios core**: Los que generan la mayor facturación
- **Oportunidades de cross-selling**: Servicios con alto volumen pero bajo valor medio
- **Tendencias de mercado**: Qué servicios están creciendo o decreciendo
- **Asignación de recursos**: Dónde invertir para maximizar retorno

La doble visualización (volumen + valor) permite identificar servicios que generan muchos contratos pero bajo valor (potencial de upselling) versus servicios de alto valor pero bajo volumen (nicho premium).