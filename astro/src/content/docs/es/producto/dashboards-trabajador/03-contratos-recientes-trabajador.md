---
title: Contratos Recientes (Trabajadores)
description: Registro de nuevas altas de trabajadores por modalidad contractual (Tiempo completo, medio tiempo, servicios).
---

El dashboard de **Contratos Recientes (Trabajadores)** presenta un registro cronológico de los últimos contratos laborales creados, permitiendo a los altos cargos monitorear el crecimiento del equipo y la distribución por modalidad.

## Resumen Ejecutivo

Este dashboard muestra un timeline de los contratos de tipo `LABOR` más recientes, con información sobre la modalidad contractual, el trabajador, la fecha de inicio y el valor. Es útil para seguimiento de contrataciones y análisis de la composición del equipo.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Altas Recientes (30d)** | Nuevos contratos laborales en los últimos 30 días | COUNT where type=LABOR AND start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) |
| **Altas por Modalidad** | Distribución de nuevas contrataciones por tipo | COUNT GROUP BY modalidad (full-time, part-time, servicios) |
| **Inversión en Nuevas Altas** | Suma de valor de nuevos contratos en el período | SUM(service_items.value) WHERE contratos recientes |
| **Tasa de Contratación** | Comparación vs. período anterior | (Altas actual / Altas anterior) - 1 |
| **Modalidad Predominante** | Modalidad con mayor porcentaje de nuevas altas | MODE(start_date, modalidad) |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, created_at |
| `ServiceItem` | value, currency |
| `Organization` | org_id para contexto |

### Modalidades Contractuales

| Modalidad | Descripción |
|-----------|-------------|
| **Tiempo Completo** | Contrato de jornada completa (40 horas semanales) |
| **Medio Tiempo** | Contrato de media jornada (20 horas semanales) |
| **Servicios** | Contrato por servicios ofreelance (sin relación de dependencia) |
| **Practicante** | Contrato de prácticas (modalidad especial) |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Tiempo real (polling cada 30 segundos) |
| **Latencia de Datos** | Inmediata |
| **Historial Visible** | Últimos 100 contratos o últimos 90 días |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Timeline Vertical** | Lista cronológica de contratos, más recientes arriba |
| **Badge de Modalidad** | Color-coded por tipo de contrato (azul=full, verde=part, naranja=servicios) |
| **Información por Item** | Colaborador, modalidad, fecha de inicio, remuneración |
| **Gráfico de Distribución** | Pie chart de modalidades del período |
| **Metas vs. Real** | Comparación con objetivo de contrataciones |

### Visualización del Timeline

```
HOY
├── [TC] Juan Pérez - Tiempo Completo - S/ 5,000 - Inicio: 08/may
├── [MT] María García - Medio Tiempo - S/ 2,500 - Inicio: 05/may
├── [SV] Carlos López - Servicios - S/ 3,000 - Inicio: 01/may
├── [TC] Ana Torres - Tiempo Completo - S/ 4,500 - Inicio: 28/abr
├── [SV] Luis Mendoza - Servicios - S/ 2,000 - Inicio: 25/abr
...
hace 20 días
```

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Click en contrato** | Abre modal de detalle del contrato |
| **Filtro por modalidad** | Ver solo tiempo completo, solo servicios, etc. |
| **Filtro por fecha** | Selector de rango de fechas |
| **Búsqueda** | Buscar por nombre de trabajador |
| **Exportar** | Descargar CSV de contrataciones recientes |
| **Agrupar por semana** | Vista agregada por semana en lugar de individual |

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Comparar períodos** | Side-by-side vs. mes anterior |
| **Ver objetivos** | Mostrar meta de contrataciones vs. real |
| **Notificaciones** | Alerta cuando hay nuevas contrataciones |
| **KPI de tiempo de contratación** | Días promedio desde necesidad hasta contrato firmado |

### Casos de Uso

1. **Reporte de trabajadores**: Presentación semanal de nuevas contrataciones a dirección.
2. **Análisis de crecimiento**: Evolución del equipo mes a mes.
3. **Distribución por modalidad**: Análisis de flexibilidad laboral.
4. **Cumplimiento de metas**: Seguimiento de objetivos de contratación.
5. **Auditoría**: Verificar que las contrataciones siguen los procesos.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de RRHH** | Visibilidad de nuevas contrataciones y composición |
| **Director de RRHH** | Análisis de tendencias de contratación |
| **CEO** | Crecimiento del equipo y estructura |
| **Gerente de Finanzas** | Presupuesto de nuevas contrataciones |

### Decisiones Associadas

- Ajuste de presupuesto de contrataciones
- Decisiones de modalidad (full-time vs. servicios)
- Análisis de la estrategia de flexibilidad laboral
- Metas de crecimiento del equipo
- Asignación de recursos de RRHH

### Impacto Estratégico

El registro de nuevas contrataciones proporciona **visibilidad sobre el crecimiento del equipo**:

| Métrica | Importancia |
|---------|-------------|
| **Crecimiento de equipo** | Indicador de expansión del negocio |
| **Distribución por modalidad** | Estrategia de flexibilidad vs. compromiso |
| **Inversión en trabajadores** | Budget ejecutado en nuevas contrataciones |

Este dashboard permite:

- **Monitorear crecimiento** del equipo de manera actualizada
- **Analizar composición** por modalidad contractual
- **Comparar con objetivos** de contratación
- **Identificar tendencias** en preferencias de modalidad
- **Controlar presupuesto** de nuevas contrataciones

La diferenciación por modalidad es especialmente valiosa para entender la estructura de costos laborales y la flexibilidad del equipo.