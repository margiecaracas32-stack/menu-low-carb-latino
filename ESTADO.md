# ESTADO — Menú Low Carb Latino
Última actualización: 2026-08-11 | Sesión actual: 14

🔧 CHECKPOINT — Última acción completada: analítica de producto y observabilidad compiladas con migración remota aplicada / Siguiente acción exacta: publicar, verificar eventos reales y cerrar revisión visual del panel

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

## Sesión 9 — publicación y conexión segura (2026-08-09)
- Repositorio privado publicado en GitHub y proyecto desplegado en Vercel desde la carpeta `web`.
- Dominio de producción verificado: `https://menu-low-carb-latino.vercel.app`.
- Variables públicas de Supabase y `SUPABASE_SECRET_KEY` configuradas en Vercel; la clave privada permanece únicamente en el entorno del servidor.
- Incidente contenido: una clave privada anterior quedó potencialmente expuesta durante la configuración. Se creó `menu_low_carb_latino_vercel`, se activó en Vercel y se revocaron de forma irreversible las dos claves antiguas `menu_low_carb_latino_servidor` y `menu_low_carb_latino_servidor_`. La clave nueva no fue mostrada en el chat ni registrada en el repositorio.
- Republicación posterior a la rotación completada con estado `Ready` en Vercel.
- Supabase Auth actualizado: Site URL `https://menu-low-carb-latino.vercel.app`; redirects autorizados para producción y desarrollo en `/auth/callback`.
- Evidencia externa: landing de producción renderiza el titular principal; `/login` carga con su formulario; una petición sin sesión a `/api/admin/manual-access` devuelve HTTP 403.
- Pendiente inmediato: completar una entrada passwordless real con el correo propietario y verificar `/admin` con sesión; después probar una concesión manual controlada sin enviar invitaciones a terceros.
- Verificación propietaria completada el 2026-08-09: Supabase registró el inicio de sesión passwordless y la propietaria abrió `/admin` desde Safari móvil. La captura aportada confirma acceso al panel real, navegación Ganancia/Ventas/Usuarios/Errores/IA y estado honesto sin cifras inventadas. El acceso negativo sin sesión continúa respondiendo HTTP 403.
- Siguiente comprobación: probar `Dar acceso manual` con una cuenta controlada, confirmar la auditoría y retirar después el acceso de prueba.
- Prueba controlada de acceso manual 2026-08-09: se usó el alias propietario `margie.caracas32+prueba@gmail.com`, duración 7 días y motivo de prueba. Supabase rechazó el envío con HTTP 429 `email rate limit exceeded`; el endpoint revocó automáticamente el permiso y mostró que no se concedió acceso. No quedó un grant activo.
- Causa raíz confirmada en Auth Logs: el SMTP integrado de Supabase está limitado actualmente a 2 mensajes por hora, restringe destinatarios y no es apto para producción. Decisión: conectar SMTP propio con Resend antes de repetir la prueba; plan inicial propuesto $0 (hasta 3.000 correos/mes y 100/día según la documentación oficial consultada el 2026-08-09).
- Dependencia del usuario: para configurar Resend hace falta una cuenta y un dominio propio verificado. No comprar ni configurar un dominio sin aprobación expresa del usuario.
- Dominio existente confirmado: `centrodigitalglobal.online`, registrado en Namecheap y con WordPress activo en la raíz. Para no afectar ese sitio se decidió usar el subdominio `menu.centrodigitalglobal.online` para la app.
- DNS administrado por el hosting Koryfi (`ns.koryfiserver.com/.net/.org`), no por Namecheap BasicDNS. Se conservan los Nameservers; el usuario añadió en cPanel Zone Editor el CNAME `menu` → `50f245766558dac3.vercel-dns-017.com`.
- Verificación 2026-08-09: Vercel aceptó el DNS, generó HTTPS y `https://menu.centrodigitalglobal.online` renderiza la landing real.
- Supabase Auth actualizado: Site URL principal `https://menu.centrodigitalglobal.online`; redirect añadido `https://menu.centrodigitalglobal.online/auth/callback`. Se conservan el callback de Vercel y localhost como respaldo y desarrollo.
- Próximo paso: crear cuenta gratuita de Resend, verificar el dominio/subdominio de envío mediante registros DNS en Koryfi cPanel y configurar SMTP personalizado en Supabase; después repetir la prueba de acceso manual.
- Resend conectado el 2026-08-09: cuenta gratuita creada con la cuenta propietaria y dominio `menu.centrodigitalglobal.online` verificado. DNS público confirmado: DKIM TXT, SPF TXT y MX de retorno en `us-east-1`.
- Se creó una clave Resend restringida a `Sending access` y al dominio verificado; fue transferida directamente a Supabase sin mostrarse en el chat ni guardarse en el repositorio.
- Supabase Auth usa SMTP personalizado: remitente `acceso@menu.centrodigitalglobal.online`, nombre `Menú Low Carb Latino`, host `smtp.resend.com`, puerto 465 y usuario `resend`. Configuración guardada sin errores.
- Prueba real desde `https://menu.centrodigitalglobal.online/login`: solicitud de enlace aceptada y correo marcado `Delivered` en Resend. El límite del SMTP de demostración quedó sustituido.
- Pendiente inmediato: repetir `Dar acceso manual` para `margie.caracas32+prueba@gmail.com`, comprobar el grant/auditoría y retirarlo después.
- Prueba de acceso manual cerrada el 2026-08-09: el panel mostró 1 acceso vigente, Resend entregó el correo al alias propietario, el dueño retiró el acceso y el contador volvió a 0.
- Limpieza autorizada: la cuenta Auth temporal `margie.caracas32+prueba@gmail.com` fue eliminada; la cuenta propietaria permaneció intacta.
- Hallazgo de auditoría: las claves foráneas originales usaban `on delete cascade`, por lo que borrar la cuenta temporal eliminó también sus filas de grant/evento. La evidencia de esta prueba permanece en este reporte, pero esas filas de prueba ya no están en la base.
- Causa raíz corregida y aplicada remotamente mediante `20260809160000_preserve_manual_access_audit.sql`: `manual_access_grants.user_id` y `manual_access_events.target_user_id` ahora usan `on delete set null`, conservando correo, motivo, actor y fechas cuando un usuario es eliminado.
- Cierre técnico: `tsc --noEmit` pasa y `next build` de producción compila correctamente. Resend/SMTP y el flujo conceder→entregar→retirar quedan aprobados.
- Siguiente servicio externo: Hotmart, empezando por producto/oferta y luego webhook idempotente antes de cualquier venta real.

