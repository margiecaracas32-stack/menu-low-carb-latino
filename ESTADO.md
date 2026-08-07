# ESTADO — Menú Low Carb Latino
Última actualización: 2026-08-07 | Sesión actual: 7

⏸️ CHECKPOINT — Última acción completada: app interna construida y verificada técnicamente / Siguiente acción exacta: validación visual del usuario y, tras su aprobación, conexión de GitHub y Vercel

## Qué es esta app
## Seguimiento de acceso administrador (2026-08-07)
- Supabase confirma que la cuenta propietaria conserva `role = admin`; la prueba negativa del endpoint manual devuelve 403 sin sesión.
- La prueba positiva aún no cerró: el enlace abrió una pantalla pública y `last_sign_in_at` no cambió.
- Causa corregida: los enlaces de `/login` y de acceso manual ahora regresan directamente a `/auth/callback`; el reenvío desde `/` queda solo como compatibilidad. `tsc --noEmit` pasa.
- Supabase bloqueó temporalmente otro correo después de varias solicitudes. La prueba positiva queda pendiente de un enlace nuevo cuando se restablezca el límite.
- La clave privada no se copió a Windows porque el navegador integrado aísla su portapapeles. El código ahora rechaza valores que no cumplan el formato `sb_secret_...`; la clave real se guardará directamente en Vercel sin pasar por chat ni archivo local.

Planificador semanal low carb para mujeres latinas ocupadas que cocinan para su familia. Genera un menú práctico, permite sustituir recetas y crea una lista de compras consolidada. Modelo de suscripción por validar con señal real de pago.

## Promesa central
"Esta app ayuda a mujeres latinas ocupadas a resolver la alimentación low carb de su familia sin decidir cada día qué cocinar ni buscar recetas dispersas, mediante un menú semanal práctico y una lista de compras automática."

## Constitución del Producto (2026-08-03)
1. Usuario y situación: mujer latina de 35-55 años, ocupada, responsable de cocinar para su familia; usa la app al organizar la compra semanal y cada día antes de cocinar.
2. Problema y evitación: necesita reducir la carga de decidir, buscar y coordinar comidas; quiere evitar improvisación, repetición, pedidos de última hora, desperdicio e ingredientes difíciles.
3. Promesa: resolver la semana low carb familiar con platos conocidos, ingredientes comunes y compra organizada.
4. Primera victoria: en menos de 60 segundos, tras tres elecciones simples, ve un menú familiar de 7 días y una vista previa de su lista de compras; puede sustituir cualquier plato con un toque.
5. Tres flujos esenciales: (a) generar/adaptar semana; (b) abrir “Hoy” y cocinar o sustituir; (c) consolidar y marcar lista de compras.
6. Comportamientos prohibidos: nunca inventar valores nutricionales; nunca presentar contenido como tratamiento médico; nunca comprar, compartir o publicar sin permiso; nunca usar culpa, miedo o rachas punitivas; nunca mostrar una receta incompatible con alergias declaradas; nunca esconder renovación, precio o cancelación.

### Alcance núcleo derivado
- Generador de menú semanal personalizado.
- Vista diaria con receta accionable y sustitución inmediata.
- Lista de compras consolidada por categoría, con cantidades familiares.
- Biblioteca curada inicial de 60-80 recetas y favoritos/preferencias aprendidas.
- Superficie de retención: cumplimiento semanal ligero + menú siguiente mejor adaptado, sin conteo obligatorio de macros.

### Fuera del alcance inicial
- Comunidad/chat, escáner de alimentos, wearables, ayuno, conteo diario de macros, consejo médico, estimación por supermercado e integraciones de delivery.

