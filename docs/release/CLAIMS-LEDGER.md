# Claims ledger — Menú Low Carb Latino

Auditoría: 2026-08-10. Entorno: `https://menu.centrodigitalglobal.online`.

| Promesa pública | Superficie | Capacidad real | Evidencia | Estado |
|---|---|---|---|---|
| “7 días gratis” | Landing, paywall y checkout | Trial de Hotmart con acceso hasta `trial_ends_at` | Adhesión real `HP2140367396`, webhook 200, acceso y cancelación sin cobro | Verificado para mensual |
| “US$6.99/mes” | Landing y paywall | Oferta mensual Hotmart `2yk1rcvg` | Checkout real y plan `1367622` | Verificado |
| “US$69.90/año” | Landing y paywall | Oferta anual Hotmart `1x7js0ul` | Plan `1367623`; no se ejecutó adhesión anual E2E | Parcial / bloquea anual |
| “Tu menú y compra semanal, listos en tres elecciones” | Hero | Onboarding recoge 3 respuestas, pero la app pagada no las consume | `app/onboarding/page.tsx` usa localStorage; `app/app/internal-app.tsx` usa `demo-data.ts` | Bloqueante |
| “Ajustaremos porciones” | Onboarding | Solo cambia el texto de la muestra; no persiste en `households` ni altera recetas reales | Búsqueda de código y modelo remoto preparado pero no conectado | Bloqueante |
| “Quitando los ingredientes que elegiste” | Onboarding | Solo filtra el copy de la muestra; la app pagada no aplica exclusiones | Búsqueda de código; `dietary_preferences` existe pero no se usa en la UI | Bloqueante |
| “Lista de compras” | Landing y producto | Existe una lista interactiva, pero es fija y local al dispositivo | `SHOPPING_ITEMS` y localStorage en la app interna | Parcial |
| “Cancela antes del cobro y no habrá cobro” | Landing, paywall y legal | Cancelación de Hotmart conserva acceso hasta fin del trial y detiene renovación | Cancelación real 2026-08-10; estado remoto `cancelled`, `cancel_at_period_end=true` | Verificado para trial mensual |
| “Recetas curadas; no inventadas por IA” | FAQ | Biblioteca estática definida por el producto; no hay generación de IA | `app/app/demo-data.ts`; no existe proveedor de IA conectado | Verificado |
| “Acceso sin contraseña” | Login y email | Magic link PKCE de Supabase por SMTP Resend | Correo real entregado y sesión real verificada | Verificado |

## Veredicto

Los claims de pago, acceso y cancelación mensual están certificados. La promesa principal de personalización está bloqueada hasta conectar onboarding → base de datos → semana/lista reales y probarla en producción.