## Sesion 10 — configuracion inicial de Hotmart (2026-08-09)
- Cuenta de Hotmart existente confirmada por la propietaria.
- Producto `Menu Low Carb Latino` registrado como SUSCRIPCION, no como pago unico.
- Plan mensual creado por la propietaria: USD 6.99/mes, cobro hasta cancelacion y prueba GRATIS de 7 dias.
- Plan anual creado por la propietaria: USD 69.90/ano, cobro hasta cancelacion y prueba GRATIS de 7 dias. La landing lo comunica como USD 5.83/mes con el total anual visible.
- Garantia inicial configurada en 7 dias. Se decidio mostrar impuestos incluidos si Hotmart ofrece esa opcion, para evitar sorpresas en checkout.
- Hotmart Club configurado con el modulo `Empieza aqui` y la clase publicada `Como acceder a Menu Low Carb Latino`; el acceso real se realiza en `https://menu.centrodigitalglobal.online/login`.
- Pagina de ventas externa conectada a `https://menu.centrodigitalglobal.online/`. Marketplace se mantiene desactivado hasta preparar materiales y operacion de afiliados.
- Producto aprobado por Hotmart el 2026-08-09, segun confirmacion de la propietaria. Esto no autoriza promocionar ni aceptar ventas reales todavia.
- Gate pendiente antes de vender: endpoint `/api/webhooks/hotmart` desplegado y certificado con autenticidad HOTTOK, allowlist de producto/ofertas, idempotencia tecnica y economica, maquina de estados, recuperacion de acceso y prueba end-to-end.
- Implementacion local del webhook completada en `web/app/api/webhooks/hotmart/route.ts` y `web/lib/hotmart-webhook.ts`: raw body, HOTTOK en tiempo constante, version 2.0.0, frescura, catalogo cerrado, dedupe concurrente, ledger economico y estados recuperables.
- La prueba gratis se distingue del primer cobro: importe 0/estado STARTED -> `trialing`; el primer cobro real -> `active` y `first_paid_at`. Mensual USD 6.99 y anual USD 69.90 se validan en centavos.
- Cancelacion conserva acceso hasta la proxima fecha de cobro; past_due conserva 5 dias de gracia; refund/chargeback cortan acceso. Eventos viejos no reactivan un estado terminal de la misma suscripcion.
- El flujo crea o reconcilia la cuenta por subscriber code, subscription id, anon_id y finalmente email; el magic link usa el SMTP Resend ya verificado. Un fallo de email queda `failed` y Hotmart recibe 500 para reintentar.
- Migracion `20260809200000_hotmart_webhook.sql` aplicada remotamente de forma atomica el 2026-08-09. Auditoria posterior: RPC, estados, ledger, indice economico unico y anon_id = true en 5/5 comprobaciones.
- Panel administrativo corregido para restar refunds/chargebacks como movimientos separados y no duplicar APPROVED + COMPLETE.
- Verificacion local: 8/8 pruebas de normalizacion/seguridad pasan, TypeScript pasa, lint sin hallazgos y build Next de produccion compila la ruta dinamica `/api/webhooks/hotmart`.
- Seguridad de activacion: `HOTMART_WEBHOOK_MODE` queda por defecto en `observe`; no se concede acceso hasta configurar los IDs reales, HOTTOK y certificar el payload sandbox.
- Catalogo real configurado en Vercel: producto Hotmart `8281371`, plan mensual `1367622` y plan anual `1367623`.
- `HOTTOK` fue guardado directamente por la propietaria como variable sensible de Vercel para Production y Preview; su valor no se copio al repositorio ni a este documento.
- Despliegue de produccion `76cuGTm64M74Hvf5Cwe9HWhXUjjs` quedo `Ready` (commit `b22af55`). Prueba externa: `GET https://menu.centrodigitalglobal.online/api/webhooks/hotmart` responde `{"service":"hotmart-webhook","ready":true,"mode":"observe"}`.
- Pendiente inmediato: registrar en Hotmart el webhook version 2.0.0 hacia la URL anterior, enviar una prueba y revisar el historial. Mantener `observe` hasta certificar autenticidad y payload; todavia no vender.
- Webhook registrado en Hotmart y probado el 2026-08-09 con el evento de prueba `Compra aprobada`. La propietaria lo envio dos veces por error; ambos intentos aparecen en Historial como `200 - Procesado`. La repeticion no concede acceso ni duplica movimientos porque el endpoint sigue en `observe` y la implementacion aplica idempotencia.
- Respuesta de la prueba certificada desde el detalle de Hotmart: HTTP `200 OK`, `received:true`, `mode:observe`, `result:not_applied`, `code:product_not_allowed`. Es el resultado seguro esperado: el simulador de Hotmart usa un producto ficticio con ID `0`, mientras la allowlist acepta solamente el producto real `8281371`.
- Links publicos reales confirmados: mensual `https://pay.hotmart.com/R107087996E?off=2yk1rcvg` y anual `https://pay.hotmart.com/R107087996E?off=1x7js0ul`.
- Localizacion del acceso iniciada el 2026-08-10: la plantilla `Magic link or OTP` de Supabase se reemplazo por un correo transaccional completamente en espanol, con asunto `Tu acceso a Menu Low Carb Latino`, CTA unico `Entrar a mi menu`, aviso explicito de que la app no requiere contrasena y recuperacion desde `/login`; no muestra el correo personal de la propietaria como soporte.
- Prueba real de la plantilla cerrada: se solicito un enlace para la cuenta controlada `margie.caracas32+prueba@gmail.com`, la app mostro confirmacion neutral y Resend registro el nuevo asunto como `delivered`. La vista previa de Supabase fue revisada y ya no conserva texto ingles duplicado.
- Pendiente inmediato: entrar al panel productor de Hotmart para fijar el idioma del checkout en espanol y actualizar la clase `Como acceder a Menu Low Carb Latino` con el flujo sin contrasena. El navegador integrado no conserva la sesion de productor, por lo que esta configuracion requiere que la propietaria inicie sesion; no se modificaran precios, planes ni cobros.
- El paywall ya reemplaza la demostracion por la redireccion real al plan seleccionado. Agrega `src=menu_low_carb_paywall` y un `sck` anonimo aleatorio para atribucion y reconciliacion sin exponer datos personales; al volver con el boton del navegador se restablece el estado del CTA.
- Verificacion de esta capa: ESLint del paywall sin hallazgos, TypeScript pasa, 8/8 pruebas del webhook pasan y `next build` de produccion compila las 13 rutas. El lint global conserva hallazgos preexistentes en otras pantallas, fuera de este cambio.
- QA renderizada del paywall completada: se corrigio el ancho CSS para que la tarjeta de precio no desborde en escritorio ni celular. Prueba navegable sin compra: anual abre `off=1x7js0ul` y mensual abre `off=2yk1rcvg`, ambos con `src` y el mismo `sck` anonimo persistente.
- Produccion publicada desde el commit `6be8e7d`. Auditoria de los assets servidos por `https://menu.centrodigitalglobal.online/paywall`: oferta anual presente, oferta mensual presente y `src=menu_low_carb_paywall` presente (3/3). No se introdujeron datos de pago ni se inicio una suscripcion durante la QA.
- Activacion controlada 2026-08-10: `HOTMART_WEBHOOK_MODE` fue sobrescrito con el valor exacto `live` para Production y Preview. Despliegue Vercel `7fq6yRSnscjNnMT9Ee3PMFUZGue5` verificado como `Ready`, `Production` y `Current`; comprobacion externa con cache-busting responde `{"service":"hotmart-webhook","ready":true,"mode":"live"}`.
- Gate actual: el receptor ya puede conceder acceso para el producto real; falta completar una adhesion mensual controlada de USD 0 durante la prueba gratis, verificar evento/base/correo/login y cancelar antes del primer cobro. No vender al publico hasta cerrar ese recorrido.
- Prueba real mensual iniciada el 2026-08-10 con `margie.caracas32+prueba@gmail.com`, transaccion visible `HP2140367396` y total de hoy USD 0. Hotmart aprobo la adhesion y aviso que solo haria una validacion simbolica reversible de la tarjeta.
- Bloqueo detectado: el POST real a `/api/webhooks/hotmart` respondio HTTP 422 a las 11:02 y Hotmart lo reintento a las 11:17 con el mismo 422. Por eso la cuenta/app no fue creada y no llego el magic link; los correos recibidos eran del Hotmart Club.
- Causa raiz confirmada en el Historial de Hotmart: `invalid_event / amount_not_allowed`. La adhesion real de prueba envio importe inicial USD 0 para el producto y plan correctos, mientras el parser exigia USD 6.99 antes de clasificarla como prueba.
- Correccion local cerrada: una `PURCHASE_APPROVED` autentica de importe cero se acepta como `trialing`, no genera venta contable y conserva allowlists de producto/plan, HOTTOK, USD e idempotencia. Un importe positivo ajeno al catalogo sigue rechazado. La ventana de reproceso firmado se alinea con los 60 dias de historial de Hotmart; IDs y transacciones unicas impiden duplicados.
- Evidencia local de la correccion: 10/10 pruebas del webhook, TypeScript, ESLint de los archivos cambiados y `next build` de produccion pasan. Pendiente publicar, reprocesar `ae7424f0-4849-454f-bb71-d7578931a81c`, verificar correo/login y cancelar la prueba antes del primer cobro. No vender todavia.
- Correccion publicada en `main` con commit `0609d80`; Vercel desplego `GWe3wmEMVdfUE6CoHHwuM5sBZmWy` como Production/Ready. La propietaria solicito reprocesar el evento y el POST de las 11:43:19 respondio HTTP 200. Supabase confirma la nueva cuenta Auth `margie.caracas32+prueba@gmail.com`; por contrato del endpoint, un fallo de suscripcion o correo habria respondido 500. Pendiente que la propietaria abra el magic link, confirme `/app` y luego cancele la prueba antes del cobro.
- Magic link abierto correctamente: captura aportada confirma `/login?verified=1`, correo verificado y sesion segura. Hallazgo UX: el CTA de exito decia `Volver al inicio` y apuntaba a la landing; corregido a `Entrar a mi menu` con destino `/app`. Pendiente publicar esta mejora, confirmar producto y cancelar la prueba.
- Recorrido real de activacion confirmado por la propietaria: el CTA corregido abrio `/app` y la captura muestra la pantalla `Tu cena de hoy` con navegacion Hoy/Semana/Compras/Recetas. Queda validada la cadena checkout de prueba -> webhook -> cuenta -> email -> sesion -> producto. Siguiente verificacion obligatoria: cancelar la suscripcion de prueba en Hotmart antes del 2026-08-17 y confirmar el evento de cancelacion y la politica de acceso.
- Cancelacion real confirmada el 2026-08-10: Hotmart muestra `Cancelado por el usuario`, sin renovacion, y acceso al contenido hasta el 17/08. El webhook de cancelacion llego a produccion y respondio HTTP 200. Supabase quedo en `status=cancelled`, `trial_ends_at=current_period_end=access_until=2026-08-17 12:00:00+00` y `cancel_at_period_end=true`; por tanto no habra cobro y `has_app_access()` conserva el producto solo hasta el fin de la prueba.
- Comprobacion visual final aprobada por la propietaria: despues de cancelar y refrescar `/app`, la receta y el producto continúan accesibles. Queda certificado el recorrido real de prueba gratis, activacion, cancelacion sin cobro y acceso hasta fin de periodo. No se autoriza venta publica todavia: falta corregir la entrega/confusion de Hotmart Club y completar el cierre operativo previo al lanzamiento.
- Localizacion de Hotmart cerrada el 2026-08-10: en la configuracion del checkout se selecciono `Espanol` en lugar de `Idioma del comprador`, se guardo con confirmacion `Hecho` y se recargo la pagina para verificar que la seleccion persistio. El checkout y los correos transaccionales enviados por Hotmart quedan forzados a espanol.
- La clase publicada de Hotmart Club `Como acceder a Menu Low Carb Latino` fue actualizada y verificada tras volver a abrirla. Ahora explica que la contrasena solicitada por Hotmart pertenece solo a su plataforma; la app no usa contrasena y se abre mediante el correo `Tu acceso a Menu Low Carb Latino` o desde `https://menu.centrodigitalglobal.online/login` con el mismo correo de compra. No se expone el correo personal de la propietaria como soporte.
- El contenido conserva el aviso de prueba completa por 7 dias y el enlace directo a la app. Hotmart confirmo `Los cambios se guardaron con exito` y la clase continua marcada como `Publicado`.
- Pendiente de lanzamiento: cierre operativo final, revision de avisos/errores reales del panel y decision explicita de apertura al publico. La integracion de pago, acceso, cancelacion y localizacion ya esta certificada.

