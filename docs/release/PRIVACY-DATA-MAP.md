# Mapa de privacidad y datos

Fecha: 2026-08-10.

| Dato | Finalidad | Sistema | Acceso | Retención / borrado |
|---|---|---|---|---|
| Correo | Identidad, acceso y relación con la compra | Supabase Auth, Resend, Hotmart | Usuario, proveedor y admin autorizado | Mientras exista cuenta/obligación; borrado E2E no certificado |
| Nombre | Identificación básica de compra | Hotmart, perfil Supabase | Propio usuario y admin | Igual que cuenta; política final pendiente de revisión profesional |
| Tamaño del hogar | Ajustar porciones | `households` | Solo usuario por RLS | Modelo existe; la app aún no lo escribe |
| Preferencias/exclusiones | Preparar el menú y avisar límites | `dietary_preferences` | Solo usuario por RLS | Modelo existe; la app aún no lo escribe |
| Estado de suscripción y transacciones | Acceso, soporte y contabilidad | Supabase + Hotmart | Usuario limitado/admin; webhook servidor | Ledger financiero conservado por obligación operativa/legal |
| Uso y fuente | Activación, retención y atribución | `event_log`, perfiles | Solo admin | Eventos de producto aún incompletos |
| Errores | Diagnóstico | `error_log` | Solo admin | Sentry no conectado; política de retención pendiente |
| Preferencias locales y progreso | Continuidad en el dispositivo | localStorage del navegador | Persona con acceso al dispositivo | Se elimina limpiando datos del navegador |

## Controles verificados

- RLS habilitado en tablas de usuario y administración.
- Claves privadas solo en servidor; `.env*` ignorado.
- HTTPS y cookies de sesión de Supabase.
- Admin autorizado por rol en servidor; usuario anónimo recibe 403/redirect.

## Bloqueantes

- Exportación y eliminación completa no probadas E2E.
- Consentimiento/versionado legal no implementado.
- Revisión profesional de privacidad aplicable a los países de venta pendiente.
- Las preferencias alimentarias todavía no llegan a la base; no afirmar personalización persistente.
