# Especificación de pantalla — Paywall

```yaml
pantalla: paywall_transparente
objetivo: convertir la vista previa personalizada en una prueba informada
objeto_principal: plan anual seleccionado con precio, fecha y consecuencia visibles
jerarquia_tipografica:
  display: 34px
  titulo: 22px
  cuerpo: 16px
  etiqueta: 14px
acento_en: ahorro anual y CTA principal
baseline_aplican: [stagger, tap, barras_timeline, modal, success]
dispositivo_ownable: recetario de tres días que se abre a semana completa, con plato editorial y esquinas recortadas
estados: [empty, loading, success, error, disabled, offline]
```

## Decisiones

- Anual preseleccionado: US$5.83/mes, cobro anual de US$69.90 tras la prueba; dos meses gratis frente al mensual.
- Mensual disponible: US$6.99/mes tras la prueba.
- Prueba: 7 días; fecha de cobro calculada desde el día en que se abre el paywall.
- Visual de valor: tres días visibles y cuatro días bloqueados de forma suave, sin blur engañoso.
- Timeline: hoy acceso completo, día 6 recordatorio, día 7 primer cobro.
- Sin garantía, sello de pago seguro ni testimonio hasta que existan políticas, checkout y evidencia reales.
- Cierre y “Ahora no” vuelven a la muestra en un solo toque.
- El CTA simula localmente el traspaso a Hotmart y declara que no hubo cobro.

