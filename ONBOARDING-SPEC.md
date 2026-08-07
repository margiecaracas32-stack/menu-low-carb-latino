# Especificación de pantalla — Onboarding anónimo

```yaml
pantalla: onboarding_anónimo
objetivo: entregar una primera victoria personalizada antes de pedir pago o registro
objeto_principal: elección activa y vista previa del menú
jerarquía_tipográfica:
  display: 34px
  titulo: 22px
  cuerpo: 16px
  etiqueta: 14px
uso_del_acento: selección activa, progreso y llamada principal
ritmo_visual: bloques cortos, una decisión por pantalla, acción fija y respiración generosa
firma_visual: papel de recetario, platos circulares, esquinas recortadas y sellos editoriales
movimiento:
  entrada: aparición escalonada de opciones
  progreso: barra suave entre decisiones
  generación: anillo y mensajes personalizados por etapas
  éxito: revelado de los tres días y confirmación al sustituir
estados:
  - sin_selección
  - selección_activa
  - acción_deshabilitada
  - cargando
  - éxito
  - error_con_reintento
  - sin_conexión
persistencia: localStorage, sin cuenta y sin datos sensibles
```

## Recorrido

1. Cantidad de personas: 1, 2, 3, 4 o 5+.
2. Ingredientes que se deben evitar: lácteos, huevo, frutos secos, mariscos o ninguno.
3. Tiempo habitual para la cena: hasta 20, hasta 30 o hasta 45 minutos.
4. Reconocimiento: elimina culpa y explica que el sistema reduce decisiones.
5. Generación visible: ajusta porciones, filtra ingredientes y arma tres días.
6. Primera victoria: tres cenas completas, resumen de compra y una sustitución demostrable.

La llamada final conduce al paywall, que se construye en la etapa siguiente.
