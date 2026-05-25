# Guía de Integración Frontend - Dashboards Analíticos

Esta guía proporciona al **equipo de Frontend** toda la especificación técnica, estructuras JSON de ejemplo, reglas de negocio y sugerencias de UI/UX para implementar de manera fluida y exitosa los tres nuevos dashboards analíticos de ContractAI:
1.  **Dashboard de Retención de Talento Laboral** (HR Analytics)
2.  **Dashboard de Distribución de Origen de Contratos** (HR Analytics)
3.  **Dashboard de Fidelidad de Clientes B2B (Company)** (Commercial Analytics)

---

## 🔒 1. Matriz de Autorización y Rutas API

Todos los endpoints requieren un token JWT válido en las cabeceras (`Authorization: Bearer <token>`). La API aplica control de acceso basado en roles (RBAC) estricto:

| Endpoint | Método HTTP | Roles Autorizados | Propósito |
| :--- | :--- | :--- | :--- |
| `/api/dashboard/retention/labor` | `GET` | `HR` | KPIs, distribución y cohortes de retención de trabajadores. |
| `/api/dashboard/origin/labor` | `GET` | `HR` | Distribución de origen (plantillas, subidas, nubes) de contratos labor. |
| `/api/dashboard/loyalty/company` | `GET` | `MANAGER`, `WORKER` | KPIs, permanencia, cohortes y estatus de cuentas B2B. |

> [!WARNING]
> Si un usuario con rol de `HR` intenta acceder a `/loyalty/company`, o si un `MANAGER` / `WORKER` intenta acceder a los endpoints `/labor`, la API responderá automáticamente con un código de estado **`HTTP 403 Forbidden`**. El frontend debe manejar esto redirigiendo a una vista de "Acceso Denegado" o mostrando un banner premium de restricción de permisos.

---

## 📊 2. Dashboard de Retención de Talento Laboral (`/retention/labor`)

Este módulo analiza la permanencia de los trabajadores mediante la acumulación de sus contratos firmados a lo largo del tiempo.

### 📥 Estructura del JSON de Respuesta
```json
{
  "kpis": {
    "active_retention_rate": 83.33,
    "total_unique_workers": 12,
    "avg_contracts_per_worker": 2.25
  },
  "tenure_distribution": [
    {
      "contracts_count": 1,
      "workers_count": 5
    },
    {
      "contracts_count": 2,
      "workers_count": 4
    },
    {
      "contracts_count": 3,
      "workers_count": 2
    },
    {
      "contracts_count": 4,
      "workers_count": 1
    }
  ],
  "renewal_trend": [
    {
      "month": "Dic 25",
      "renewal_rate": 80.0,
      "total_expired": 5,
      "total_renewed": 4
    },
    {
      "month": "Ene 26",
      "renewal_rate": 100.0,
      "total_expired": 3,
      "total_renewed": 3
    }
  ],
  "details": [
    {
      "worker_name": "Juan Pérez",
      "worker_document_number": "12345678",
      "contracts_count": 3,
      "first_contract_start": "2024-01-15",
      "latest_contract_end": "2026-06-30"
    }
  ]
}
```

### 🎨 Receta de UI/UX y Gráficos recomendados
1.  **Tarjetas KPI (Sección Superior):**
    *   *Tasa de Retención Activa (`active_retention_rate`):* Renderizar dentro de un círculo de progreso radial (Semi-donut) con color turquesa/verde. Representa del total de trabajadores con contrato activo, qué porcentaje tiene un historial de 2 o más contratos.
    *   *Total de Trabajadores Únicos (`total_unique_workers`):* Número plano destacado.
    *   *Contratos Promedio (`avg_contracts_per_worker`):* Número decimal sutil.
2.  **Distribución de Permanencia (`tenure_distribution`):**
    *   *Gráfico:* **Barras Verticales (Bar Chart)**.
    *   *Eje X:* `contracts_count` (e.g., "1 Contrato", "2 Contratos", "3 Contratos", "4+ Contratos").
    *   *Eje Y:* `workers_count`.
    *   *Tip:* Usar degradados en las barras para un look moderno (HSL tailored colors).
3.  **Tendencia de Renovación Mensual (`renewal_trend`):**
    *   *Gráfico:* **Área Sombreada con Línea Flotante (Area + Line Chart)**.
    *   *Eje X:* `month`.
    *   *Eje Y Izquierdo (Línea):* Tasa de Renovación (`renewal_rate` de 0% a 100%).
    *   *Eje Y Derecho (Barras de Fondo):* Volumen de contratos vencidos (`total_expired`) vs renovados (`total_renewed`).
4.  **Tabla Detallada (`details`):**
    *   Una grilla interactiva que permite filtrar por nombre o número de documento.
    *   *Cálculo Dinámico en Frontend:* Calcular la antigüedad de la relación (diferencia entre hoy y `first_contract_start`) para desplegar un badge de categoría (e.g. "Legacy Worker" para > 2 años).

---

## 🍩 3. Dashboard de Origen de Contratos Laborales (`/origin/labor`)

Muestra la procedencia técnica y el método de carga de todos los contratos laborales vigentes en la organización.

