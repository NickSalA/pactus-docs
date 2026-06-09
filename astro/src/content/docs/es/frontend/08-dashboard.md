---
title: "Implementación de Dashboards Analíticos"
description: "Arquitectura de dashboards segmentados por rol con Recharts, widgets y hooks de datos."
---

El sistema de dashboards consume endpoints diferenciados según el tipo de contrato (COMPANY vs LABOR).

## Dashboards por Rol

### Manager Dashboard (`/manager/dashboard`)

Usa `useDashboardManagerPage` con **5 queries simultáneas**:

```typescript
const {
  areaChart,        // useAreaChartCompany
  alerts,           // useAlertCenterCompany
  recentContracts,  // useRecentContractsCompany
  topCompanies,     // useTopCompanies
  topServices,       // useTopServices
  isLoading,
  error,
  reload            // invalidateQueries({ queryKey: ['dashboard'] })
} = useDashboardManagerPage();
```

**Widgets:** AreaChart, AlertCenter, RecentDocuments, TopCompanies, TopServices

### HR Dashboard (`/hr/dashboard`)

Usa `useDashboardHRPage` con **3 queries simultáneas**:

```typescript
const {
  areaChart,        // useAreaChartLabor
  alerts,           // useAlertCenterLabor
  recentContracts,  // useRecentContractsLabor
  isLoading,
  error,
  reload
} = useDashboardHRPage();
```

**Widgets:** AreaChart, AlertCenter, RecentDocuments

## Widgets

### DashboardAreaChart

Gráfico de áreas con Recharts para visualizar tendencias temporales.

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `data` | `ApiDashboardAreaChartResponse` | Datos del gráfico |
| `isLoading` | `boolean` | Estado de carga |
| `documentType` | `ApiDocumentType` | COMPANY o LABOR |

**Características:**
- Nota al pie indicando que los datos proyectados son estimaciones (*)
- Paleta de colores según documentType (azul para COMPANY, rojo para LABOR)
- Tooltip con formato de moneda (PEN/USD)
- Gradient fill bajo la línea

### DashboardAlertCenter

Widget de alertas por estado de vencimiento.

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `alerts` | `ApiDashboardAlertCategory[]` | Categorías de alertas |
| `isLoading` | `boolean` | Estado de carga |

**Características:**
- Tabs dinámicos por proximidad de vencimiento (`due_to`)
- Navegación directa a gestión de contratos al hacer clic

### DashboardTopCompanies y DashboardTopServices

Gráficos de barras horizontales para rankings.

**Características:**
- Botones para alternar entre `VOL` (cantidad) y `VALOR` (monto)
- Degradados de opacidad basados en posición del ranking

### DashboardRecentDocumentsTable

Tabla de documentos recientes.

### DashboardWelcome

Mensaje de bienvenida personalizado con nombre del usuario.

## Utilidades (lib/utils.ts)

### COLORS

Paleta de colores por documentType:

| documentType | Color |
|-------------|-------|
| `COMPANY` | emerald |
| `LABOR` | red |

### buildRecentDocumentsFromAPI

Normaliza las respuestas crudas del API para el formato de UI:
- Formateo de fechas relativas
- Mapeo de estados de contratos
- Asignación de etiquetas por defecto

## Dashboards Estaticos vs Dinamicos

El sistema distingue entre dos tipos de visualizaciones:

| Caracteristica | Dashboards Estaticos | Dashboards Dinamicos (Chatbot) |
|----------------|---------------------|-------------------------------|
| **Ubicacion** | Paginas `/manager/dashboard`, `/hr/dashboard` | Ventana del chatbot |
| **Renderizado** | Widgets predefinidos (AreaChart, AlertCenter, etc.) | `ChartRenderer` con dispatch por tipo |
| **Tipos** | Solo area chart con datos forecast | `bar`, `line`, `pie` |
| **Actualizacion** | Manual via `reload()` | En respuesta a consultas |
| **Datos** | Endpoints dedicados por metricas | Embedidos en `ApiChatResponse.chart` |

Ver [Graficos Dinamicos en Chatbot](./09-graficos-dinamicos.md) para el motor de renderizado en el chatbot.
