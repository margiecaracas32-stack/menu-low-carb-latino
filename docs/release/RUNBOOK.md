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

## Objetivos provisionales

- RPO: no definido/certificado.
- RTO: no definido/certificado.
- Restore de base y backup externo: no probados; bloquean un lanzamiento plenamente certificado.