### 📥 Estructura del JSON de Respuesta
```json
{
  "total_contracts": 25,
  "distribution": [
    {
      "origin_type": "Plantilla: Plazo Fijo",
      "count": 12,
      "percentage": 48.0
    },
    {
      "origin_type": "Carga Manual",
      "count": 8,
      "percentage": 32.0
    },
    {
      "origin_type": "Importación: Google Drive",
      "count": 5,
      "percentage": 20.0
    }
  ]
}
```

### 🎨 Receta de UI/UX y Gráficos recomendados
1.  **Métrica Principal:**
    *   *Total de Contratos (`total_contracts`):* Ubicar en el centro del gráfico Donut.
2.  **Gráfico de Distribución (`distribution`):**
    *   *Gráfico:* **Donut Chart Interactivo (Glassmorphic Donut)**.
    *   *Valores:* `percentage` como porción del arco, `origin_type` como leyenda y `count` como tooltip.
    *   *Paleta de Colores Sugerida:*
        *   `Plantilla: *` -> Tonos de azul/morado (denota control y cumplimiento).
        *   `Carga Manual` -> Tonos grises o ámbar (procesos externos).
        *   `Importación: *` -> Tonos verdes/cyan (automatización de nubes).

---

## 📈 4. Dashboard de Fidelidad de Clientes B2B (`/loyalty/company`)

Este módulo analiza la recurrencia contractual y longevidad de nuestras relaciones con empresas clientes (contrapartes de contratos de tipo `COMPANY`).

### 📥 Estructura del JSON de Respuesta
```json
{
  "kpis": {
    "active_retention_rate": 66.67,
    "total_unique_clients": 12,
    "avg_contracts_per_client": 2.83
  },
  "tenure_distribution": [
    {
      "contracts_count": 1,
      "clients_count": 4
    },
    {
      "contracts_count": 2,
      "clients_count": 3
    },
    {
      "contracts_count": 3,
      "clients_count": 3
    },
    {
      "contracts_count": 4,
      "clients_count": 2
    }
  ],
  "renewal_trend": [
    {
      "month": "Abr 26",
      "renewal_rate": 85.71,
      "total_expired": 7,
      "total_renewed": 6
    },
    {
      "month": "May 26",
      "renewal_rate": 90.0,
      "total_expired": 10,
      "total_renewed": 9
    }
  ],
  "details": [
    {
      "client_name": "Globex Corporation",
      "ruc": "20556677881",
      "contracts_count": 6,
      "first_contract_start": "2023-01-15",
      "latest_contract_end": "2026-12-31"
    },
    {
      "client_name": "Initech Soft",
      "ruc": null,
      "contracts_count": 1,
      "first_contract_start": "2026-02-15",
      "latest_contract_end": "2026-05-30"
    }
  ]
}
```

### 🎨 Receta de UI/UX y Gráficos recomendados
1.  **Tarjetas KPI (Storytelling Comercial):**
    *   *Tasa de Retención Activa (`active_retention_rate`):* La métrica reina. Muestra qué porcentaje de clientes activos tienen contratos múltiples firmados. Gráfica en verde brillante.
    *   *Clientes Únicos (`total_unique_clients`):* Tamaño de tu portafolio de clientes recurrentes.
2.  **Distribución de Permanencia Comercial (`tenure_distribution`):**
    *   *Gráfico:* **Gráfico de Barras Horizontales Apiladas (Horizontal Stacked Bar)** o **Gráfico de Embudo (Funnel Chart)**.
    *   Permite ver la solidez de las cuentas comerciales. Las cuentas en `contracts_count: 4` son clasificadas como **"Socios de Legado (Key Accounts)"** en la interfaz.
3.  **Semáforo de Cuentas Activas/Inactivas (Tabla interactiva `details`):**
    *   *Columna RUC:* Si viene como `null`, desplegar una etiqueta sutil de "Sin RUC".
    *   *Lógica del Frontend para Alerta de Riesgo comercial (Churn Risk):*
        *   Si `latest_contract_end` es menor que la fecha de hoy: Desplegar badge **Rojo / Inactivo** 🔴 (La cuenta expiró sin renovación inmediata, potencial cuenta perdida).
        *   Si `latest_contract_end` está dentro de los próximos 60 días: Desplegar badge **Ámbar / En Riesgo de Vencer** 🟡 (Alerta al equipo comercial para iniciar la renovación).
        *   Si `latest_contract_end` está a más de 60 días en el futuro: Desplegar badge **Verde / Activo** 🟢 (Relación comercial estable).

---

## 🛠️ 5. Estados de Error y Mensajes de Carga (UX Premium)

Para lograr una experiencia de usuario sumamente profesional y fluida, implementen los siguientes estados:

### A. Estados Vacíos (Empty States)
*   **Cuándo ocurre:** Cuando `total_unique_clients` o `total_unique_workers` es `0`.
*   **UI sugerida:** No rendericen gráficos vacíos o rotos. Muestren una ilustración moderna vectorizada con el texto: *"No hay contratos suficientes para calcular métricas de retención en este periodo"* y un botón de llamada a la acción ("Crear Contrato").

### B. Manejo de Errores de Base de Datos / Red
*   `HTTP 503 (Database Unavailable)` o `HTTP 500 (Internal Error)`:
    *   El backend captura caídas o timeouts de la base de datos y los expone con mensajes amigables como `"El servicio de base de datos no está disponible."`.
    *   **UI sugerida:** Muestren un componente de alerta en rojo suave con un botón de "Reintentar" para refrescar la llamada de la API.
