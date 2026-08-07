# FICHA DE DIRECCIÓN DE ARTE — Menú Low Carb Latino

**Estado:** aprobada por el usuario el 2026-08-05  
**Dirección elegida:** combinación A+B — “Mesa editorial con ritmo sabroso”

## 1. Fundamento estratégico

**Idea visual:** una app que se siente como un recetario latino contemporáneo que ya hizo el trabajo de organizar la semana. Debe abrir el apetito, reducir la carga mental y señalar con claridad la siguiente acción.

**Avatar dominante:** Ana, 42 años, llega cansada y no quiere aprender un sistema complejo. Necesita alivio, familiaridad y una respuesta inmediata a “¿qué cocino hoy?”.

**Arquetipo de marca:** Cuidador, matizado por Gente Común.  
**Keywords:** cálida · clara · capaz · sabrosa · cotidiana.  
**Modo:** light-first. La experiencia debe sentirse luminosa y doméstica; el modo oscuro no es la identidad principal.

## 2. Tabla de líderes y fusión

| Líder | Tipografía → equivalente | Lógica visual | Cards / navegación | Patrón adoptado |
|---|---|---|---|---|
| Mealime | sans limpia → Source Sans 3 | comida como protagonista, acento verde, fondos claros | jerarquía sencilla y tabs inferiores | plato del día + continuidad directa hacia compra |
| AnyList | sans utilitaria → Source Sans 3 | información doméstica clara, color funcional | listas escaneables y navegación discreta | compra organizada como resultado tangible del plan |
| Lifesum / YAZIO | sans redondeada/geométrica → Figtree como referencia, no como fuente final | bienestar claro, progreso visual y color controlado | módulos de progreso, acciones visibles | feedback semanal positivo sin macros ni culpa |
| Headspace, referente de consumo | sans cálida y formas amables | optimismo adulto, color con intención | composiciones simples, ilustración propia | energía amable sin tono clínico |

**Fusión aprobada:**

- De Mealime: protagonismo del plato y claridad del flujo menú→compra.
- De AnyList: utilidad doméstica, listas comprensibles y sensación de semana organizada.
- De Lifesum/YAZIO: progreso visible y acción inmediata.
- De Headspace: optimismo adulto y formas con carácter.
- Detalle propio: textura de recetario impreso + plato geométrico + esquinas asimétricas.

## 3. Mundo del sujeto

- Recetario familiar impreso → grano de papel muy sutil en superficies protagonistas.
- Plato servido → círculos concéntricos y recortes gráficos para representar comida, nunca ilustraciones genéricas de IA.
- Calendario de cocina → tira semanal compacta y día activo muy evidente.
- Lista del supermercado → módulos ordenados y agrupación por pasillos.
- Marcas de lápiz → checks, subrayados y pequeñas señales editoriales.
- Mantel y vajilla latina contemporánea → crema, coral, mostaza y verde hoja; sin clichés folclóricos.

## 4. Sistema cromático

### Paleta principal

| Token | Color | Uso |
|---|---:|---|
| `surface-base` | `#F4EBDD` | fondo general cálido |
| `surface-primary` | `#FFF9EF` | cards, navegación y modales |
| `surface-recessed` | `#E9DDCB` | inputs, filtros y zonas hundidas |
| `text-primary` | `#302920` | texto principal |
| `text-secondary` | `#71675A` | texto secundario, manteniendo AA |
| `brand-primary` | `#246047` | CTA principal, selección y progreso |
| `brand-primary-hover` | `#194936` | hover/pressed |
| `brand-coral` | `#D4553E` | momento culinario y decoración |
| `brand-coral-accessible` | `#A93F2E` | superficie coral cuando lleva texto pequeño claro |
| `brand-mustard` | `#E6B84B` | plato, hito y señal de apetito |
| `brand-lime` | `#C9D95C` | resaltado editorial y sustitución; siempre con texto oscuro |
| `border-default` | `#DCCDBA` | divisores y contornos sutiles |

### Semánticos

- Éxito: `#28734F` sobre fondo suave `#E2EFE7`.
- Error: `#A43B32` sobre fondo suave `#F7E4E0`.
- Advertencia: `#8A5B08` sobre fondo suave `#F5E8BE`.
- Información: `#315F78` sobre fondo suave `#E0EDF2`.

### Regla 60–30–10

- 60% crema y papel.
- 30% verde profundo y tinta cálida.
- 10% coral, mostaza o lima; en un mismo viewport debe dominar solo uno de estos acentos emocionales.

**Prohibido:** texto claro pequeño sobre coral `#D4553E`; usar `#A93F2E` o texto oscuro según el caso. Nunca `#000`, `#FFF`, morado/cian neón, glow, glass sobre contenido ni degradados multicolor.

## 5. Tipografía

- **Display:** Fraunces, pesos 400 y 500. Solo titulares, nombre de plato y mensajes emocionales cortos.
- **Cuerpo/UI:** Source Sans 3, pesos 400 y 500. Navegación, botones, labels, instrucciones y formularios.
- **Fallback:** Georgia para display; Arial para cuerpo. Si aparece el fallback durante QA, se considera un fallo de carga.