## Sesion 11 — auditoria de integridad previa al lanzamiento (2026-08-10)
- Auditoria tecnica cerrada localmente: TypeScript, ESLint sin errores/advertencias, 10/10 pruebas Hotmart y build Next de produccion con 13 rutas pasan.
- `pnpm audit --prod` detecto vulnerabilidades altas en Next 16.2.6 y Sharp 0.34.5. Se corrigieron con Next 16.2.11, Sharp 0.35.0 y PostCSS 8.5.25; la repeticion final informa `No known vulnerabilities found`.
- Encabezados de seguridad preparados en `next.config.ts`: CSP, anti-iframe, no-sniff, politica de referer y permisos restringidos; se retiro `X-Powered-By`.
- Pruebas externas sin sesion sobre produccion: `/app` redirige 307 a `/login`, `/admin` redirige 307 a login admin, el endpoint manual responde 403 y el webhook reporta `ready=true`, `mode=live`.
- Paginas legales dejaron de declararse provisionales y ya no muestran un correo de soporte inventado. Explican prueba, suscripcion, cancelacion y reembolso conforme al flujo real de Hotmart, con enlaces oficiales de gestion. Requieren revision juridica profesional antes de trafico abierto.
- Bloqueante principal de producto: onboarding guarda las tres respuestas solo en localStorage y la app pagada consume `demo-data.ts`; no escribe `households`/`dietary_preferences` ni genera una semana/lista a partir de las elecciones. Por tanto los claims de personalizacion y porciones no estan certificados y la venta publica continua NO AUTORIZADA.
- Observabilidad tambien incompleta: el panel lee `event_log` y `error_log`, pero las pantallas cliente no registran el funnel y Sentry no esta conectado. Economia real, exportacion/borrado de privacidad, restore/backup y varios casos de pago siguen no medidos/no verificados.
- Se crearon los seis artefactos obligatorios en `docs/release/` mas `RUNBOOK.md`. Todos distinguen evidencia real de pendientes; `RELEASE-MANIFEST.json` y `PUBLICATION-CERTIFICATE.md` permanecen en estado `blocked` de forma intencional.
- Siguiente etapa propuesta: construir el nucleo real onboarding -> preferencias persistentes -> semana/lista derivadas -> app, instrumentar eventos/errores y repetir los gates. Los casos de pago que cuestan dinero requieren aprobacion de la propietaria antes de ejecutarse.

