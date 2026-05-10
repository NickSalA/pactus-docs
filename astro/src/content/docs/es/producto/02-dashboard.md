---
title: Dashboard
description: Panel principal de ContractIA con métricas, documentos recientes y acciones rápidas.
---

El **Dashboard** es el punto de entrada principal de ContractIA tras la autenticación. Proporciona una vista consolidada del estado de los contratos y accesos directos a las funcionalidades más importantes del sistema.

## Estructura del Dashboard

El Dashboard se organiza en tres secciones principales:

| Sección | Descripción |
|---------|-------------|
| **Bienvenida Personalizada** | Saludo con el nombre del usuario conectado |
| **Cuadrícula de Métricas** | Indicadores clave del estado de la cartera de contratos |
| **Tabla de Documentos Recientes** | Últimos contratos modificados con acceso rápido |
| **Acciones Rápidas** | Botones para crear contrato o importar desde Google Drive |

## Métricas del Sistema

El Dashboard presenta cuatro indicadores principales que reflejan el estado de la cartera de contratos:

| Métrica | Descripción | Cálculo |
|---------|-------------|---------|
| **Total de Contratos** | Cantidad total de contratos en la organización | Contaje de todos los documentos |
| **Próximos a Vencer** | Contratos cuya fecha de fin está en los próximos 30 días | Filtro por estado EXPIRING |
| **Contratos Activos** | Contratos vigentes con estado ACTIVE | Filtro por estado ACTIVE |
| **Contratos Vencidos** | Contratos cuya fecha de fin ya pasó | Filtro por estado EXPIRED |

## Documentos Recientes

La tabla de documentos recientes muestra los últimos contratos modificados en la organización:

| Columna | Descripción |
|--------|-------------|
| **Nombre** | Título del contrato |
| **Cliente** | Nombre del cliente o trabajador |
| **Tipo** | LABOR o COMPANY |
| **Estado** | Estado actual del contrato |
| **Fecha de Inicio** | Fecha de inicio del contrato |

La tabla soporta paginación y ordenamiento por columnas.

## Acciones Rápidas

El Dashboard proporciona dos acciones rápidas principales:

| Acción | Descripción |
|--------|-------------|
| **Crear Nuevo Contrato** | Abre el formulario de creación de contrato con wizard de 4 pasos |
| **Importar desde Google Drive** | Abre el selector de archivos de Google Drive para importar contratos |

## Dashboards Ejecutivos

El Dashboard operativo proporciona una visión general básica. Para análisis executives profundos, consulte los módulos de dashboards especializados:

| Módulo | Descripción | Destinado a |
|--------|-------------|-------------|
| [Dashboards de Empresa](/es/producto/07-dashboards-empresa) | Análisis de clientes B2B, ingresos proyectados, alertas y retención | CFO, Director Comercial, CEO |
| [Dashboards de Trabajador](/es/producto/08-dashboards-trabajador) | Gestión de RRHH, gasto de planilla, alertas y retención de trabajadores | Director RRHH, CFO, Gerente Legal |

Estos módulos proporcionan Ficha Técnica, Guía de Funcionalidad y Valor de Negocio para la toma de decisiones estratégicas.

## Flujo de Navegación

```
Login → Dashboard → [Acciones]
                      ↓
           ┌────────────┼────────────┐
           ↓            ↓            ↓
      Contratos    Agente IA    Administración
```

El Dashboard actúa como hub central desde el cual el usuario puede navegar a cualquier módulo del sistema mediante la barra lateral de navegación.