## Reporte de validación (Sesión 1)
- Veredicto: VIABLE CON AJUSTES.
- Evidencia aportada: `IDEA DE LA APP.pdf`, `INVESTIGACION CLIENTE IDEAL.pdf` y `PROPUESTA VALOR.pdf`, revisados completos el 2026-08-03.
- Problema validado: la planificación semanal, la lista de compras y la reducción de carga mental tienen demanda demostrada.
- Apps de referencia: Mealime (4.8/5, 54K valoraciones, 7M+ usuarios declarados); Carb Manager (4.8/5, 727K valoraciones); KetoDiet (4.6/5 en App Store España); Menú Semanal Planificador (4.7/5, 581 valoraciones en App Store España); AutoMenú (competidor nuevo en español, 5 valoraciones).
- Corrección a la hipótesis original: sí existen competidores en español que generan menús y listas de compras; la brecha NO es solo idioma o automatización.
- Hueco defendible: experiencia enfocada en familias latinas + low carb flexible + ingredientes locales/comunes + reutilización inteligente para ahorrar + cero conteo obligatorio de macros.
- Quejas/oportunidades: complejidad y exceso de funciones; datos nutricionales contradictorios; recetas que no encajan con la rutina; fricción de suscripción/reembolso; necesidad de edición y sustitución simples.
- Precio de referencia observado: Mealime Pro US$2.99; Carb Manager alrededor de US$9.99/mes o US$39.99/año según referencias actuales; KetoDiet €14.99/mes o €89.99/año.
- Fuentes web revisadas 2026-08-03: App Store oficial de Mealime, Carb Manager, KetoDiet, AutoMenú y Menú Semanal Planificador; Hotmart Marketplace.
- GATE DE DEMANDA: PENDIENTE. No hay todavía señal de pago propia del avatar LATAM. Recomendación: landing con medición de clic a checkout en paralelo; no gastar en anuncios hasta obtener señal.

## Avatar y venta
- FICHA-AVATAR.md: existe y fue aprobada por el usuario el 2026-08-03.
- Resumen: “Ana”, 42 años, casada, dos hijos, trabaja o administra el hogar; dolor #1: decidir qué cocinar al final de un día agotador; deseo #1: abrir la app y tener la semana resuelta; consciencia dominante 3; sofisticación 4.
- Mensaje rector: no vender recetas; vender menos decisiones y una semana resuelta.
- Riesgo de claims: evitar prometer tratar diabetes, controlar glucosa o garantizar pérdida de peso; presentar organización alimentaria y contenido informativo, no consejo médico.

## Estrategia de monetización
- Modelo decidido: onboarding-first anónimo → preview personalizada → paywall → trial/checkout Hotmart → login para guardar y desbloquear.
- Evidencia: matriz C (fitness/nutrición) de 02C; app B2C con valor demostrable antes del pago, recurrencia semanal y sin viralidad que justifique freemium.
- Preview sin pago: tres elecciones simples → muestra 3 días completos del menú, ejemplos de sustitución y resumen de la compra; no exige cuenta.
- Paywall: desbloquea los 7 días, cantidades familiares, lista completa, sustituciones, favoritos y aprendizaje progresivo.
- Trial decidido: 7 días. Permite organizar una compra y vivir una semana real; fecha y monto del cobro visibles antes de iniciar y durante toda la prueba.
- Precio inicial PROPUESTO: US$6.99/mes | anual US$5.83/mes, cobrado US$69.90/año (2 meses gratis). Anual recomendado y preseleccionado; mensual es el ancla.
- Estado del precio: provisional hasta señal de WTP del gate de demanda. No gastar en ads ni llamarlo validado antes de medir.
- Sin créditos: el producto no vende generaciones; el menú se arma principalmente desde recetas curadas y reglas. Fair-use interno y costos se definirán con 30.
- Afiliados: máximo recomendado 35% recurrente o 50% solo del primer cobro; prohibido 50% recurrente sin nuevo gate económico.
- Puente de checkout: CTA directo a Hotmart; oferta/trial y origen preconfigurados; regreso a “Confirmando tu acceso” con verificación automática y ayuda si tarda.
- Puente D1-D7: D1 semana+compra completa · D2-D3 primer plato y preferencias aprendidas de sustituciones · D4-D5 progreso real visible (comidas/ingredientes marcados) · D6 aviso con fecha, monto y cancelación simple · D7 estado Pro y próxima semana mejor adaptada.

### Modelo unitario provisional (supuestos, no certificado)
- Base mensual US$6.99; tarifa Hotmart oficial consultada 2026-08-03 para microtransacción USD: 9.9% + US$0.10.
- Supuesto conservador de impuestos/retenciones: 10% del precio (depende del país del dueño y debe reemplazarse con dato real).
- Supuesto COGS IA+infra+email: US$0.60/usuario/mes; pendiente de arquitectura y estrés de usuario intensivo.
- Venta directa estimada: ingreso neto ~US$5.50; margen ~US$4.90 (89% del neto).
- Afiliado 35% del neto pos-Hotmart: ingreso neto estimado para el creador ~US$3.33; margen ~US$2.73 (82% del neto).
- Gate provisional: PASA bajo estos supuestos; NO certificado hasta conocer país fiscal, costo real de IA/infra, reembolsos y WTP.