## Sesion 12 — correccion global de espaciado en recetas (2026-08-11)
- La captura de la propietaria revelo que categoria, titulo, duracion y porciones aparecian concatenados en las tarjetas de Recetas, tanto con imagen como con plato editorial.
- Causa raiz: el JSX habia dejado de asignar las clases compartidas `internal-recipe-card`, `internal-recipe-copy` e `internal-favorite`, mientras el CSS seguia dependiendo de ellas; no era un problema del contenido.
- Se restauro el contrato entre componente y estilos y se organizo la informacion en tres bloques con 8 px de separacion, tipografia y line-height propios, `min-width: 0` y grid adaptable. Tambien se corrigio el selector visual de filtros para usar su estado accesible `aria-pressed`.
- QA responsive: 7/7 tarjetas renderizadas, sin solapamientos, sin scroll horizontal y con separacion computada de 8 px a 375 px y escritorio. Evidencias: `web/artifacts/recipe-spacing-375-final.png` y `web/artifacts/recipe-spacing-desktop-final.png`.
- Revisor visual independiente: APROBAR, usabilidad 39/40 y craft 18/20. La captura final de escritorio se repitio tras terminar el stagger y elimino la semitransparencia temporal observada en la primera evidencia.
- Verificacion tecnica: TypeScript y ESLint pasan, 10/10 pruebas del webhook Hotmart pasan y `next build` 16.2.11 genera correctamente las 13 rutas.

