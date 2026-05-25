ahora ---
title: "Implementación de Dashboards Analíticos"
description: "Documentación técnica sobre la arquitectura de paneles segmentados, visualización con Recharts y lógica de negocio para Manager y HR."
---

El sistema de dashboards de ContractIA ha sido rediseñado para ofrecer una experiencia analítica profunda basada en el rol del usuario. Utiliza **Recharts** para la visualización de datos y una estructura de hooks personalizados para gestionar múltiples fuentes de datos de forma eficiente.

## Arquitectura de Dashboards

La plataforma implementa dos vistas principales que consumen endpoints diferenciados según el tipo de contrato (Comercial vs. Laboral).

### 1. Dashboard Manager (`/dashboard/manager`)
Especializado en la gestión de contratos de tipo **COMPANY**. Proporciona una visión macro del rendimiento comercial y rankings de clientes.

### 2. Dashboard HR (`/dashboard/hr`)
Especializado en contratos de tipo **LABOR**. Se enfoca en el seguimiento de documentos operativos de recursos humanos y estados de vigencia de personal.

---

## Componentes de Visualización (Recharts)

Se utiliza **Recharts (v3.8.1)** como motor de renderizado. Los componentes están diseñados para ser responsivos y manejar estados de carga mediante *Skeletons*.

### DashboardAreaChart
Gráfico de áreas que visualiza tendencias temporales y proyecciones.
- **Proyecciones:** Implementa líneas punteadas para datos donde `is_forecast` es verdadero.
- **Dinamicidad:** Cambia de paleta de colores según el `documentType` (Emerald para Company, Red para Labor).
- **Formateo:** Soporte para moneda dual (PEN/USD) en el Tooltip.

### Rankings (Top Companies & Services)
Gráficos de barras verticales que permiten comparar volumen y valor monetario.
- **Métricas:** Botones de control para alternar entre `VOL` (cantidad de contratos) y `VALOR` (monto total).
- **Jerarquía:** Aplicación de degradados de opacidad (`fillOpacity`) basados en la posición del ranking.

### DashboardAlertCenter
Widget de gestión de estados críticos.
- **Categorización:** Pestañas dinámicas basadas en la proximidad de vencimiento (`due_to`).
- **Interactividad:** Navegación directa a la gestión de contratos al hacer clic en una alerta específica.

---

## Lógica de Datos y Hooks

La carga de datos se gestiona mediante hooks especializados que utilizan `Promise.all` para optimizar las peticiones al backend.

### Hooks de Página
- **`useDashboardManagerPage`**: Centraliza 5 peticiones simultáneas (AreaChart, Alerts, Recent, TopCompanies, TopServices).
- **`useDashboardHRPage`**: Orquesta la carga de 3 fuentes principales enfocadas en el sector laboral.

### Transformación de Datos (`dashboard-data.ts`)
Incluye funciones de utilidad como `buildRecentDocumentsFromAPI` que normalizan las respuestas crudas del servidor para que coincidan con la interfaz de usuario, manejando:
- Formateo de fechas relativas.
- Mapeo de estados de contratos.
- Asignación de etiquetas de subtítulos por defecto.

---

## Enrutamiento y Seguridad

### Redirección por Rol
El archivo `src/app/(main)/dashboard/page.tsx` no renderiza contenido, sino que actúa como un guardia de navegación (router dinámico) que evalúa los permisos, incluyendo el acceso a la consola de administración:

```typescript
useEffect(() => {
  if (!user?.role) return;

  if (user.role === "ADMIN" || user.role === "Administrador") {
    router.replace("/admin");
  } else if (user.role === "MANAGER") {
    router.replace("/dashboard/manager");
  } else {
    router.replace("/dashboard/hr");
  }
}, [user?.role, router]);
```