## Gamificación y retención
- Loop: gatillo “necesito resolver la comida”/recordatorio elegido → abrir Hoy/Compras → plato claro + descubrimiento compatible → marcar/cambiar → preferencias y próxima semana mejoradas.
- Hipótesis de activación: usar la lista de compras + completar o cambiar al menos 3 comidas planificadas en los primeros 7 días predice retención D30.
- Mecánicas: progreso del onboarding · consistencia semanal · hitos significativos · insights/recetas compatibles variables.
- Sin racha diaria, XP, ligas, culpa ni comparación corporal. Se gamifica la semana resuelta, no el tiempo dentro de la app.

## Secuencia maestra de construcción
- Estado: Sesión 7, app interna construida y pendiente de validación visual del usuario.
- Ruta obligatoria: `/` → `/onboarding` → `/paywall` → `/login` → `/app`.
- Landing, onboarding, paywall, login y app interna: construidos localmente en `web/`; publicación y servicios comerciales: pendientes.
- PLAN-MAESTRO.md: creado y aprobado para ejecución el 2026-08-05.

## Decisiones técnicas
- Documento completo: `ARQUITECTURA.md` (2026-08-03), aprobado por el usuario.
- Framework: Next.js App Router; frontend, landing SEO y endpoints de servidor en un solo producto.
- Stack: React + TypeScript + Tailwind v4 + Supabase + Hotmart + Vercel; Resend en integraciones.
- Auth: Supabase passwordless por magic link/OTP al email de compra; Google secundario; estado anónimo versionado y migrado tras autenticar.
- Datos: modelo B2C por `user_id`, RLS deny-by-default, catálogo curado separado de datos privados, transacciones/idempotencia para menú, compra y pagos.
- Inteligencia: planificador determinista sobre recetas curadas; ninguna IA generativa puede inventar recetas, alergias, cantidades o nutrición.
- Secciones internas: Hoy · Semana · Compras · Recetas; ajustes en sheet/modal.
- Alcance: menú semanal; vista Hoy/sustitución; recetas curadas; lista de compras; favoritos/preferencias; progreso semanal ligero.

