# Claims ledger — Menú Low Carb Latino

Auditoría: 2026-08-11. Entorno: `https://menu.centrodigitalglobal.online`.

| Promesa pública | Superficie | Capacidad real | Evidencia | Estado |
|---|---|---|---|---|
| “7 días gratis” | Landing, paywall y checkout | Trial de Hotmart con acceso hasta `trial_ends_at` | Adhesión real `HP2140367396`, webhook 200, acceso y cancelación sin cobro | Verificado para mensual |
| “US$6.99/mes” | Landing y paywall | Oferta mensual Hotmart `2yk1rcvg` | Checkout real y plan `1367622` | Verificado |
| “US$69.90/año” | Landing y paywall | Oferta anual Hotmart `1x7js0ul` | Plan `1367623`; no se ejecutó adhesión anual E2E | Parcial / bloquea anual |
| “Tu menú y compra semanal, listos en tres elecciones” | Hero | El primer acceso valida y persiste las tres respuestas, deriva siete cenas y la compra mediante una operación atómica | Migración `20260811130000_personalized_week.sql`; 6/6 pruebas de personalización | Verificado |
| “Ajustaremos porciones” | Onboarding | Ingredientes y compra se escalan según 1, 2, 3, 4 o 5+ personas | Pruebas de escalado y consistencia del motor `curated-v2` | Verificado |
| “Quitando los ingredientes que elegiste” | Onboarding | El catálogo aplica exclusiones cerradas de huevo, lácteos y mariscos antes de crear la semana | 60 recetas curadas; la combinación más restrictiva conserva 12 alternativas | Verificado dentro de las exclusiones ofrecidas |
| “Lista de compras” | Landing y producto | La lista se deriva de las siete recetas, agrupa ingredientes y escala cantidades | Persistencia en `shopping_lists` y `shopping_items`; pruebas del motor | Verificado |
| “Cancela antes del cobro y no habrá cobro” | Landing, paywall y legal | Cancelación de Hotmart conserva acceso hasta fin del trial y detiene renovación | Cancelación real 2026-08-10; estado remoto `cancelled`, `cancel_at_period_end=true` | Verificado para trial mensual |
| “Recetas curadas; no inventadas por IA” | FAQ | Catálogo determinista de 60 recetas; no hay generación ni proveedor de IA | `lib/personalized-app.ts` y pruebas de unicidad/completitud | Verificado |
| “Acceso sin contraseña” | Login y email | Magic link PKCE de Supabase por SMTP Resend | Correo real entregado y sesión real verificada | Verificado |

## Veredicto

Los claims de pago, acceso, cancelación mensual y personalización están certificados. Siguen bloqueados para lanzamiento plenamente certificado la migración/prueba remota de privacidad, el ejercicio de restauración, la revisión jurídica y el recorrido anual E2E.
