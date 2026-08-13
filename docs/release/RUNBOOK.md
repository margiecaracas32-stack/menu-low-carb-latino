# Runbook operativo inicial

## 1. Compra aprobada pero no llega el acceso

Síntoma: Hotmart muestra 200 o reintentos y el comprador no recibe correo. Revisar Historial del webhook → `webhook_events` → Resend. Si el evento falló, reprocesarlo; si Resend falló, corregir SMTP y dejar que el 500 active el reintento. Nunca conceder acceso sin registrar motivo.

## 2. Webhook devuelve 401/422/500

- 401: verificar que HOTTOK coincida sin copiarlo al chat.
- 422: revisar producto, plan, moneda e importe; no ampliar allowlists para “hacerlo pasar”.
- 500: revisar `last_error_code`, corregir la causa y reprocesar el mismo evento.

## 3. Usuario pagó pero la app muestra el paywall

Confirmar correo de compra, estado y `access_until`. No cambiar roles. Usar `Dar acceso manual` solo como medida temporal, con duración y motivo, y retirar cuando el evento de Hotmart quede reconciliado.

## 4. Error general después de un despliegue

Detener cambios, identificar el último deploy `Ready`, promoverlo en Vercel y verificar `/`, `/login`, `/app` sin sesión y el GET del webhook. Documentar causa raíz antes de volver a desplegar.

## 5. Correos dejan de llegar

Revisar estado del dominio en Resend, DNS DKIM/SPF/MX y logs de entrega. No volver al SMTP de demostración de Supabase. Si hay una caída, informar al usuario y conservar el acceso para reintento.

## 6. Solicitud de descarga o eliminación

El usuario abre la letra de su perfil en `/app` y entra en **Cuenta y privacidad**. La exportación genera un JSON con datos del servidor y del dispositivo. La eliminación exige una sesión iniciada en los últimos 15 minutos y la frase exacta mostrada. Nunca borrar una cuenta desde el panel de Supabase como sustituto del flujo: se perdería la auditoría y podrían quedar datos vinculables.

## 7. Copia de seguridad y recuperación

El proyecto está en Supabase Free. Ese plan no incluye copias automáticas descargables. Antes de tráfico abierto:

1. Ejecutar un respaldo lógico con Supabase CLI usando `supabase db dump --linked` desde una sesión local autorizada; la contraseña se introduce únicamente en el prompt local y nunca en chat, archivo o argumento.
2. Guardar esquema, datos y roles en una carpeta cifrada fuera del equipo principal.
3. Restaurar la copia en un proyecto Supabase de prueba, aplicar las migraciones posteriores y verificar login, acceso, semana, webhook y RLS.
4. Repetir semanalmente mientras no existan compradores; cambiar a diario al abrir ventas.

Al primer ingreso recurrente se recomienda Supabase Pro para copias diarias administradas. Activar PITR solo con aprobación del gasto: su costo es materialmente mayor y no se necesita en esta etapa.

## Objetivos provisionales

- RPO objetivo actual: 24 horas antes de tráfico abierto; todavía no certificado.
- RTO objetivo actual: 4 horas; todavía no certificado.
- Restore de base y backup externo: procedimiento definido, ejecución cronometrada pendiente; bloquea un lanzamiento plenamente certificado.

## 8. Solicitud privada de ayuda

La persona abre su perfil en `/app` → **Cuenta y privacidad** → **Necesito ayuda**. El panel del dueño muestra las solicitudes abiertas en **Errores**, junto con un aviso automático. Responder antes de 24 horas hábiles y marcar la solicitud como resuelta solamente después de solucionar o explicar el caso. No pedir contraseñas, claves, números completos de tarjeta ni documentos sensibles por este canal.

Categorías: acceso, pago, producto y privacidad. Si el problema es un cobro, comprobar primero Hotmart y el webhook; si es acceso, usar acceso manual únicamente como respaldo temporal y registrar el motivo.