## Sesion 13 — nucleo real de personalizacion (2026-08-11, en curso)
- Decision de arquitectura: reutilizar `households`, `dietary_preferences`, `weekly_plans`, `plan_meals`, `shopping_lists` y `shopping_items`; no crear un segundo sistema de preferencias.
- El onboarding conserva sus respuestas localmente antes del pago. En el primer acceso autenticado, el servidor valida la sesion y el acceso vigente, deriva una semana desde un catalogo curado y guarda preferencias, siete cenas y compra en una sola operacion atomica.
- Motor inicial decidido: seleccion determinista `curated-v2`, sin IA ni servicio pagado. Respeta personas, tiempo disponible y exclusiones elegidas; escala cantidades y agrupa duplicados. La IA se evaluara solo si aporta una mejora medible sin comprometer seguridad alimentaria ni margen.
- Seguridad acordada: validacion estricta en el limite, allowlists de opciones/recetas, acceso comprobado en servidor, RPC `security definer` con `search_path=''` y RLS como segunda barrera.
- Alcance de esta etapa: preferencias persistentes, semana y compra reales. Progreso, favoritos e instrumentacion se cerraran en etapas posteriores para evitar mezclar cambios.
- Implementacion local completada: catalogo curado ampliado a 14 recetas; generador de siete dias; filtro por 20/30/45 minutos y exclusiones; porciones e ingredientes escalados; compra agregada por pasillos; renovacion automatica al vencer la semana.
- Se retiro `demo-data.ts`. El onboarding y la app comparten ahora el mismo motor, por lo que la muestra, la semana pagada y el conteo de compra usan la misma fuente.
- API preparada en `POST /api/app/personalize`: exige sesion y acceso vigente en servidor, valida origen/respuestas y llama una RPC atomica. La app sincroniza localStorage solo en el primer acceso; despues carga Supabase y funciona entre dispositivos.
- Migracion preparada en `20260811130000_personalized_week.sql`. La comprobacion externa anonima devolvio 404: la funcion aun no esta activa en el proyecto remoto, por lo que no se publica esta capa hasta autorizar/aplicar la migracion.
- Evidencia tecnica: TypeScript y ESLint sin hallazgos, build de produccion correcto, 10/10 pruebas Hotmart y 4/4 pruebas nuevas de personalizacion pasan.
- Evidencia visual: `web/artifacts/personalization-onboarding.png` y `web/artifacts/personalization-recipes.png`. Revisor independiente: APROBAR, usabilidad 39/40 y craft 18/20. El unico aviso visible pertenece al modo desarrollo: CSP bloquea `eval` de las herramientas de Next; no ocurre en produccion.
- Ajuste de catalogo solicitado por la propietaria: 14 recetas eran insuficientes para una suscripcion. Se amplio a 60 recetas completas y unicas (proteinas, vegetarianas, sopas, brochetas y opciones de 15-45 minutos), manteniendo allowlist de servidor y filtros de huevo, lacteos y mariscos.
- Migracion remota de personalizacion aplicada por la propietaria el 2026-08-11; Supabase devolvio `Success. No rows returned`.
- Verificacion externa posterior: una invocacion anonima a `save_personalized_week` responde HTTP 401. Esto confirma que la funcion existe en produccion y que un visitante sin sesion no puede ejecutarla.
- Catalogo final verificado localmente: 60 recetas unicas y completas; incluso la combinacion mas restrictiva de tiempo/exclusiones conserva al menos 12 alternativas compatibles. Pruebas de personalizacion 6/6, Hotmart 10/10, TypeScript, ESLint y build de produccion aprobados.
- Correccion visual posterior solicitada por la propietaria: se retiro el nombre abreviado que aparecia dentro de los platos ilustrados de las tarjetas. Era redundante y se cortaba en celular; el nombre completo permanece una sola vez en el bloque principal de la receta. Verificacion: ninguna ilustracion decorativa expone texto, los 60 titulos siguen presentes y pasan TypeScript, ESLint y 6/6 pruebas de personalizacion.

