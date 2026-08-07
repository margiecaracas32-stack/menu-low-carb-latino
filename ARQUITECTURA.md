# ARQUITECTURA — Menú Low Carb Latino
Fecha: 2026-08-03 · Estado: propuesta de Sesión 1

## 1. Decisiones rectoras
- Producto B2C individual, móvil primero y en español LATAM.
- Framework: Next.js App Router, porque integra landing SEO, endpoints de servidor y aplicación autenticada en un solo producto.
- Backend: Supabase (Postgres, Auth y Storage) con datos separados por usuario mediante RLS.
- Venta: Hotmart; el comprador entra con el correo usado para comprar.
- Núcleo inteligente: planificador determinista sobre recetas curadas. La IA generativa NO inventa recetas, alergias, cantidades ni nutrición.
- Secuencia: landing → onboarding/preview → paywall/checkout → login → app interna → integraciones reales.

## 2. Mapa de pantallas (máximo 8)
1. `/` — Página de ventas: demuestra una semana resuelta y lleva al onboarding.
2. `/onboarding` — Flujo de personalización + preview: una pregunta por paso; termina mostrando tres días y resumen de compra.
3. `/paywall` — Oferta/trial; incluye retorno `/paywall/confirmando` tras Hotmart.
4. `/login` — Acceso passwordless por email; Google como alternativa secundaria.
5. `/app` — **Hoy**: plato principal del momento, tiempo, porciones, ingredientes y acción “cambiar”.
6. `/app/semana` — **Semana**: siete días con fechas reales, navegación anterior/siguiente y edición.
7. `/app/compras` — **Compras**: lista consolidada por categoría, cantidades, checks y extras manuales.
8. `/app/recetas` — **Recetas**: biblioteca curada, favoritos y filtros; configuración vive en un sheet/modal global.

## 3. Camino crítico
1. Ana llega a la landing y ve el resultado, no una lista de funciones.
2. Elige tamaño familiar, tiempo disponible y alimentos que evita.
3. El motor selecciona y combina recetas compatibles, reutiliza ingredientes y crea una preview de tres días.
4. El paywall explica que Pro desbloquea siete días, cantidades, compra completa, cambios y memoria de preferencias.
5. Hotmart inicia la prueba de siete días; al volver se verifica el webhook.
6. El usuario recibe un enlace/código por email y el estado anónimo se migra a su cuenta.
7. Entra en “Hoy” con la comida accionable; no cae en un dashboard genérico.

## 4. Onboarding: datos mínimos
- Tamaño del hogar: 1, 2, 3, 4, 5+.
- Tiempo habitual para cocinar: 15, 30, 45+ minutos.
- Ingredientes que evita: selección guiada; alergias se tratan como exclusiones estrictas con aviso de seguridad.
- Opcional antes de generar: comidas del día que quiere planificar y presupuesto relativo (ahorro / equilibrado / variedad).
- No se pregunta peso, diagnóstico, glucosa, calorías objetivo ni información clínica.
- Estado anónimo versionado y guardado tras cada respuesta; validación estricta al migrarlo a la cuenta.

## 5. Modelo de datos

### Catálogo curado (lectura pública, escritura solo administrativa)
- `ingredients`: ingrediente canónico, categoría y unidad base.
- `ingredient_aliases`: nombres/alternativas regionales por país.
- `recipes`: título, instrucciones, tiempo, porciones base, foto, estado editorial y fecha de revisión.
- `recipe_ingredients`: receta, ingrediente, cantidad, unidad, opcionalidad y grupo.
- `recipe_nutrition`: valores por porción, fuente, método de cálculo, revisión y versión. Nunca datos sin fuente.
- `recipe_tags`: comida, dificultad, presupuesto, regiones y restricciones compatibles.

### Datos privados del usuario (todas con `user_id` indexado y RLS)
- `profiles`: nombre, zona horaria, plan y preferencias de comunicación.
- `households`: tamaño y configuración familiar.
- `dietary_preferences`: exclusiones, alergias declaradas y preferencias; cambios auditables.
- `weekly_plans`: semana, estado, versión del algoritmo y resumen.
- `plan_meals`: día/comida, receta elegida, porciones, origen y estado.
- `shopping_lists` + `shopping_items`: lista consolidada, cantidades, checks y extras.
- `recipe_feedback`: favorito, me gusta/no me gusta, sustitución y motivo.
- `user_progress`: semanas planificadas/completadas, hitos y última actividad; solo lectura directa del cliente.
- `subscriptions`: estado de prueba/pago, periodo y proveedor; escritura exclusiva del servidor/webhook.
- `payment_events`: eventos Hotmart con ID único para impedir dobles activaciones.
- `event_log`: eventos de producto y retención con contrato único.

### Integridad y rendimiento
- UUID, `timestamptz`, constraints y foreign keys explícitas.
- Índices compuestos por usuario+semana, usuario+estado y usuario+fecha según las consultas principales.
- Una sola lista activa por usuario/semana; una sola comida por plan+día+tipo.
- Generar/reemplazar menú y recalcular compras ocurre en transacción atómica.
- Idempotencia en generación, migración anónima y webhooks de pago.
- Paginación por cursor en recetas/historial si superan el umbral.
- Backups y restauración probada antes de vender; producción con PITR cuando haya datos reales.