## Sesión en progreso 🔧
- Sesión 7 — app interna construida en `/app`, con navegación inferior compartida entre Hoy, Semana, Compras y Recetas.
- Hoy: cena protagonista, fotografía real cuando existe, receta paso a paso, sustitución inmediata y acción de completar sin rachas punitivas.
- Semana: calendario con fechas reales, siete cenas seleccionables y resumen ligero de progreso.
- Compras: lista consolidada por pasillos, progreso, marcado de productos y adición manual.
- Recetas: biblioteca inicial curada, búsqueda, filtros, favoritos y detalle. Los visuales abstractos identifican recetas sin fingir fotografías inexistentes.
- Estados cubiertos: carga, vacío, éxito, error de almacenamiento, controles desactivados y modo sin conexión.
- Persistencia de demostración: solo en desarrollo y mediante almacenamiento local versionado. En producción `/app` exige una sesión Supabase real; no existe bypass público.
- Persistencia definitiva preparada en `web/supabase/migrations/20260807200000_app_core.sql`: planes, comidas, compras, favoritos y progreso con RLS por usuario. La migración aún no se aplicó al proyecto remoto.
- Verificación técnica 2026-08-07: `tsc --noEmit` y build completo pasan; `/app` se clasifica como ruta dinámica protegida.
- Validación visual pendiente: requiere que el usuario abra `/app` y apruebe la experiencia antes de iniciar GitHub/Vercel.
- Sesión 6 — login y acceso passwordless.
- Investigación visual revisada el 2026-08-05: Mealime aporta jerarquía centrada en el plato y el flujo plan→compra; AnyList aporta organización familiar y lista accionable. Se contrastaron también los patrones de nutrición/bienestar ya documentados (Lifesum/YAZIO) sin copiar una sola marca.
- Arquetipo provisional: Cuidador con voz de mentor sereno; personalidad: cálida, clara, capaz. Modo claro derivado del estado emocional del avatar (llega cansada y necesita alivio, no intensidad).
- Mundo del sujeto aplicado: recetario familiar impreso, plato cotidiano, calendario semanal, lista de pasillos y marcas de lápiz; se traduce en papel/grano, formas de plato, cuadrícula y checks.
- Tres direcciones reales comparadas: A “Mesa editorial”; B “Ritmo sabroso”; C “Despensa precisa”.
- Identidad A+B aprobada por el usuario el 2026-08-05: base editorial cálida de A + jerarquía de acción y progreso de B, con saturación reducida para conservar un tono adulto.
- `FICHA-ARTE.md` creada y cerrada como contrato visual: Fraunces + Source Sans 3; crema, verde hoja, coral, mostaza y lima controlada; textura de recetario, plato editorial y esquinas recortadas; voz de mentor sereno.
- Landing creada con las 10 secciones canónicas, mockups honestos, planes anual/mensual, prueba de 7 días, FAQ y cuatro páginas legales provisionales.
- Headline y trazabilidad de copy documentados en `LANDING-COPY.md`; mecanismo bautizado: “Método Semana Resuelta”.
- Build verificado el 2026-08-05. Interacciones probadas: tabs, FAQ y rutas legales. Screenshot móvil 375px: `web/artifacts/landing-mobile.png`; screenshot desktop: `web/artifacts/landing-desktop-fold.png`.
- Revisión independiente: usabilidad/conversión 37/40; craft visual 17/20; copy 17/20. Gates aprobados. Se corrigieron los dos bloqueantes: anclajes de valor sin evidencia eliminados y focus/targets táctiles añadidos.
- Pendiente deliberado: CTA `/onboarding` se implementará en la siguiente etapa; Hotmart, publicación y textos legales definitivos permanecen en servicios externos.
- `/onboarding` construido con tres decisiones: tamaño del hogar, ingredientes a excluir y tiempo disponible; sin cuenta, sin email y con persistencia local versionada.
- Incluye reconocimiento, generación visible, estados disabled/loading/error/offline/success, preview de tres días, prueba explícita de preferencias, sustitución funcional en cada cena y resumen de compra.
- Flujo principal y bordes probados a 375px: selección múltiple, persistencia, doble pulsación, modo sin conexión, sustitución, CTA `/paywall` y cero overflow horizontal.
- Evidencia visual: `web/artifacts/onboarding-mobile-step-1.png`, `web/artifacts/onboarding-mobile-selected.png` y `web/artifacts/onboarding-mobile-preview.png`.
- Verificación final: `tsc --noEmit` y build pasan; servidor local responde 200 en `/onboarding`. Revisión independiente final: usabilidad 38/40 y craft 18/20, sin bloqueadores.
- El número de productos del preview es semilla demostrativa; deberá calcularse desde el motor real al conectar datos.
- `/paywall` construido con personalización recuperada del onboarding, visual de 3→7 días, planes anual/mensual seleccionables y timeline de prueba con fechas calculadas.
- Transparencia: anual US$5.83/mes con total US$69.90/año visible; mensual US$6.99/mes; 7 días gratis; primer cobro y recordatorio fechados; salida X/“Ahora no” en un toque y sin confirmshaming.
- Sin testimonios, garantía ni sello de pago seguro hasta que existan evidencia, política y checkout reales. El CTA simula localmente el traspaso a Hotmart y declara que no hubo cobro.
- Estados probados: selección, loading, demostración honesta, error sin conexión, restauración informativa y salida limpia. Screenshot 375px: `web/artifacts/paywall-mobile.png`; cero overflow.
- Verificación final: `tsc --noEmit` y build pasan; revisión independiente final: usabilidad 38/40, craft 18/20 y copy 19/20, sin bloqueadores.
- `/login` construido con correo como único dato obligatorio, enlace de un solo uso, Google secundario, loading, confirmación neutral, error offline y reenvío protegido por contador de 60 segundos.
- Seguridad local: no guarda el correo, tokens ni sesiones en `localStorage`; no incluye bypass a `/app`; usa confirmación anti-enumeración y no finge envío real. Supabase Auth/cookies HttpOnly/rate limit quedan obligatorios en servicios externos.
- El paywall ofrece ahora una continuación demostrativa explícita hacia `/login` después del paso Hotmart, sin fingir cobro.
- Evidencia 375px: `web/artifacts/login-mobile-empty.png` y `web/artifacts/login-mobile-sent.png`; cero overflow. Revisión independiente: usabilidad 38/40 y craft 18/20, sin bloqueadores. `tsc --noEmit` y build pasan.

