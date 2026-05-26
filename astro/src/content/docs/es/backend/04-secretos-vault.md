---
title: Secretos y Key Vault
description: Cómo se resuelve la configuración sensible del backend y qué rol cumple Azure Key Vault dentro del proyecto.
---

El backend de **Pactus** concentra su configuración en la clase `Settings` de `shared/config.py`, pero no trata todos los valores de la misma manera. Algunos se resuelven con defaults razonables y otros dependen de secretos externos.

## Punto Central de Configuración

La configuración del backend vive en:

- `Pactus-Backend/src/pactus_backend/shared/config.py`

Esa clase define parámetros para:

- base de datos
- Supabase
- Google OAuth
- modelos de IA
- Qdrant
- límites de archivo
- Gmail
- cron

## Registro de Secretos

El backend usa un registro intermedio de secretos mediante:

- `SecretsRegistry`
- `get_secret()`

Esto permite que la aplicación no dependa directamente, en cada acceso, de una implementación concreta de almacenamiento de secretos.

## Proveedor de Secretos Actual

El proveedor activo configurado en el proyecto es:

- `AzureKeyVaultProvider`

La inicialización actual apunta a este vault:

```text
https://contractai.vault.azure.net/
```

De este modo, el backend delega la resolución de secretos sensibles a Azure Key Vault.

## Secretos Relevantes del Proyecto

Entre los valores sensibles que hoy se resuelven desde Key Vault o desde el registro de secretos se encuentran:

- `GEMINI-API-KEY`
- `OPENAI-API-KEY`
- `AZURE-OPENAI-API-KEY`
- `QDRANT-API-KEY`
- `LLAMA-PARSE-API-KEY`
- `DATABASE-PASSWORD`
- `DATABASE-USER`
- `DATABASE-HOST`
- `SUPABASE-SECRET-KEY`
- `GOOGLE-CLIENT-SECRET`
- `CRON-SECRET`

## Qué Valores Tienen Default y Cuáles No

La configuración del backend mezcla tres tipos de valores:

### 1. Defaults operativos

Ejemplos:

- `PROJECT_NAME`
- `LOG_LEVEL`
- `INDEX_NAME`
- `SUPABASE_STORAGE_BUCKET`
- límites de tamaño o páginas

### 2. Variables requeridas con placeholder o valor abierto

Ejemplos:

- `SUPABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_REDIRECT_URI`
- `QDRANT_URL`

### 3. Secretos obtenidos desde el proveedor

Ejemplos:

- claves API
- secretos de base de datos
- secreto de cron

## Relación entre `.env`, Variables y Vault

La clase `Settings` usa `pydantic-settings`, por lo que la app puede leer variables desde `.env`. Sin embargo, varios campos usan `default_factory=lambda: get_secret(...)`, lo que significa que el valor real puede provenir de Key Vault incluso si existe una capa de configuración por entorno.

En términos prácticos, la resolución final depende de:

1. cómo esté configurado `SecretsRegistry`
2. qué secreto exista en el proveedor activo
3. qué variables estén presentes en el entorno

## Comportamiento de Arranque

La instancia global `settings = Settings()` se construye durante el arranque del backend. Si la validación de configuración falla, el sistema levanta un `RuntimeError` con el detalle del error de validación.

Esto es importante porque evita que la aplicación quede levantada con una configuración incompleta o inconsistente.

## Implicancia Operativa

Documentar el uso de secretos en este proyecto no consiste solo en decir que “usa Azure Key Vault”. También hace falta reflejar:

- qué clase centraliza la configuración
- qué secretos son críticos para operar
- qué valores se resuelven por defecto y cuáles no
- en qué punto del arranque se valida todo el conjunto

Ese contexto es el que vuelve mantenible la operación del backend en ambientes reales.
