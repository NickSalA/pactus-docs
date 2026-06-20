---
title: Arquitectura del Dashboard
description: Diseño y composición del módulo de dashboard, sus 8 mixinas de servicio y políticas de acceso.
---

El módulo de dashboard de **Pactus** expone 11 endpoints analíticos organizados en dos alcances (company y labor). La arquitectura sigue un patrón de **mixinas de servicio** que componen una sola clase `DashboardService`.

## Vista General

| Aspecto | Detalle |
|---|---|
| Endpoints | 11 endpoints GET |
| Alcances | COMPANY (gestores/workers) y LABOR (HR) |
| Autenticación | Bearer JWT (todos) |
| Autorización | Role-based via `ensure_dashboard_access()` |
| Fuente de datos | Read models con consultas de agregación en PostgreSQL |

## Domain Layer

### Value Objects

Definidos en `modules/dashboard/domain/value_objs.py`:

- **`DashboardContractScope`**: `COMPANY`, `LABOR`
- **`TopRankingSortBy`**: `VOLUME`, `VALUE`

### Access Policy

Definida en `modules/dashboard/domain/access_policy.py`:

```python
ALLOWED_DASHBOARD_TYPES_BY_ROLE = {
    UserRole.MANAGER: frozenset({DocumentType.COMPANY}),
    UserRole.WORKER: frozenset({DocumentType.COMPANY}),
    UserRole.HR: frozenset({DocumentType.LABOR}),
}
```

La función `ensure_dashboard_access()` valida que el rol del usuario tenga acceso al tipo de dashboard solicitado. Si no, lanza `DashboardForbiddenError`.

## Service Layer — 8 Mixinas

`DashboardService` hereda de 8 mixinas, cada una responsable de una familia de endpoints:

| Mixina | Archivo | Endpoints |
|---|---|---|
| `DashboardChartServiceMixin` | `charts.py` | `area_chart/company`, `area_chart/labor` |
| `DashboardAlertServiceMixin` | `alerts.py` | `alert_center/company`, `alert_center/labor` |
| `DashboardContractServiceMixin` | `contracts.py` | `recent_contracts/company`, `recent_contracts/labor` |
| `DashboardRankingServiceMixin` | `rankings.py` | `top_companies`, `top_services` |
| `DashboardRetentionServiceMixin` | `retention.py` | `retention/labor` |
| `DashboardOriginServiceMixin` | `origin.py` | `origin/labor` |
| `DashboardCompanyLoyaltyServiceMixin` | `loyalty.py` | `loyalty/company` |
| `DashboardServiceHelpers` | `helpers.py` | Constantes y helpers compartidos |

### Composición

```python
class DashboardService(
    DashboardServiceHelpers,
    DashboardChartServiceMixin,
    DashboardAlertServiceMixin,
    DashboardContractServiceMixin,
    DashboardRankingServiceMixin,
    DashboardRetentionServiceMixin,
    DashboardOriginServiceMixin,
    DashboardCompanyLoyaltyServiceMixin,
):
    def __init__(self, repository: DashboardRepository):
        self.repository = repository
```

Cada mixina accede al `self.repository` compartido para ejecutar consultas de agregación en PostgreSQL. No hay estado interno — todas son operaciones de solo lectura.

## Flujo de una Request

```
1. Request GET /dashboard/area_chart/company
2. → get_company_area_chart() en el router
3.   → ensure_dashboard_access(user, COMPANY)
4.     → si rol no tiene acceso: DashboardForbiddenError (403)
5.   → DashboardService.get_area_chart(user, COMPANY, currency?)
6.     → DashboardChartServiceMixin delega en DashboardRepository
7.       → consulta SQL de agregación sobre contracts + service_items
8.     → retorna AreaChartResponse
9. ← Response JSON 200
```

## Origen de Contratos

El dashboard de origen (`origin/labor`) clasifica los contratos por su procedencia:

| Valor en BD | Etiqueta en Dashboard |
|---|---|
| `google_drive` | Importación: Google Drive |
| (upload manual) | Carga manual |
