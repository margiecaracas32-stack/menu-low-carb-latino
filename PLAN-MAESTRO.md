# PLAN MAESTRO — Menú Low Carb Latino
Fecha: 2026-08-05 · Estado: aprobado para ejecución

## Norte del producto
- Promesa: resolver la alimentación low carb semanal de una familia latina con platos conocidos, ingredientes comunes y una compra organizada, sin dietas extremas ni horas de planificación.
- Cliente: Ana, 42 años, ocupada, responsable de organizar la comida familiar y agotada de decidir cada noche.
- Primera victoria: en menos de 60 segundos recibe una preview personalizada de tres días y un resumen de la compra.
- Monetización: onboarding anónimo → preview → paywall → prueba de 7 días → login → app.
- Precio inicial: US$6.99/mes o US$5.83/mes facturado US$69.90/año; provisional hasta obtener señal de pago.
- Arquitectura: Next.js + Supabase + Hotmart + Vercel; planificador determinista sobre recetas curadas.
- Ruta: `/` → `/onboarding` → `/paywall` → `/login` → `/app`.

## SESIÓN 1 — Validación, avatar, monetización y arquitectura
Estado: completada y aprobada.

Entregables:
- Constitución del Producto y FICHA-AVATAR.md aprobadas.
- Validación competitiva y brecha real redefinida.
- Modelo onboarding-first, trial de 7 días y precio provisional.
- ARQUITECTURA.md con pantallas, datos, seguridad, acceso, motor y retención.

Pendiente de validación externa:
- Señal de pago propia del avatar LATAM.
- Precio aceptable mediante clic al checkout, compras o entrevistas.
- País fiscal del dueño para sustituir supuestos de impuestos.

## SESIÓN 2 — Identidad visual y sistema de diseño
Objetivo: crear una marca cálida, reconocible y premium que no parezca una plantilla de dieta ni una app genérica de IA.

Trabajo:
- Investigar 3-5 líderes y extraer patrones visuales, sin clonarlos.
- Definir personalidad, fotografía, tipografías, paleta y detalle propio.
- Crear tres direcciones A/B/C realmente diferentes de la misma pantalla móvil.
- Mostrar comparativa renderizada a 375px; el usuario elige, combina o pide ajustes.
- Guardar FICHA-ARTE.md y tokens visuales definitivos.

Puerta: no construir la landing hasta aprobar una dirección visual.

## SESIÓN 3 — Página de ventas
Objetivo: vender “una semana resuelta”, no recetas ni tecnología.

Trabajo:
- Construir las 10 secciones canónicas: hero, problema, agitación, mecanismo, demostración, oferta, garantía, FAQ, CTA emocional y footer legal.
- Derivar todo el texto de FICHA-AVATAR.md; sin testimonios inventados.
- Mostrar previews realistas de Hoy, Semana y Compras.
- Incorporar mensual/anual y CTA hacia onboarding.
- Instrumentar visita, atribución y CTA desde el inicio.
- Verificar móvil, desktop y accesibilidad.

Puerta: tsc/build/dev, flujo probado, screenshot real a 375px y revisión visual independiente.

## SESIÓN 4 — Onboarding, preview, paywall y login
Objetivo: demostrar valor, convertir y guardar sin romper el impulso.

Trabajo:
- Una decisión por pantalla; solo preguntas que cambian el plan.
- Preview de tres días en menos de 60 segundos.
- Paywall que desbloquea siete días, compra, sustituciones y aprendizaje.
- Puente a Hotmart y retorno “Confirmando tu acceso”.
- Trial D1-D7 visible y aviso honesto del cobro.
- Login por correo y migración segura del estado anónimo.
- Eventos separados de preview, paywall, checkout, trial y primer cobro.

Puerta: camino completo landing→onboarding→preview→paywall→login probado con servicios simulados seguros.

## SESIÓN 5 — Aplicación interna simplificada
Objetivo: cumplir la promesa con mínima carga mental.

Secciones:
- Hoy: comida accionable, receta y sustitución.
- Semana: siete días con fechas y edición.
- Compras: lista consolidada y marcable.
- Recetas: biblioteca curada, filtros y favoritos.

Trabajo adicional:
- Datos semilla realistas; nunca enseñar la app vacía.
- Estados loading, vacío, error, éxito, disabled y offline.
- Recalcular compras al sustituir sin perder checks manuales.
- Hitos de primera compra, primera semana y cuatro semanas.
- Accesibilidad y siguiente acción evidente.

Puerta: cada pantalla probada y puntuada llena a 375px; sin dashboard prematuro ni secciones duplicadas.

## SESIÓN 6 — Servicios reales, datos y seguridad
Objetivo: convertir el prototipo aprobado en un producto operativo y seguro.

Orden:
1. Git/GitHub y protección de secretos.
2. Supabase: migraciones, índices, aislamiento de datos, backups y acceso.
3. Motor real de planificación en servidor, transacciones e idempotencia.
4. Vercel: preview y producción aisladas.
5. Resend: acceso, avisos del trial y correos operativos.
6. Dominio y callbacks.
7. Hotmart: producto, trial, ofertas y webhook firmado.

Participación del usuario:
- Crear/autorizar cuentas, comprar dominio si corresponde e introducir claves directamente en paneles oficiales.
- Nunca compartir claves en el chat; el agente guía clic por clic.

Puerta: conexión GitHub→Vercel comprobada, datos aislados y pago/trial/login end-to-end.

## SESIÓN 7 — Testing, pulido y rigor de entrega
Objetivo: detectar fallos antes que los compradores y elevar el acabado a nivel premium.

Trabajo:
- Tests del camino crítico y casos borde: alergias, restricciones imposibles, doble toque, sustitución, offline y pagos repetidos.
- Seguridad, secretos, dependencias, afirmaciones y rutas de prueba.
- Rendimiento en Android gama media y redes lentas.
- Animación con propósito, skeletons, contraste, teclado y reducción de movimiento.
- Evaluaciones del planificador: exclusiones, variedad, lista y cantidades.
- Manual del dueño, runbook y certificado /100.

Puerta: gates de integridad, publicación y rigor sin bloqueantes.

## SESIÓN 8 — Adquisición, lanzamiento y operación
Objetivo: conseguir clientes de forma medible y operar 300-500 usuarios sin volar a ciegas.

Trabajo:
- Gate de demanda antes de gastar fuerte.
- Contenido y anuncios desde los dolores reales del avatar.
- Afiliados con comisión económicamente sostenible.
- Funnel completo: visita→onboarding→preview→paywall→checkout→trial→pago.
- Backoffice de activación, retención, cancelaciones, costos y soporte.
- Recuperación de pagos, cancelación clara y win-back.
- Lanzamiento de fundadores, prueba social real y mejora por cohortes.

Puerta: no escalar tráfico hasta pasar demanda, integridad y economía unitaria con datos reales.

## Reglas de avance
- Nunca construir primero la app interna.
- Una etapa a la vez; cada una termina con verificación técnica, visual y funcional.
- Instrumentar eventos al construir cada pantalla, no al final.
- No afirmar “terminado” sin checklist, screenshot y revisión independiente.
- El usuario aprueba entre etapas; las decisiones técnicas internas se ejecutan sin trasladarle jerga.
- Todo servicio que cueste dinero requiere aviso y autorización del usuario.
