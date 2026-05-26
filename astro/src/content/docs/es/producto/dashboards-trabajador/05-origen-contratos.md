---
title: Origen de Contratos
description: Distribución técnica y procedencia de carga de contratos laborales.
---

El dashboard de **Distribución de Origen de Contratos** visualiza la procedencia técnica y el método de carga de todos los contratos laborales vigentes en la organización.

Su objetivo principal es medir la adopción tecnológica y operativa del sistema, contrastando la carga manual frente al uso de automatizaciones.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/origin/labor` |
| **Rol requerido** | HR |

### Lógica de Cálculo
- Evalúa el campo de origen/tipo asociado a la entidad del documento.
- Consolida las subidas manuales, plantillas internas e importaciones desde nubes externas.

### Respuesta del Endpoint (Ejemplo)
```json
{
  "total_contracts": 25,
  "distribution": [
    { "origin_type": "Plantilla: Plazo Fijo", "count": 12, "percentage": 48.0 },
    { "origin_type": "Carga Manual", "count": 8, "percentage": 32.0 },
    { "origin_type": "Importación: Google Drive", "count": 5, "percentage": 20.0 }
  ]
}
```

## Métrica Principal y Distribución

El panel despliega el **Total de Contratos** administrados y una gráfica detallada (Donut Chart) que desglosa su procedencia en tres grandes categorías:

1. **Uso de Plantillas del Sistema:** Contratos que fueron generados y estandarizados internamente a través de las plantillas de ContractIA (ej. "Plantilla: Plazo Fijo"). Denotan alto control y cumplimiento legal.
2. **Carga Manual:** Documentos que han sido subidos manualmente a la plataforma desde fuentes externas locales.
3. **Importaciones Automatizadas (Cloud):** Contratos sincronizados directamente desde servicios de almacenamiento en la nube, tales como Google Drive, OneDrive o Dropbox.

## Valor de Negocio

Este módulo le permite al equipo de Operaciones y Recursos Humanos auditar cómo se alimenta el sistema. 

Si un gran porcentaje de contratos proviene de "Carga Manual", la gerencia puede impulsar iniciativas de capacitación para promover el uso de "Plantillas" e "Importaciones", reduciendo la fricción operativa, minimizando errores de digitación y garantizando la homogeneidad documental en la contratación.
