---
title: Contratos Recientes (B2B)
description: Log visual timeline de las últimas firmas de contratos empresariales (SLAs, Contratos Marco, etc.).
---

El dashboard de **Contratos Recientes (B2B)** presenta un registro cronológico de los últimos contratos empresariales firmados, permitiendo a los altos cargos mantener visibilidad sobre la actividad de contratación reciente y detectar patrones de firma.

## Resumen Ejecutivo

Este dashboard muestra un timeline visual de los contratos de tipo `COMPANY` más recientemente creados o modificados, incluyendo información sobre el tipo de contrato, cliente, valor y estado. Es útil para seguimiento operativo y control de pipeline de ventas.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Contratos Firmados (30d)** | Cantidad de contratos con estado ACTIVE en los últimos 30 días | COUNT where state=ACTIVE AND start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) |
| **Contratos Pendientes (30d)** | Contratos en estado PENDING_SIGNATURE recientes | COUNT where state=PENDING_SIGNATURE AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) |
| **Valor Firmado (30d)** | Suma del valor de contratos firmados recientemente | SUM(service_items.value) WHERE contratos récents activos |
| **Tiempo Promedio de Firma** | Días promedio desde creación hasta estado ACTIVE | AVG(DATEDIFF(activated_at, created_at)) |
| **Tasa de Conversión** | Porcentaje de contratos draft que alcanzan estado ACTIVE | (Contratos activos / Total creados) × 100 |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, name, client, type (COMPANY), state, start_date, created_at, updated_at, activated_at |
| `ServiceItem` | value, currency |
| **Tipos de Contrato** | Clasificación: SLA, Contrato Marco, Adenda, Amendment |

### Tipos de Contrato Empresarial

| Tipo | Descripción |
|------|-------------|
| **SLA** | Service Level Agreement - Contrato de nivel de servicio |
| **Contrato Marco** | Agreement principal que engloba múltiples servicios |
| **Adenda** | Addition al contrato original |
| **Amendment** | Modificación de términos existentes |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Tiempo real (polling cada 30 segundos) |
| **Latencia de Datos** | Inmediata desde evento de creación/actualización |
| **Historial Visible** | Últimos 100 contratos o últimos 90 días |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Timeline Vertical** | Lista cronológica de contratos, más recientes arriba |
| **Icono por Tipo** | Icono distintivo por tipo de contrato (SLA, Marco, etc.) |
| **Badge de Estado** | Color-coded por estado (verde=activo, amarillo=pendiente) |
| **Información por Item** | Cliente, tipo, valor, fecha de firma |
| **Barra de Progreso** | Indicates tiempo en cada estado para contratos pendientes |

### Visualización del Timeline

```
HOY
├── [✓] Contrato Marco - Acme Corp - S/ 150,000 - ACTIVO
├── [✓] SLA - TechStart - S/ 45,000 - ACTIVO
├── [○] Adenda - GlobalTech - PENDIENTE
├── [✓] Amendment - Innova SA - S/ 22,000 - ACTIVO
├── [✓] Contrato Marco - StartUpXYZ - S/ 80,000 - ACTIVO
...
hace 15 días
```

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Click en contrato** | Abre modal de detalle del contrato |
| **Hover sobre timeline** | Muestra tooltip con resumen rápido |
| **Filtro por tipo** | Ver solo SLAs, solo Marcos, etc. |
| **Filtro por estado** | Ver solo activos, solo pendientes |
| **Búsqueda** | Buscar por nombre de cliente o contrato |
| **Exportar** | Descargar CSV de últimos contratos |

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Filtro de fecha** | Selector de rango de fechas personalizado |
| **Agrupar por cliente** | Ver todos los contratos de un cliente juntos |
| **Notificaciones** | Alerta cuando hay nuevos contratos firmados |
| **Seguimiento de pendientes** | Contratos en PENDING_SIGNATURE muestran progreso |

### Casos de Uso

1. **Daily standup**: El equipo de operaciones revisa nuevos contratos del día anterior.
2. **Reporte semanal**: El Manager presenta a dirección los contratos firmados en la semana.
3. **Seguimiento de pipeline**: Visualizar la velocidad de cierres del equipo comercial.
4. **Control de SLA**: Identificar nuevos SLAs para comunicar al equipo de servicio.
5. **Auditoría**: Revisión de contratos firmados para compliance.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de Operaciones** | Visibilidad de contratos nuevos para coordinar ejecución |
| **Director Legal** | Seguimiento de contratos pendientes de firma |
| **Gerente Comercial** | Velocidad de cierre y pipeline de ventas |
| **CEO** | Actividad reciente del negocio |

### Decisiones Asociadas

- Asignación de recursos para ejecutar nuevos contratos
- Seguimiento de contratos pendientes para acelerar firma
- Identificación de patrones de firma por tipo de contrato
- Evaluación de desempeño del equipo comercial
- Ajuste de procesos de contratación

### Impacto Estratégico

El registro de contratos recientes proporciona **visibilidad operativa inmediata**:

- **Transparencia**: Todos ven qué contratos se están firmando
- **Velocidad**: Permite medir el tiempo de cierre del ciclo de venta
- **Seguimiento**: Contratos pendientes no se "pierden"
- **Patrones**: Identificar días/semanas de mayor actividad de firma
- **Accountability**: Cada contrato tiene responsable claro

La diferenciación por tipo de contrato (SLA vs Marco) permite además hacer seguimiento específico de cada modalidad de negocio.