### Escala móvil

- Display principal: 34px / 1.02.
- Título de sección: 20–22px.
- Cuerpo: 16px.
- Botones y labels importantes: 14–16px.
- Metadatos: 12–13px; nunca menos de 12px en producto final.
- Máximo tres tamaños claramente visibles por pantalla.

## 6. Forma y composición

- Radio base de contenido: 18px.
- Cards protagonistas: esquina superior izquierda de 5–8px y otras esquinas de 24–28px.
- Botones: 13px, con una esquina reducida a 4px como firma.
- Chips: cápsula controlada; no convertir cada label en pill.
- Iconos: Lucide de trazo uniforme dentro de círculos o cuadrados tratados; nunca emoji como iconografía final.
- Padding horizontal móvil: 16–18px consistente.
- Espaciado permitido: 4, 8, 12, 16, 24, 32, 48 y 64px.
- Una pantalla móvil inicial muestra 3–4 bloques, una acción principal y máximo dos accesos secundarios.

## 7. Dispositivos visuales propios

1. **Plato editorial:** círculos concéntricos con ingredientes abstractos; sustituible más adelante por fotografía real curada, nunca por imagen falsa de una receta.
2. **Papel de recetario:** trama de punto/grano al 10–15% de opacidad, imperceptible detrás de texto pequeño.
3. **Esquina recortada:** cards y botones con una esquina más pequeña; debe repetirse con disciplina.
4. **Subrayado comestible:** una palabra corta del titular puede llevar un bloque lima irregular; máximo uno por pantalla.

## 8. Personalidad compilada y voz

**Personalidad:** cálida (dominante) + clara + capaz.  
**Arquetipo de voz:** mentor sereno con cercanía cotidiana.

- Spring: bounce 0.15 / stiffness ~250.
- Duración base: 300ms.
- Exclamaciones: máximo 1 por pantalla; normalmente 0.
- Celebración N1: check suave y mensaje con resultado concreto.
- Celebración N2: progreso semanal que se completa con luz mostaza.
- Celebración N3: share card y confeti mínimo de formas de hoja/plato, sin espectáculo infantil.
- Radio tendencial: 18px con asimetría de firma.
- Color emocional: coral o lima solo en el momento de avance.

### Reglas de copy

- Hablar de decisiones resueltas, tiempo recuperado y comida familiar.
- Español LATAM natural, tuteo neutro.
- Ejemplo: “Tu cena de hoy, sin pensarlo tanto.”
- Error: “No pudimos cargar tu menú. Lo que ya elegiste está guardado; intenta otra vez.”
- Prohibido: culpa, alarmismo, diminutivos condescendientes, clichés de dieta o felicitaciones vacías.

## 9. Motion signature

- Entrada: contenido en stagger suave de 50–70ms; desplazamiento máximo 12px.
- Tap: 100–130ms; escala mínima 0.98 o desplazamiento vertical 1px.
- Cambio de plato: card sale 8px y la nueva entra desde el mismo eje en 280–320ms.
- Progreso semanal: relleno del indicador en 350–450ms, sin loops.
- Bottom navigation: color y pequeño desplazamiento, nunca glow.
- Respetar `prefers-reduced-motion`: reemplazar desplazamientos por cambio instantáneo o crossfade corto.

## 10. Accesibilidad y control de calidad

- WCAG 2.2 AA: texto normal ≥4.5:1; UI y texto grande ≥3:1.
- Targets táctiles recomendados de 44×44px.
- Focus visible de 2px usando verde profundo, con offset de 2px.
- No depender solo del color: acompañar progreso, selección y errores con texto o icono.
- Revisar cada pantalla real a 375px, 320px y escritorio.
- Estados obligatorios: normal, hover, pressed, focus, loading, vacío, error y éxito.

## 11. Restricciones anti-genérico

- No usar Inter, Roboto, Poppins ni tipografía del sistema como marca.
- No usar fondo oscuro por reflejo, glassmorphism, orbes, glow o gradiente morado.
- No llenar la app de tarjetas flotantes idénticas.
- No usar fotografías stock de ensaladas genéricas como identidad.
- No convertir el producto en una app de macros o fitness visualmente agresiva.
- Si al quitar el logo la pantalla puede pertenecer a cualquier app de dieta, debe rediseñarse usando el mundo del sujeto.

## 12. Test final de dirección de arte

- [x] Se distingue sin logo mediante papel, plato editorial, Fraunces y esquinas recortadas.
- [x] El verde es una decisión funcional; coral/mostaza/lima cargan apetito y emoción.
- [x] La tipografía tiene personalidad y jerarquía probada: display serif + body sans.
- [x] Existe un detalle memorable en la pantalla protagonista.
- [x] El sistema puede extenderse a ventas, onboarding, paywall y app interna.
- [x] El acento está restringido.
- [x] Las decisiones son trazables al avatar, líderes y mundo del sujeto.

## 13. Próxima aplicación

Esta ficha es el contrato visual de la página de ventas y de todo el producto. La construcción seguirá el orden obligatorio: página de ventas → onboarding → paywall → login/auth → app interna → servicios externos.