## Sesion 14 — analitica y observabilidad operativa (2026-08-11, en curso)
- Decisión: usar `event_log` y `error_log` de Supabase como fuente única inicial. No se conecta todavía PostHog ni Sentry porque no hacen falta para operar con 300-500 usuarios y añadirían cuentas/costos antes de validar la venta.
- Contrato cerrado de eventos sin datos personales: landing, tres pasos del onboarding, resultado, visibilidad real del paywall, elección de plan, salida/regreso de checkout, apertura/activación/sesión, generación de semana, recetas, cenas, compra, prueba y primer cobro.
- Seguridad: endpoint de eventos con allowlist, límites de tamaño y frecuencia, comprobación de origen, autenticación obligatoria para acciones internas, propiedades tipadas y deduplicación SHA-256. Correo, nombre y texto libre se descartan.
- Embudo comercial completo: landing → onboarding → pasos 1/2/3 → resultado → paywall visible al 35% → Hotmart → prueba confirmada en servidor → primer cobro confirmado en servidor.
- Hotmart registra `trial_iniciado` y `primer_cobro_confirmado` después de aplicar el evento válido; los reintentos no duplican cifras. La analítica nunca bloquea el pago ni el acceso.
- Sesiones QA: `?qa=1` marca toda la sesión; el panel excluye todos sus eventos y los pagos cuyo origen es `qa`. Muestra además cuántas sesiones de prueba fueron retiradas de los cálculos.
- Errores: se añadió un límite autenticado `/api/errors`, registro agrupable y una pantalla segura de recuperación para fallos de la app. La generación/persistencia del menú registra fallos del servidor sin exponer contenido del usuario.
- Migración `20260811180000_product_analytics.sql` aplicada remotamente el 2026-08-11; Supabase confirmó `Success. No rows returned`. Añade una clave idempotente y los índices de sesión/fecha sin borrar datos existentes.
- Evidencia técnica: TypeScript, ESLint, 4/4 pruebas nuevas de privacidad/contrato, 6/6 de personalización y 10/10 de Hotmart pasan. `next build --webpack` compila correctamente 16 rutas, incluidos `/api/events` y `/api/errors`.
- Pendiente inmediato: publicar en GitHub/Vercel, comprobar eventos en producción, capturar el panel móvil y obtener veredicto del revisor visual antes de cerrar esta etapa.
