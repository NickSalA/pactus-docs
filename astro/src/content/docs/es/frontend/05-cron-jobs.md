---
title: "Cron Jobs"
description: "Endpoints de cron jobs para notificaciones periódicas y warmup de la aplicación."
---

ContractIA utiliza **Vercel Cron** para ejecutar tareas programadas, como el envío de notificaciones de contratos próximos a vencer. Estos endpoints son protegidos y se comunican con el backend.

## Cron Jobs Disponibles

| Endpoint | Descripción | Programación |
|----------|-------------|-------------|
| `/api/cron/send-emails` | Envío de alertas de contratos por vencer | 8:00 AM Lima (0 13 * * * UTC) |
| `/api/cron/warmup` | Warmup de la aplicación | 12:00 AM Lima (0 5 * * * UTC) |

## send-emails

### Propósito

El endpoint `/api/cron/send-emails` envía notificaciones por email a los usuarios sobre contratos próximos a vencer. Se ejecuta diariamente a las 8:00 AM (hora de Lima). 
Las alertas enviadas por este proceso ahora respetan las **Reglas de Notificación** dinámicas (tiempos de pre-aviso, destinatarios) configuradas centralizadamente desde el **Panel de Administración** (`/admin/notifications/rules`).

### Programación

**Reloj Automático:** El sistema está configurado con un temporizador universal que le indica al servidor que debe despertar y ejecutar esta tarea todos los días, de forma ininterrumpida, exactamente a las 8:00 AM (hora local de Perú).

### Flujo

**Secuencia de la operación:**
1. El reloj del servidor principal en la nube (Vercel) marca la hora y "toca la puerta" de nuestra plataforma.
2. Nuestra plataforma le exige una "contraseña secreta" para verificar que efectivamente es nuestro servidor y no un ataque externo.
3. Al confirmar la identidad, la plataforma le da la orden al cerebro central (Backend) de preparar las alertas.
4. El cerebro central revisa los vencimientos y despacha los correos automáticamente a través del sistema de Gmail.

### Implementación

**Lógica de funcionamiento:** Esta pieza actúa como un puente de seguridad o peaje. Cuando recibe el llamado matutino, su primer y más importante trabajo es verificar la "llave secreta" del visitante. Si la llave es correcta, deja pasar el mensaje, le añade un sello de confianza propio, y se lo envía al servidor central para que dispare los correos. Si alguien sin la llave maestra intenta activar este enlace desde su navegador, el sistema bloquea la acción de inmediato con un mensaje de "No autorizado".

## warmup

### Propósito

El endpoint `/api/cron/warmup` mantiene las funciones Lambda "calientes" para evitar cold starts. Realiza un ping al backend para despertar el contenedor.

### Programación

**Reloj Automático:** Similar a las alertas por correo, este temporizador está programado para ejecutarse en la madrugada (12:00 AM, hora local de Perú).

### Implementación

**Lógica de funcionamiento:** A diferencia del envío de correos, este proceso es un simple "toque de queda". Verifica la llave de seguridad y luego envía un saludo rápido al servidor principal solo para mantenerlo despierto. No le importa si el servidor responde con los datos completos o si la conexión tarda un poco; su único objetivo es encender los motores del servidor (sacarlo del modo hibernación) para que cuando los empleados reales entren a la plataforma a la mañana siguiente, el sistema cargue al instante y no sufran tiempos de espera largos.

## Seguridad

### Header X-Cron-Secret

El frontend reenvía el secreto al backend mediante el header `X-Cron-Secret`, permitiendo que el backend autorice la petición internamente sin requerir un token JWT de usuario.

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `CRON_SECRET` | Secreto compartido entre Vercel y la app |
| `NEXT_PUBLIC_API_URL` | URL del backend FastAPI |

### Validación

**Control de acceso estricto:** Es la línea de defensa que compara la contraseña que trae la petición automática con la contraseña maestra guardada bajo llave en las variables de la plataforma. Si no coinciden a la perfección, se rechaza la orden de inmediato.

### header X-Cron-Secret

El frontend reenvía el secreto al backend mediante el header `X-Cron-Secret`, permitiendo que el backend autorice sin JWT.

## Configuración en Vercel

### vercel.json

**Manual de instrucciones para el alojamiento web:** Este es el documento oficial que lee nuestra plataforma en la nube (Vercel). Le instruye explícitamente: "En este proyecto tienes dos tareas programadas que no puedes olvidar. La ruta de los correos la vas a llamar a las 13:00 UTC (8:00 AM Perú), y la ruta de calentamiento de motores la vas a llamar a las 05:00 UTC (12:00 AM Perú)".

## Diferencias con Otros Endpoints

| Característica | Endpoints Normales | Cron Jobs |
|---------------|-------------------|----------|
| Autenticación | JWT (Bearer) | CRON_SECRET |
| Programación | Bajo demanda | Programada |
| Timeout | Default | maxDuration: 60s |
| Propósito | Interacción usuario | Tareas automate |

## Errores Comunes

| Error | Causa | Solución |
|-------|------|----------|
| 401 Unauthorized | CRON_SECRET incorrecto | Verificar variable en Vercel |
| 500 Backend error | Fallo en el backend | Revisar logs del backend |
| Timeout | Función fría | Usar warmup |

## Mejores Prácticas

1. **No exposing secrets**: El CRON_SECRET nunca se expone al cliente
2. **Retry logic**: Configurar reintentos en Vercel para fallos
3. **Logging**: Registrar ejecuciones en el backend
4. **Monitoring**: Alertas si el cron falla