## 6. Seguridad y autenticación
- Supabase Auth; no se construye autenticación propia.
- Login principal: magic link/OTP al correo usado en Hotmart. Google secundario después del primer acceso.
- Sin contraseña obligatoria en la primera versión; passkeys quedan como mejora posterior.
- Sesiones en cookies HttpOnly/Secure/SameSite; jamás tokens en localStorage.
- Rutas públicas: landing, onboarding, paywall, login y legales. `/app/*` y APIs privadas requieren sesión validada.
- RLS deny-by-default en cada tabla privada: SELECT/INSERT/UPDATE/DELETE separados, con `using` y `with check`.
- Catálogo: lectura pública solo de recetas publicadas; modificaciones únicamente desde backoffice autorizado.
- Rate limits para OTP, generación de plan, sustituciones y webhooks; respuestas de login que no revelan si existe una cuenta.
- Claves de Hotmart/Supabase/servicios solo en servidor. `service_role` nunca llega al navegador.
- Datos de alergias tratados como sensibles: mínima recolección, exportación/borrado y aviso de que se verifique el empaque real.

## 7. Motor de planificación
- Entrada validada: hogar, comidas, tiempo, exclusiones, favoritos, rechazos y región.
- Filtro duro: alergias/exclusiones, estado editorial, porciones posibles y disponibilidad regional.
- Puntuación: adecuación low carb, tiempo, aceptación previa, variedad, reutilización de ingredientes y costo relativo.
- Selección semanal: restricciones duras primero; optimización después. Nunca sacrificar seguridad por variedad.
- Salida estructurada: IDs de recetas + porciones; nutrición e ingredientes siempre se leen del catálogo, nunca del texto generado.
- Sustitución: reemplaza una comida compatible, conserva restricciones y recalcula diferencialmente la lista de compras.
- Fallback: si no hay combinación segura suficiente, explicar qué restricción impide el plan y ofrecer reducir variedad; nunca improvisar.
- Evolución futura: IA generativa opcional solo para lenguaje explicativo o clasificación, detrás del servidor, con salida validada y sin autoridad sobre datos nutricionales.

## 8. Retención y gamificación ética
- Loop: gatillo “necesito resolver la comida”/recordatorio elegido → abrir **Hoy** o **Compras** → plato claro + pequeño descubrimiento → marcar/cambiar y enseñar preferencias al sistema.
- Inversión acumulada: favoritos, rechazos, sustituciones, semanas completadas y lista habitual.
- Hipótesis de activación: usar la lista de compras y completar/cambiar al menos 3 comidas planificadas durante los primeros 7 días predice retención D30.
- Mecánica 1: onboarding con progreso visible y preview real.
- Mecánica 2: consistencia semanal, no racha diaria; una semana se celebra al usar la compra y al menos tres comidas.
- Mecánica 3: hitos significativos: primera compra organizada, primera semana resuelta, 4 semanas constantes y 10 ingredientes reutilizados.
- Recompensa variable ética: una receta familiar nueva compatible o un insight real de preferencias; nunca cofres, azar pagado ni puntos vacíos.
- Sin XP, ligas, comparación corporal, culpa ni pérdida punitiva de progreso.
- Notificaciones opt-in y máximo una de reenganche por día, en horarios elegidos; controles completos en ajustes.

## 9. Estados y fallos obligatorios
- Cada pantalla contempla carga con skeleton, vacío con ejemplo, éxito, error accionable, offline y acción deshabilitada.
- Doble toque no duplica menús, sustituciones ni pagos.
- Si Hotmart tarda: “Confirmando tu acceso” con verificación periódica y vía clara de ayuda.
- Si el planificador falla: conservar respuestas y permitir reintentar; jamás borrar la semana anterior.
- Si una sección falla, las demás siguen disponibles mediante límites de error por sección.

## 10. Eventos mínimos desde que se construya cada pantalla
- Funnel: `landing_cta`, `onboarding_started`, `onboarding_step_completed`, `preview_created`, `paywall_viewed`, `checkout_started`, `trial_started`, `first_payment_confirmed`.
- Activación: `shopping_list_opened`, `shopping_item_checked`, `meal_opened`, `meal_swapped`, `meal_completed`, `aha_reached`.
- Retención: `weekly_plan_created`, `week_milestone_reached`, `preference_learned`, `reengagement_sent/opened`.
- Seguridad/operación: fallos de webhook, rate limits y errores del motor sin incluir datos sensibles.

## 11. Riesgos controlados
- Nutrición/alergias: catálogo curado, fuentes y revisión; disclaimers y exclusión estricta.
- Variedad LATAM: aliases regionales y lanzamiento controlado; no afirmar disponibilidad universal sin datos.
- Costo: sin IA generativa en el camino crítico; límites y medición antes de añadirla.
- Retención: no exigir registro diario; el valor debe vivir en cocinar/comprar, no en alimentar la app.
