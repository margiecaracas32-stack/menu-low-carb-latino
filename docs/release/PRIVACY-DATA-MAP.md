# Mapa de privacidad y datos

Fecha: 2026-08-11.

| Dato | Finalidad | Sistema | Acceso | Retención / borrado |
|---|---|---|---|---|
| Correo | Identidad, acceso y relación con la compra | Supabase Auth, Resend, Hotmart | Usuario, proveedor y admin autorizado | Se elimina de Supabase al borrar la cuenta; Hotmart aplica su propia obligación legal |
| Nombre | Identificación básica de compra | Hotmart, perfil Supabase | Propio usuario y admin | Igual que cuenta; política final pendiente de revisión profesional |
| Tamaño del hogar | Ajustar porciones | `households` | Solo usuario por RLS | Modelo existe; la app aún no lo escribe |
| Preferencias/exclusiones | Preparar el menú y avisar límites | `dietary_preferences` | Solo usuario por RLS | Modelo existe; la app aún no lo escribe |
| Estado de suscripción y transacciones | Acceso, soporte y contabilidad | Supabase + Hotmart | Usuario limitado/admin; webhook servidor | Ledger financiero conservado por obligación operativa/legal |
| Uso y fuente | Activación, retención y atribución | `event_log`, perfiles | Solo admin | Se borra al eliminar la cuenta; eventos QA quedan separados |
| Errores | Diagnóstico | `error_log` | Solo admin | Se borran al eliminar la cuenta; no se registra PII deliberadamente |
| Consentimiento | Evidencia de autorización de servicio | `data_consents` | Propio usuario y servidor | Versionado; se elimina con la cuenta |
| Auditoría de privacidad | Probar exportación o borrado | `privacy_audit` | Solo admin | Hash irreversible, acción, estado y fecha; sin correo ni UUID |
| Solicitudes de ayuda | Resolver acceso, pago, producto o privacidad | `support_tickets` | Propio usuario y admin por RLS | Se elimina con la cuenta; límite de 1.000 caracteres y sin secretos solicitados |
| Preferencias locales y progreso | Continuidad en el dispositivo | localStorage del navegador | Persona con acceso al dispositivo | Se elimina limpiando datos del navegador |

## Controles verificados

- RLS habilitado en tablas de usuario y administración.
- Claves privadas solo en servidor; `.env*` ignorado.
- HTTPS y cookies de sesión de Supabase.
- Admin autorizado por rol en servidor; usuario anónimo recibe 401/403/redirect.
- Exportación ligada a la sesión: no acepta IDs de usuario aportados por el cliente.
- Eliminación exige sesión reciente, frase exacta y protege la cuenta propietaria.
- La app no usa IA generativa y no transfiere preferencias a proveedores de IA.
- El soporte privado exige sesión, mismo origen, categorías cerradas y límite de frecuencia; el dueño accede mediante rol admin verificado en servidor.

## Bloqueantes

- Exportación y eliminación implementadas y migración aplicada; falta cerrar la prueba E2E con una cuenta controlada después del despliegue.
- Consentimiento de servicio versionado implementado y migración aplicada; falta prueba funcional remota.
- Revisión profesional de privacidad aplicable a los países de venta pendiente.
- La eliminación en Hotmart se rige por su retención legal; eliminar la app no cancela la suscripción.