## Próximas sesiones 📋
- Sesión 2: completada — direcciones A/B/C, combinación A+B aprobada y `FICHA-ARTE.md` cerrada.
- Sesión 3: completada — página de ventas aprobada al continuar hacia onboarding.
- Sesión 4: completada — onboarding aprobado al continuar hacia paywall.
- Sesión 5: completada — paywall aprobado al continuar hacia login.
- Sesión 6: completada — login/acceso passwordless construido y conectado a Supabase.
- Sesión 7: app interna construida y verificada técnicamente; pendiente de aprobación visual.

## Problemas conocidos ⚠️
- La afirmación “no existe una solución equivalente en español” no se sostiene con la evidencia actual.
- Las 200 recetas iniciales elevan costo editorial, verificación nutricional y responsabilidad; revisar alcance.
- La cifra de 18 productos del preview es demostrativa hasta conectar el motor real de recetas y compras.
- Falta señal directa de disposición a pagar del avatar LATAM.

## Pendientes del usuario
- [x] Constitución del Producto aprobada el 2026-08-03.
- [x] FICHA-AVATAR.md aprobada el 2026-08-03.
- [ ] Más adelante: indicar país fiscal al configurar Hotmart para reemplazar el supuesto de impuestos (no hace falta ahora).
- [x] Arquitectura funcional aprobada el 2026-08-03.
- [x] Plan Maestro aprobado para ejecución el 2026-08-05.
- [x] Identidad visual A+B y FICHA-ARTE.md aprobadas el 2026-08-05.

## Notas para la próxima sesión
- No diseñar UI ni programar antes de cerrar Constitución, FICHA-AVATAR y decisiones de Sesión 1.
- Mantener la promesa centrada en quitar carga mental; las recetas son infraestructura, no el producto.
- Landing actualizada con fotografía real aportada por el usuario para “Pollo guisado con calabacín”; recorte centrado en el plato dentro de la demostración del producto. Evidencia móvil a 375 px: `web/artifacts/landing-photo-mobile-375.png`. `tsc --noEmit` y build pasan (2026-08-05).
- Inicio de conexión de servicios externos (2026-08-05): preflight detectó que aún no hay remoto GitHub ni protección local de secretos. Se añadió `.gitignore` para excluir `.env*`, credenciales, dependencias y artefactos antes de conectar cuentas. Primer proveedor decidido: Supabase para datos y acceso.
- Supabase conectado a nivel público el 2026-08-05: proyecto `Menu Low Carb Latino`, project-ref `enwoecdftalhqzijrguv`, región AWS `us-east-2` (Ohio), plan nano/gratuito. Instalados `@supabase/supabase-js`, `@supabase/ssr` y CLI local; `.env.local` contiene solo URL y publishable key y está ignorado por Git. Helper `web/lib/supabase/client.ts` creado. Health de Auth responde 200 y `tsc --noEmit` pasa. No se solicitó ni almacenó service-role, password de DB ni access token.
- Base/Auth real aplicada en Supabase el 2026-08-05 mediante `web/supabase/migrations/20260805200000_auth_foundation.sql`: `profiles`, `households`, `dietary_preferences` y `subscriptions`, constraints, índices, trigger de perfil y RLS deny-by-default. Auditoría remota: RLS=true en 4/4 tablas; políticas: preferencias 4, hogar 4, perfiles 2, suscripciones 1 (solo lectura propia; escrituras de pago reservadas al servidor).
- Login passwordless conectado a Supabase con `shouldCreateUser:false`, confirmación anti-enumeración, callback PKCE server-side en `/auth/callback` y sesión por cookies; se eliminó Google simulado. El retorno usa el Site URL autorizado y reenvía códigos desde `/` al callback, evitando depender de una allowlist adicional que el dashboard devolvió 500 al intentar crear. Prueba negativa: correo de ejemplo inexistente rechazado (422) sin crear usuario. `tsc --noEmit` y build pasan; ruta dinámica `/auth/callback` detectada.

