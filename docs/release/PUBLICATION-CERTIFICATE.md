# Certificado de publicación

Estado: **bloqueado para apertura pública**. Fecha: 2026-08-10.

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
- Hotmart: 10/10 pruebas.
- Build de producción: aprobado, 13 rutas.

## Pendiente para completar este certificado

1. Implementar y probar la personalización real del producto.
2. Conectar observabilidad y soporte operativo.
3. Resolver los casos de pago no verificados definidos en `PAYMENT-CERTIFICATION.md`.
4. Commit, push, despliegue y verificación del mismo SHA auditado.
5. Ejecutar una segunda publicación automática de prueba y registrar ambos IDs de despliegue.

No existe autorización de venta pública mientras algún punto siga pendiente.
