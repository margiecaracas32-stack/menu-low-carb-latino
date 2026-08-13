# Certificado de publicación

Estado: **bloqueado para apertura pública**. Fecha: 2026-08-11.

## Infraestructura comprobada

- Repositorio privado en GitHub conectado a Vercel.
- Aplicación desplegada desde la carpeta `web`.
- Dominio final con HTTPS: `https://menu.centrodigitalglobal.online`.
- Supabase target: `enwoecdftalhqzijrguv`.
- Site URL y callback del dominio final configurados.
- Segundo despliegue automático previo comprobado en Vercel.
- Producción sin sesión: `/app` → 307 `/login`; `/admin` → 307 `/login?next=%2Fadmin`; API admin → 403.
- Webhook: `ready=true`, `mode=live`.

## Release auditada localmente

- Next.js 16.2.11, Sharp 0.35.0 y PostCSS 8.5.25.
- Auditoría de dependencias: 0 vulnerabilidades conocidas.
- TypeScript: aprobado.
- ESLint: aprobado sin errores ni advertencias.
- Hotmart: 10/10 pruebas; personalización: 6/6; privacidad: 3/3.
- TypeScript y ESLint: aprobados después de la capa de privacidad y soporte.
- Último build completo aprobado antes de la capa de soporte: 16 rutas. La repetición local posterior quedó bloqueada exclusivamente por descarga de Google Fonts en el entorno de auditoría; requiere repetición en Vercel.

## Pendiente para completar este certificado

1. Aplicar `20260811210000_privacy_operations.sql` y probar consentimiento, exportación, soporte y borrado con una cuenta controlada.
2. Ejecutar y restaurar una copia lógica de Supabase; registrar RPO/RTO reales.
3. Obtener revisión jurídica profesional de los textos de privacidad y términos para los países de venta.
4. Repetir build en Vercel, commit, push, despliegue y verificación del mismo SHA auditado.
5. El plan anual continúa sin una adhesión E2E; no autorizar publicidad del anual como recorrido certificado hasta probarlo con aprobación de gasto.

No existe autorización de venta pública mientras algún punto siga pendiente.