## Sesión 8 — panel privado del propietario (2026-08-07)
- Construido `/admin` en el orden aprobado: Ganancia real → Ventas → Usuarios → Errores → Costo de IA.
- El panel no inventa cifras: toda fuente todavía desconectada se muestra como `No medido` y explica qué falta conectar.
- Acceso protegido en el servidor: en producción exige sesión Supabase y `profiles.role = 'admin'`; una cuenta normal recibe 404. La vista sin sesión solo existe en desarrollo local para revisión.
- Migración preparada en `web/supabase/migrations/20260808200000_admin_backoffice.sql`: rol admin, origen de usuario, actividad, transacciones, costos operativos, costos de IA, errores y confirmaciones de pago; todas con RLS. Se revocó además la capacidad de un usuario normal de cambiar su propio rol o plan.
- Métricas reales preparadas: ingresos, costos y dinero que queda; ingreso mensual de suscripciones; compras/pruebas/cancelaciones; activación y regreso D1/D7/D30; camino hasta la compra; errores; costo de IA por función y usuario; ganancia por canal.
- Avisos automáticos preparados: IA >20% de ingresos, confirmaciones de pago fallidas, cancelación por pago fallido, margen negativo y canal que pierde dinero.
- Lenguaje final simplificado para el dueño; siglas técnicas no aparecen como requisito de lectura. En móvil permanece visible `Fuentes pendientes` y cada sección destaca una decisión principal.
- Evidencia final móvil: `web/artifacts/admin-profit-mobile-final.png`, `admin-sales-mobile-final.png`, `admin-users-mobile-final.png`, `admin-errors-mobile-final.png`, `admin-ai-mobile-final.png`.
- Verificación final: `tsc --noEmit` pasa; build completo pasa y `/admin` queda clasificada como ruta dinámica. Dev local revisado a 390×844 sin desbordamiento horizontal.
- Revisión visual final: APROBADO — usabilidad/claridad 38/40; acabado premium 18/20; sin bloqueadores. Observación menor: comprobar valores monetarios largos cuando existan datos reales.
- Pendiente deliberado: la migración administrativa aún no se aplicó al proyecto Supabase remoto y todavía no se asignó la primera cuenta admin. Hotmart, Sentry y el registro de costos de IA tampoco están conectados; por eso el panel muestra honestamente `No medido`.
- Próximo paso después de la revisión del usuario: aplicar la migración y asignar el correo del dueño como admin; luego continuar GitHub → Vercel.
- Mejora aprobada por el usuario: en Usuarios se añadió `Dar acceso manual` para resolver incidencias de pago o invitación. Solicita correo, duración y motivo; 30 días es la opción predeterminada.
- Seguridad del acceso manual: endpoint `/api/admin/manual-access` exclusivo para admin verificado en servidor, comprobación de origen, límite de solicitud, validación doble, clave secreta solo servidor y auditoría append-only. Una petición sin sesión devuelve 403.
- El acceso se guarda separado de Hotmart en `manual_access_grants`, puede ser de 7/30 días o permanente, se puede retirar y nunca elimina la cuenta. El acceso permanente exige confirmación expresa en interfaz y servidor; retirar también exige confirmación.
- La app interna usará `has_app_access()` en producción: permite administradores, suscripciones activas/prueba o un acceso manual vigente; si la comprobación falla, bloquea el producto y regresa al paywall.
- Evidencia móvil: `web/artifacts/admin-manual-access-mobile.png`, `admin-manual-access-form-mobile.png` y `admin-manual-access-permanent-confirm-mobile.png`; ancho 390 px, sin desbordamiento.
- Verificación: `tsc --noEmit` y build pasan; ruta API detectada. Revisión visual final: APROBADO — claridad 39/40 y acabado premium 18/20, sin bloqueadores.
- Pendiente externo: para que envíe invitaciones reales deben aplicarse la migración administrativa y la clave `SUPABASE_SECRET_KEY`; no se solicitó ni expuso esa clave durante esta etapa.
- Activación remota 2026-08-07: `20260808200000_admin_backoffice.sql` aplicada con éxito en el proyecto Supabase `enwoecdftalhqzijrguv` dentro de una transacción.
- Auditoría remota posterior: RLS activo en 9/9 tablas administrativas; políticas presentes en todas; funciones `is_admin` y `has_app_access` instaladas; el rol `authenticated` solo conserva UPDATE sobre `display_name`, `marketing_opt_in` y `timezone` en perfiles. No puede modificar rol, plan, estado ni origen.
- Pendiente inmediato: identificar el correo de la cuenta propietaria, asignarle `profiles.role = 'admin'`, conectar la clave privada solo en el servidor y probar acceso positivo/negativo.
- Cuenta propietaria creada/invitada el 2026-08-07 con el correo aprobado por la usuaria y `profiles.role = 'admin'` verificado (1 perfil actualizado). El correo se usa solo para autenticación privada y no se muestra públicamente.
- Se solicitó además un enlace passwordless desde `/login` para asegurar el flujo PKCE propio de la app. Pendiente que la usuaria abra el correo y complete la sesión; nunca se solicitaron contraseña ni códigos.
